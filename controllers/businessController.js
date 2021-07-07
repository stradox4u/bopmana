const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')

const Business = require('../models/business')
const User = require('../models/user')

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
  const userAlias = req.body.userAlias
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
      username: userAlias,
      phoneNumber: phoneNumber,
      role: role,
      imageUrl: userImageUrl,
      password: hashedPassword,
      businessId: savedBusiness._id
    })
    const savedAdmin = await administrator.save()

    savedBusiness.administrators.push(savedAdmin._id)
    await savedBusiness.save()
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

exports.getBusiness = (req, res, next) => {

}