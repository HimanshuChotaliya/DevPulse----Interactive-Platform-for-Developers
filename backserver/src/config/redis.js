// backserver/src/config/redis.js
const redis = require("redis")

const clientConfig = {
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    reconnectStrategy: () => false
  }
}

const redisClient = redis.createClient(clientConfig)
const redisPublisher = redis.createClient(clientConfig)
const redisSubscriber = redis.createClient(clientConfig)

redisClient.on("error", () => console.log("Redis client error: running without Redis cache"))
redisPublisher.on("error", () => console.log("Redis publisher error: running without Redis cache"))
redisSubscriber.on("error", () => console.log("Redis subscriber error: running without Redis cache"))

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
    if (!redisPublisher.isOpen || !redisPublisher.isReady) return
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