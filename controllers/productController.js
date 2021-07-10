const { validationResult } = require('express-validator')

const Product = require('../models/product')
const helpers = require('../helpers/helpers')

const defaultImage = 'public/default_product.png'

exports.postCreateProduct = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    // Delete uploaded image
    if (req.file) {
      helpers.clearImage(req.file.path)
    }
    // Handle error
    const error = new Error('Validation failed')
    error.statusCode = 422
    res.status(422).json({ valError: error, detailedError: errors })
    throw error
  }
  const title = req.body.title
  const unitPrice = req.body.unitPrice * 100
  const cartonPrice = req.body.cartonPrice * 100
  const cartonQuantity = req.body.cartonQuantity
  const stockUnits = req.body.stockUnits
  const stockCartons = req.body.stockCartons
  let imageUrl
  if (req.file) {
    imageUrl = req.file.path
  } else {
    imageUrl = defaultImage
  }
  try {
    const product = new Product({
      title: title,
      prices: [
        { unitPrice: unitPrice },
        { cartonPrice: cartonPrice },
      ],
      cartonQuantity: cartonQuantity,
      imageUrl: imageUrl,
      stockQuantity: [
        { stockUnits: stockUnits },
        { stockCartons: stockCartons }
      ],
      businessId: req.businessId
    })
    const result = await product.save()
    res.status(201).json({
      message: 'Product created successfully',
      productId: result._id
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.getProductsIndex = async (req, res, next) => {
  try {
    const products = await Product.find()
    res.status(200).json({
      message: 'Success',
      products: products
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.editProduct = async (req, res, next) => {
  const prodId = req.params.productId
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    // Delete uploaded image
    if (req.file) {
      helpers.clearImage(req.file.path)
    }
    // Handle error
    const error = new Error('Validation failed')
    error.statusCode = 422
    res.status(422).json({ valError: error, detailedError: errors })
    throw error
  }
  const updatedTitle = req.body.title
  const updatedUnitPrice = req.body.unitPrice * 100
  const updatedCartonPrice = req.body.cartonPrice * 100
  const updatedCartonQuantity = req.body.cartonQuantity
  const updatedStockUnits = req.body.stockUnits
  const updatedStockCartons = req.body.stockCartons
  let imageUrl
  if (req.file) {
    imageUrl = req.file.path
  } else {
    imageUrl = defaultImage
  }
  try {
    const product = await Product.findById(prodId)
    if (!product) {
      // Delete uploaded image
      if (req.file) {
        helpers.clearImage(req.file.path)
      }
      const error = new Error('Product not found')
      error.statusCode = 404
      throw error
    }
    if (req.userRole !== 'admin') {
      // Delete uploaded image
      if (req.file) {
        helpers.clearImage(req.file.path)
      }
      const error = new Error('Not authorized')
      error.statusCode = 403
      throw error
    }
    if (product.imageUrl !== imageUrl && product.imageUrl !== defaultImage) {
      helpers.clearImage(product.imageUrl)
    }
    product.title = updatedTitle
    product.prices = [
      { unitPrice: updatedUnitPrice },
      { cartonPrice: updatedCartonPrice },
    ]
    product.cartonQuantity = updatedCartonQuantity
    product.stockQuantity = [
      { stockUnits: updatedStockUnits },
      { stockCartons: updatedStockCartons }
    ]
    const updatedProduct = await product.save()
    res.status(200).json({
      message: 'Product updated',
      product: updatedProduct
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.deleteProduct = async (req, res, next) => {
  const prodId = req.params.productId
  try {
    const product = await Product.findById(prodId)
    if (!product) {
      const error = new Error('Product not found')
      error.statusCode = 404
      throw error
    }
    if (req.userRole !== 'admin') {
      const error = new Error('Not authorized')
      error.statusCode = 403
      throw error
    }
    helpers.clearImage(product.imageUrl)
    await Product.findByIdAndRemove(prodId)

    res.status(200).json({
      message: 'Success'
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}