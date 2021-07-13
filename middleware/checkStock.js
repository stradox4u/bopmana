const Product = require('../models/product')

module.exports = (req, res, next) => {
  const products = req.body.products
  const errors = []
  products.forEach((product, index) => {
    return Product.findById(product.productId)
      .then(foundProduct => {
        if (foundProduct.stockQuantity.stockUnits < req.body.products[index].quantity.unitQuantity &&
          (foundProduct.stockQuantity.stockCartons < req.body.products[index].quantity.cartonQuantity ||
            foundProduct.stockQuantity.stockCartons == 0)) {
          const error = new Error('Insufficient stock')
          error.statusCode = 422
          errors.push(error)
          throw error
        }
      })
      .catch(err => {
        next(err)
      })
  })
  next()
}