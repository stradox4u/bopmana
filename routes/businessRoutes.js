const express = require('express')
const { body } = require('express-validator')

const Business = require('../models/business')
const businessController = require('../controllers/businessController')
const User = require('../models/user')

const router = express.Router()

router.post('/create', [
  body('businessName').trim().isString().isLength({ min: 5 })
    .withMessage('Business name must be min. 5 characters')
    .custom((val, { req }) => {
      return Business.findOne({ name: val })
        .then(businessDoc => {
          if (businessDoc) {
            return Promise.reject('Business has registered already')
          }
        })
    }),
  body('userName').trim().isString().isLength({ min: 5 }).withMessage('User name must be min. 5 characters'),
  body('userEmail').trim().isEmail().withMessage('Please enter a valid email')
    .custom((val, { req }) => {
      return User.findOne({ email: val })
        .then(userDoc => {
          if (userDoc) {
            return Promise.reject('Email is already registered')
          }
        })
    })
    .normalizeEmail(),
  body('userPhoneNumber').trim().isString().isLength({ min: 11, max: 13 }).withMessage('Please enter a valid phone number')
    .custom((val, { req }) => {
      return User.findOne({ phoneNumber: val })
        .then(userDoc => {
          if (userDoc) {
            return Promise.reject('Phone number is already registered')
          }
        })
    }),
  body('userAlias').trim().isString().isLength({ min: 3 }).withMessage('Your username must be min. 3 characters'),
  body('password').trim().isString().isLength({ min: 6 }).withMessage('Password must be min. 6 characters'),
  body('confirmPassword').trim().custom((val, { req }) => {
    if (val !== req.body.password) {
      throw new Error('Passwords do not match')
    } else {
      return true
    }
  })
], businessController.postCreateBusiness)

module.exports = router