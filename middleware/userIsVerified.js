const User = require('../models/user')

module.exports = (req, res, next) => {
  return User.findById(req.userId)
    .then(userDoc => {
      if (!userDoc) {
        const error = new Error('User not found')
        error.statusCode = 404
        throw error
      }
      if (userDoc.emailVerifiedAt === null) {
        const error = new Error('Email not verified')
        error.statusCode = 401
        throw error
      }
      next()
    })
    .catch(err => {
      next(err)
    })
}