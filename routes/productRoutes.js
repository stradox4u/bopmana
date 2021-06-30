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

router.get('/products', isAuth, productController.getProductsIndex)

router.patch('/product/:productId', isAuth, [
  body('title').trim().isString().isLength({ min: 3 }).custom((value, { req }) => {
    return Product.find({ title: value })
      .then(foundProducts => {
        if (foundProducts.find(e => e._id.toString() !== req.body.productId)) {
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
  productController.editProduct
)

router.delete('/product/:productId', isAuth, productController.deleteProduct)

module.exports = router