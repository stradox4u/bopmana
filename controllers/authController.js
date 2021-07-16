const { validationResult } = require("express-validator")
const bcrypt = require('bcryptjs')

const User = require('../models/user')
const helpers = require('../helpers/helpers')
const eventEmitter = require('../listeners/listeners')
const jwtHelpers = require('../helpers/jwtHelpers')
const cookieHelpers = require('../helpers/refreshCookieHelpers')

const defaultImage = 'public/default_user.png'
const baseUrl = process.env.APP_BASE_URL

const jwtSecret = process.env.JWT_SECRET
const refreshSecret = process.env.REFRESH_JWT_SECRET

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
  const decodedToken = jwtHelpers.decodeToken(token, jwtSecret)

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

    const token = jwtHelpers.createAccessToken(
      user.email,
      user._id.toString(),
      user.role,
      user.businessId.toString()
    )

    const refreshToken = jwtHelpers.createRefreshToken(user._id.toString())
    user.refreshToken = refreshToken
    await user.save()

    const expiration = cookieHelpers.getExpiry()

    res.cookie('refresh_cookie', refreshToken, {
      expires: expiration,
      httpOnly: true
    })
      .status(200).json({
        token: token,
        expires_in: 600_000,
        username: user.name,
        userId: user._id.toString(),
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

  const decodedToken = jwtHelpers.decodeToken(token, jwtSecret)

  const userId = decodedToken.userId

  try {
    await User.findByIdAndUpdate(userId, { emailVerifiedAt: new Date() })

    res.status(200).json({
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

    const token = jwtHelpers.createVerifyToken(
      user._id.toString(),
      user.businessId.toString()
    )
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
    const token = jwtHelpers.createVerifyToken(
      user._id.toString(),
      user.businessId.toString()
    )

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
  const decodedToken = jwtHelpers.decodeToken(token, jwtSecret)

  const userId = decodedToken.userId
  const password = req.body.password

  try {
    const resetUser = await User.findOne({ _id: userId, passwordResetToken: token })
    if (!resetUser) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    const hashedPw = await bcrypt.hash(password, 12)
    if (!hashedPw) {
      const error = new Error('Password hashing failed')
      throw error
    }
    resetUser.password = hashedPw
    resetUser.passwordResetToken = null
    const user = await resetUser.save()

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

exports.postRefreshTokens = async (req, res, next) => {
  const refToken = req.cookies.refresh_cookie

  const decodedToken = jwtHelpers.decodeToken(refToken, refreshSecret)
  const userId = decodedToken.id
  try {
    const user = await User.findOne({
      _id: userId,
      refreshToken: refToken
    })
    if (!user) {
      const error = new Error('User not found')
      error.statusCode = 404
      throw error
    }
    const token = jwtHelpers.createAccessToken(
      user.email,
      user._id.toString(),
      user.role,
      user.businessId.toString()
    )

    const refreshToken = jwtHelpers.createRefreshToken(user._id.toString())

    user.refreshToken = refreshToken
    await user.save()

    res.cookie('refresh_cookie', refreshToken, {
      expires: cookieHelpers.getExpiry(),
      httpOnly: true
    })
      .status(200).json({
        token,
        expires_in: 600_000
      })
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500
    }
    throw error
  }
}