const express = require('express')
const { body } = require('express-validator')

const productController = require('../controllers/productController')
const isAuth = require('../middleware/isAuthenticated')
const isAdmin = require('../middleware/isAdmin')
const isVerified = require('../middleware/userIsVerified')
const Product = require('../models/product')

const router = express.Router()

router.post('/create', isAuth, isAdmin, isVerified, [
  body('title').trim().isString().isLength({ min: 3 }).custom((value, { req }) => {
    return Product.findOne({ title: value })
      .then(foundProduct => {
        if (foundProduct) {
          return Promise.reject('Product title is already taken')
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

router.get('/products', isAuth, isVerified, productController.getProductsIndex)

router.patch('/product/:productId', isAuth, isAdmin, isVerified, [
  body('title').trim().isString().isLength({ min: 3 }).custom((value, { req }) => {
    return Product.find({ title: value })
      .then(foundProducts => {
        if (foundProducts.find(e => e._id.toString() !== req.body.productId)) {
          return Promise.reject('Product title is already taken')
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

router.delete('/product/:productId',
  isAuth,
  isAdmin,
  isVerified,
  productController.deleteProduct
)

module.exports = router