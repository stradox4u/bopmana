const { validationResult } = require("express-validator")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/user')
const helpers = require('../helpers/helpers')
const eventEmitter = require('../listeners/listeners')

const defaultImage = 'public/default_user.png'
const baseUrl = process.env.APP_BASE_URL

exports.signup = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed')
    // Delete uploaded image
    if (req.file) {
      helpers.clearImage(req.file.path)
    }
    // Handle error
    error.statusCode = 422
    error.data = errors.array()
    res.status(422).json({ error: error })
    throw error
  }
  const token = req.body.token
  let decodedToken
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET)
  } catch (err) {
    err.statusCode = 500
    throw err
  }
  // Check if the entered email is the same as in the token
  if (decodedToken.invitee !== req.body.email) {
    const error = new Error('Wrong email supplied')
    error.statusCode = 401
    throw error
  }
  // Assign defaul image url if none supplied
  let imageUrl
  if (req.file) {
    imageUrl = req.file.path
  } else {
    imageUrl = defaultImage
  }
  const name = req.body.name
  const email = req.body.email
  const phonenumber = req.body.phoneNumber
  const password = req.body.password
  const businessId = decodedToken.businessId
  try {
    const hashedPassword = await bcrypt.hash(password, 12)
    if (!hashedPassword) {
      const error = new Error('Hashing password failed')
      error.statusCode = 500
      throw error
    }

    const user = new User({
      name: name,
      email: email,
      phoneNumber: phonenumber,
      password: hashedPassword,
      businessId: businessId,
      imageUrl: imageUrl
    })
    const result = await user.save()
    res.status(201).json({
      message: 'User created successfully',
      userId: result._id
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.login = async (req, res, next) => {
  const email = req.body.email
  const password = req.body.password

  try {
    const user = await User.findOne({ email: email })
    if (!user) {
      const error = new Error('A user with this email does not exist')
      error.statusCode = 404
      throw error
    }
    const isEqual = await bcrypt.compare(password, user.password)

    if (!isEqual) {
      const error = new Error('Wrong password')
      error.statusCode = 401
      throw error
    }

    const jwtSecret = process.env.JWT_SECRET
    const token = jwt.sign({
      email: user.email,
      userId: user._id.toString(),
      userRole: user.role,
      businessId: user.businessId.toString()
    }, jwtSecret, { expiresIn: '1h' })
    res.status(200).json({
      token: token,
      userId: user._id.toString(),
      userRole: user.role,
      businessId: user.businessId.toString()
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.putVerifyEmail = async (req, res, next) => {
  const token = req.body.token

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

  if (!decodedToken) {
    const error = new Error('Token verification failed')
    error.statusCode = 401
    throw error
  }
  const userId = decodedToken.userId

  try {
    await User.findByIdAndUpdate(userId, { emailVerifiedAt: new Date() })

    res.status(204).json({
      message: 'Email verified successfully'
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.resendVerificationMail = async (req, res, next) => {
  const userId = req.params.userId
  try {
    const user = await User.findById(userId)

    if (!user) {
      const error = new Error('User not found')
      error.statusCode = 404
      throw error
    }

    const token = jwt.sign({
      userId: user._id.toString(),
    }, process.env.JWT_SECRET, { expiresIn: '10m' })
    const verifyUrl = `${baseUrl}/auth/verify/email/${token}`

    eventEmitter.emit('sendVerificationEmail', {
      username: user.name,
      verifyUrl: verifyUrl,
      recipient: user.email
    })

    res.status(200).json({
      message: 'Verification email sent successfully'
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.postPasswordReset = async (req, res, next) => {
  const email = req.body.email

  try {
    const user = await User.findOne({ email })
    if (!user) {
      const error = new Error('Email not linked to any account')
      error.statusCode = 404
      throw error
    }
    const token = jwt.sign({
      userId: user._id.toString(),
    }, process.env.JWT_SECRET, { expiresIn: '1h' })
    // Save the token to the user
    user.passwordResetToken = token
    await user.save()

    const resetUrl = `${baseUrl}/auth/password/update/${token}`

    eventEmitter.emit('resetPassword', {
      username: user.name,
      resetUrl: resetUrl,
      recipient: user.email
    })
    res.status(200).json({
      message: 'Password reset email sent'
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.patchUpdatePassword = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed')
    error.statusCode = 422
    error.data = errors.array()
    res.status(422).json({ error: error })
    throw error
  }
  const token = req.body.token
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
  if (!decodedToken) {
    const error = new Error('Token verification failed')
    error.statusCode = 401
    throw error
  }
  const userId = decodedToken.userId
  const password = req.body.password

  try {
    const resetUser = await User.findOne({ passwordResetToken: token })
    if (!resetUser) {
      return res.status(404).json({
        message: 'User not found'
      })
    }
    if (resetUser._id.toString() !== userId.toString()) {
      return res.status(401).json({
        message: 'Unauthorized reset request'
      })
    }

    const hashedPw = await bcrypt.hash(password, 12)
    if (!hashedPw) {
      const error = new Error('Password hashing failed')
      throw error
    }
    const user = await User.findByIdAndUpdate(userId, { password: hashedPw, passwordResetToken: null })

    eventEmitter.emit('passwordUpdated', {
      username: user.name,
      recipient: user.email
    })

    return res.status(200).json({
      message: 'Password updated successfully'
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}