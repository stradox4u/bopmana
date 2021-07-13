const { validationResult } = require('express-validator')

const helpers = require('../helpers/helpers')
const Sale = require('../models/sale')

exports.createSale = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed')
    error.statusCode = 422
    res.status(422).json({ valError: error, detailedError: errors })
    throw error
  }

  const creator = req.userId
  const products = req.body.products
  const totalPrice = req.body.totalPrice * 100
  const amountPaid = req.body.amountPaid * 100
  const businessId = req.businessId

  try {
    // Decrement stock of each product
    helpers.decreaseStock(products)

    // Create and store the sale
    const sale = new Sale({
      creator: creator,
      products: products,
      totalPrice: totalPrice,
      businessId: businessId,
      amountPaid: amountPaid
    })
    const savedSale = await sale.save()

    return res.status(201).json({
      message: 'Sale saved successfully',
      saleId: savedSale._id
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.getSalesIndex = async (req, res, next) => {
  try {
    let sales
    if (req.userRole === 'admin') {
      sales = await Sale.find({ businessId: req.businessId })
    } else {
      sales = await Sale.find({ businessId: req.businessId, creator: req.userId })
    }
    if (!sales) {
      const error = new Error('Could not fetch sales')
      error.statusCode = 404
      throw error
    }
    res.status(200).json({
      message: 'Success',
      sales: sales
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.getSale = async (req, res, next) => {
  const saleId = req.params.saleId

  try {
    const sale = await Sale.findById(saleId)
    if (!sale) {
      const error = new Error('Sale not found')
      error.statusCode = 404
      throw error
    }
    if (sale.businessId.toString() !== req.businessId.toString()) {
      const error = new Error('You cannot access this resource')
      error.statusCode = 403
      throw error
    }
    if (sale.creator.toString() !== req.userId.toString()
      && req.userRole !== 'admin'
    ) {
      const error = new Error('You cannot access this resource')
      error.statusCode = 403
      throw error
    }
    res.status(200).json({
      message: 'Success',
      sale: sale
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}
