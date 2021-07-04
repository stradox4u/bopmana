const { validationResult } = require('express-validator')

const helpers = require('../helpers/helpers')
const Order = require('../models/order')

exports.createOrder = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed')
    error.statusCode = 422
    res.status(422).json({ valError: error, detailedError: errors })
    throw error
  }

  const creator = req.body.creator
  const products = req.body.products
  const totalPrice = req.body.totalPrice * 100

  try {
    // Decrement stock of each product
    helpers.decreaseStock(products)

    // Create and store the order
    const order = new Order({
      creator: creator,
      products: products,
      totalPrice: totalPrice,
    })
    const savedOrder = await order.save()

    return res.status(201).json({
      message: 'Order saved successfully',
      orderId: savedOrder._id
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.getOrdersIndex = async (req, res, next) => {
  try {
    const orders = await Order.find()
    if (!orders) {
      const error = new Error('Could not fetch orders')
      error.statusCode = 404
      throw error
    }
    res.status(200).json({
      message: 'Success',
      orders: orders
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.getOrder = async (req, res, next) => {
  const orderId = req.params.orderId

  try {
    const order = await Order.findById(orderId)
    if (!order) {
      const error = new Error('Order not found')
      error.statusCode = 404
      throw error
    }
    res.status(200).json({
      message: 'Success',
      order: order
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}