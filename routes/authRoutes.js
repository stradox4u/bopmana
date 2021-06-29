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
  body('username').trim().isString().isLength({ min: 5 }),
  body('password').trim().isLength({ min: 6 }),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match')
    } else {
      return true
    }
  }),
  body('role').trim().isString().not().isEmpty(),
],
  authController.signup
)

router.post('/login', authController.login)

module.exports = router