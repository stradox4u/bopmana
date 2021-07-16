const jwt = require('jsonwebtoken')

const jwtSecret = process.env.JWT_SECRET
const refreshSecret = process.env.REFRESH_JWT_SECRET

exports.createAccessToken = (email, id, role, busId) => {
  return jwt.sign({
    email: email,
    userId: id,
    userRole: role,
    businessId: busId
  }, jwtSecret, { expiresIn: '10m' })
}

exports.createRefreshToken = (id) => {
  return jwt.sign({ id }, refreshSecret, { expiresIn: '7d' })
}

exports.createVerifyToken = (id) => {
  return jwt.sign({
    userId: id
  }, jwtSecret, { expiresIn: '10m' })
}

exports.createAdminVerifyToken = (userId, busId) => {
  return jwt.sign({
    userId: userId,
    businessId: busId
  }, jwtSecret, { expires: '10m' })
}

exports.createInviteToken = (email, id) => {
  return jwt.sign({
    invitee: email,
    businessId: id
  }, jwtSecret, { expiresIn: '10m' })
}

exports.decodeToken = (token, secret) => {
  const decodedToken = jwt.verify(token, secret)
  if (!decodedToken) {
    const error = new Error('Token verification failed')
    error.statusCode = 401
    throw error
  }
  return decodedToken
}