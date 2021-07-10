const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const eventEmitter = require('../listeners/listeners')

const Business = require('../models/business')
const User = require('../models/user')
const business = require('../models/business')

const defaultBusinessLogo = 'public/default_business.png'
const defaultUserImage = 'public/default_user.png'

exports.postCreateBusiness = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed')
    // Handle error
    error.statusCode = 422
    error.data = errors.array()
    res.status(422).json({ error: error })
    throw error
  }
  const businessName = req.body.businessName
  const businessLogoUrl = defaultBusinessLogo

  const userName = req.body.userName
  const email = req.body.userEmail
  const phoneNumber = req.body.userPhoneNumber
  const password = req.body.password
  const role = 'admin'
  const userImageUrl = defaultUserImage

  try {
    const hashedPassword = await bcrypt.hash(password, 12)
    if (!hashedPassword) {
      const error = new Error('Hashing password failed')
      error.statusCode = 500
      throw error
    }

    const business = new Business({
      name: businessName,
      businessLogoUrl: businessLogoUrl,
    })

    const savedBusiness = await business.save()

    const administrator = new User({
      name: userName,
      email: email,
      phoneNumber: phoneNumber,
      role: role,
      imageUrl: userImageUrl,
      password: hashedPassword,
      businessId: savedBusiness._id
    })
    const savedAdmin = await administrator.save()

    savedBusiness.administrators.push(savedAdmin._id)
    await savedBusiness.save()

    // Create URL to verify email
    const baseUrl = process.env.APP_BASE_URL
    const token = jwt.sign({
      userId: savedAdmin._id.toString(),
      businessId: savedBusiness._id.toString(),
    }, process.env.JWT_SECRET, { expiresIn: '10m' })
    const verifyUrl = `${baseUrl}/auth/verify/email/${token}`

    // Fire event to send verification email
    eventEmitter.emit('sendVerificationEmail', {
      username: savedAdmin.name,
      verifyUrl: verifyUrl,
      recipient: savedAdmin.email
    })

    res.status(201).json({
      message: 'Business created successfully',
      businessId: savedBusiness._id,
      administrator: savedAdmin._id
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.postCreateInvite = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed')
    error.statusCode = 422
    error.data = errors.array()
    res.status(422).json({ error: error })
    throw error
  }
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      const error = new Error('User not found')
      error.statusCode = 404
      throw error
    }

    const business = await Business.findById(req.businessId)
    if (!business) {
      const error = new Error('Business not found')
      error.statusCode = 404
      throw error
    }
    const baseUrl = process.env.APP_BASE_URL
    const token = jwt.sign({
      invitee: req.body.email,
      businessId: business._id.toString()
    }, process.env.JWT_SECRET, { expiresIn: '1h' })
    const inviteUrl = `${baseUrl}/auth/signup/${token}`

    eventEmitter.emit('inviteCreated', {
      username: user.name,
      businessname: business.name,
      recipient: req.body.email,
      inviteUrl: inviteUrl
    })

    res.status(200).json({
      message: 'Invitation email sent'
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}