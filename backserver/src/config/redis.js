// server/src/config/redis.js
const redis = require("redis")

const clientConfig = {
  socket: {
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST || "localhost",
    reconnectStrategy: () => false // Disable auto-reconnect to avoid infinite ECONNREFUSED loops if Redis is offline
  }
}

const redisClient = redis.createClient(clientConfig)
const redisPublisher = redis.createClient(clientConfig)
const redisSubscriber = redis.createClient(clientConfig)

redisClient.on("error", (err) => console.log("Redis client error: Connection refused (running without Redis cache)"))
redisPublisher.on("error", (err) => console.log("Redis publisher error: Connection refused (running without Redis cache)"))
redisSubscriber.on("error", (err) => console.log("Redis subscriber error: Connection refused (running without Redis cache)"))

const safeClient = {
  get: async (key) => {
    if (!redisClient.isReady) return null
    try {
      return await redisClient.get(key)
    } catch (e) {
      console.error("Redis GET error:", e)
      return null
    }
  },

  setEx: async (key, time, value) => {
    if (!redisClient.isReady) return
    try {
      await redisClient.setEx(key, time, value)
    } catch (e) {
      console.error("Redis SETEX error:", e)
    }
  },

  del: async (key) => {
    if (!redisClient.isReady) return
    try {
      await redisClient.del(key)
    } catch (e) {
      console.error("Redis DEL error:", e)
    }
  },

  get isReady() {
    return redisClient.isReady
  }
}

const safePublisher = {
  publish: async (channel, message) => {
    if (!redisPublisher.isOpen || !redisPublisher.isReady) {
      // Gracefully do nothing or log a debug warning if offline
      return
    }
    try {
      return await redisPublisher.publish(channel, message)
    } catch (e) {
      console.error("[Redis Publisher] Publish error:", e)
    }
  }
}

const connectRedis = async () => {
  try {
    await redisClient.connect()
    await redisPublisher.connect()
    await redisSubscriber.connect()
    console.log("Redis connected ✅")
  } catch (err) {
    console.warn("⚠️ Warning: Could not connect to Redis. Running without Redis cache.", err.message)
  }
}

module.exports = { safeClient, redisPublisher: safePublisher, redisSubscriber, connectRedis }