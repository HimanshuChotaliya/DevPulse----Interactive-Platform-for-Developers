// server/src/socket/index.js
const WebSocket = require("ws")
const jwt = require("jsonwebtoken")
const { redisSubscriber } = require("../config/redis")
const { markUserActiveService, markUserInactiveService } = require("../models/presenceModel")

const getUserIdFromRequest = (req) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    
    // 1. Try token in search parameter
    const tokenParam = url.searchParams.get("token");
    if (tokenParam && tokenParam !== 'null' && tokenParam !== 'undefined' && tokenParam !== '') {
      try {
        const decoded = jwt.verify(tokenParam, process.env.JWT_SECRET || 'my_super_secret_key');
        if (decoded && decoded.id) return decoded.id;
      } catch (err) {
        console.warn("WS auth failed for token query param:", err.message);
      }
    }
    
    // 2. Try user_id in search parameter (fallback)
    const userIdParam = url.searchParams.get("user_id");
    if (userIdParam && userIdParam !== 'null' && userIdParam !== 'undefined' && userIdParam !== '') {
      return userIdParam;
    }

    // 3. Try token in cookie
    if (req.headers.cookie) {
      const cookies = Object.fromEntries(
        req.headers.cookie.split(";").map(c => {
          const [key, ...val] = c.trim().split("=");
          return [key, val.join("=")];
        })
      );
      if (cookies.token && cookies.token !== 'null' && cookies.token !== 'undefined' && cookies.token !== '') {
        try {
          const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET || 'my_super_secret_key');
          if (decoded && decoded.id) return decoded.id;
        } catch (err) {
          console.warn("WS auth failed for cookie token:", err.message);
        }
      }
    }
  } catch (err) {
    console.error("Error authenticating WebSocket connection:", err);
  }
  return null;
};

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server })

  // map of user_id -> Set of ws connections
  const clients = new Map()

  // subscribe to Redis channel ONCE if Redis is connected
  if (redisSubscriber.isOpen && redisSubscriber.isReady) {
    redisSubscriber.subscribe("devpulse_events", (message) => {
      // broadcast to all connected WebSocket clients
      clients.forEach((wsSet) => {
        wsSet.forEach((ws) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(message)
          }
        })
      })
    })
  } else {
    console.warn("⚠️ Warning: Redis is offline. WS multi-node sync disabled (running in single-instance mode).")
  }

  wss.on("connection", async (ws, req) => {
    const user_id = getUserIdFromRequest(req)  // parse JWT from cookie or query param
    if (!user_id) return ws.close()

    // Check if this is the first connection for this user
    const isFirstConnection = !clients.has(user_id) || clients.get(user_id).size === 0;

    if (isFirstConnection) {
      clients.set(user_id, new Set())
      // mark online in DB using the presence model service
      await markUserActiveService(user_id)
    }

    // store connection in the Set
    clients.get(user_id).add(ws)

    // broadcast USER_ONLINE (only on first connection)
    if (isFirstConnection) {
      broadcast(clients, {
        type: "USER_ONLINE",
        payload: { user_id, is_online: true }
      })
    }

    // handle disconnect
    ws.on("close", async () => {
      const wsSet = clients.get(user_id)
      if (wsSet) {
        wsSet.delete(ws)
        if (wsSet.size === 0) {
          clients.delete(user_id)

          // mark offline in DB using the presence model service
          await markUserInactiveService(user_id)

          broadcast(clients, {
            type: "USER_OFFLINE",
            payload: { user_id, is_online: false, last_seen: new Date() }
          })
        }
      }
    })
  })
}

const broadcast = (clients, message) => {
  const data = JSON.stringify(message)
  clients.forEach((wsSet) => {
    wsSet.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data)
      }
    })
  })
}

module.exports = setupWebSocket