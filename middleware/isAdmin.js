const jwt = require('jsonwebtoken')

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
  if (decodedToken.userRole !== 'admin') {
    const error = new Error('Not authorized')
    error.statusCode = 403
    throw error
  }

  req.businessId = decodedToken.businessId
  next()
}