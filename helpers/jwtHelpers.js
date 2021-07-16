const jwt = require('jsonwebtoken')

const jwtSecret = process.env.JWT_SECRET
const refreshSecret = process.env.REFRESH_JWT_SECRET

exports.createAccessToken = (email, id, role, busId) => {
  return jwt.sign({
    email, id, role, busId
  }, jwtSecret, { expiresIn: '10m' })
}

exports.createRefreshToken = (id) => {
  return jwt.sign({ id }, refreshSecret, { expiresIn: '7d' })
}