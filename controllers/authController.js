const { validationResult } = require("express-validator")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/user')

exports.signup = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed')
    error.statusCode = 422
    error.data = errors.array()
    res.status(422).json({ errors: error })
    throw error
  }
  let imageUrl
  if (req.file) {
    imageUrl = req.file.path
  } else {
    imageUrl = null
  }
  const name = req.body.name
  const email = req.body.email
  const username = req.body.username
  const password = req.body.password
  const role = req.body.role
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
      username: username,
      password: hashedPassword,
      role: role,
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
    const token = jwt.sign({
      email: user.email,
      userId: user._id.toString(),
      userRole: user.role
    }, 'crematorium', { expiresIn: '1h' })
    res.status(200).json({
      token: token,
      userId: user._id.toString(),
      userRole: user.role
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}