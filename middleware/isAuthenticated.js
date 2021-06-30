const jwt = require('jsonwebtoken')
require('dotenv').config()

const jwtSecret = process.env.JWT_SECRET

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization')
  if (!authHeader) {
    const error = new Error('No authorization header found')
    error.statusCode = 403
    throw error
  }
  const token = authHeader.split(' ')[1]
  let decodedToken
  try {
    decodedToken = jwt.verify(token, jwtSecret)
  } catch (err) {
    err.statusCode = 500
    throw err
  }
  if (!decodedToken) {
    const error = new Error('Not authenticated')
    error.statusCode = 401
    throw error
  }
  console.log(decodedToken)
  req.userId = decodedToken.userId
  req.userRole = decodedToken.userRole
  next()
}