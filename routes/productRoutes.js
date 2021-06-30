const express = require('express')
const { body } = require('express-validator')

const productController = require('../controllers/productController')
const isAuth = require('../middleware/isAuthenticated')
const Product = require('../models/product')

const router = express.Router()

router.post('/create', isAuth, [
  body('title').trim().isString().isLength({ min: 3 }).custom((value, { req }) => {
    return Product.findOne({ title: value })
      .then(foundProduct => {
        if (foundProduct) {
          throw new Error('Product title is already taken')
        } else {
          return true
        }
      })
  }),
  body('unitPrice').isNumeric(),
  body('cartonPrice').isNumeric(),
  body('halfCartonPrice').isNumeric(),
  body('cartonQuantity').isNumeric(),
  body('stockUnits').isNumeric(),
  body('stockCartons').isNumeric()
],
  productController.postCreateProduct
)

module.exports = router