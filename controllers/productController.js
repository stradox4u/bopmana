const { validationResult } = require('express-validator')

const Product = require('../models/product')

exports.postCreateProduct = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed')
    error.statusCode = 422
    res.status(422).json({ valError: error, detailedError: errors })
    throw error
  }
  const title = req.body.title
  const unitPrice = req.body.unitPrice * 100
  const cartonPrice = req.body.cartonPrice * 100
  const halfCartonPrice = req.body.halfCartonPrice * 100
  const cartonQuantity = req.body.cartonQuantity
  const stockUnits = req.body.stockUnits
  const stockCartons = req.body.stockCartons
  let imageUrl
  if (req.file) {
    imageUrl = req.file.path
  } else {
    imageUrl = null
  }
  try {
    const product = new Product({
      title: title,
      prices: [
        { unitPrice: unitPrice },
        { cartonPrice: cartonPrice },
        { halfCartonPrice: halfCartonPrice },
      ],
      cartonQuantity: cartonQuantity,
      imageUrl: imageUrl,
      stockQuantity: [
        { stockUnits: stockUnits },
        { stockCartons: stockCartons }
      ]
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