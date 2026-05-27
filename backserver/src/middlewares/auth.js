const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next) => {
  // 1. Try to get token from cookies
  let token = req.cookies?.token

  // 2. Try to get token from Authorization header
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1]
  }

  if (!token) {
    return res.status(401).json({
      status: 401,
      message: "Access denied. No active session (invalid cookies or token). Please login."
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // decoded contains { email, id }
    next()
  } catch (err) {
    return res.status(401).json({
      status: 401,
      message: "Invalid session cookie or token. Please login again."
    })
  }
}

module.exports = authMiddleware
