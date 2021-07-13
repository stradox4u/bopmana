const express = require('express')
const { body } = require('express-validator')

const authController = require('../controllers/authController')
const User = require('../models/user')

const router = express.Router()

router.post('/signup', [
  body('name').trim().isString().isLength({ min: 2 }).withMessage('Name must be min. 2 characters'),
  body('email').isEmail().withMessage('Please enter a valid email address')
    .custom((value, { req }) => {
      return User.findOne({ email: value })
        .then(userDoc => {
          if (userDoc) {
            return Promise.reject('Email is already taken')
          }
        })
    }).normalizeEmail(),
  body('token').trim().isString().not().isEmpty().withMessage('Token not supplied'),
  body('phoneNumber').trim().isString().isLength({ min: 11, max: 13 }).withMessage('Phone number is not valid'),
  body('password').trim().isLength({ min: 6 }).withMessage('Password must be min. 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match')
    } else {
      return true
    }
  }),
],
  authController.signup
)

router.post('/login', authController.login)

router.put('/verify/email', authController.putVerifyEmail)

router.post('/verify/email/:userId', authController.resendVerificationMail)

router.post('/password/reset', authController.postPasswordReset)

router.patch('/password/update', [
  body('password').trim().isLength({ min: 6 }),
  body('confirmPassword').custom((val, { req }) => {
    if (val !== req.body.password) {
      throw new Error('Passwords do not match')
    } else {
      return true
    }
  })
],
  authController.patchUpdatePassword
)

router.post('/tokens/refresh', authController.postRefreshTokens)

module.exports = router