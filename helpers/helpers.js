const fs = require('fs')
const path = require('path')

const Product = require('../models/product')

exports.clearImage = (filepath) => {
  const filePath = path.join(__dirname, '../', filepath)
  fs.unlink(filePath, err => console.log(err))
}

exports.decreaseStock = (prods) => {
  prods.forEach(async (prod) => {
    try {
      const product = await Product.findById(prod.productId)
      if (!product) {
        const error = new Error('Product not found')
        error.statusCode = 404
        throw error
      }

      if (product.stockQuantity.stockUnits >= prod.quantity.unitQuantity) {
        product.stockQuantity.stockUnits -= prod.quantity.unitQuantity
      } else {
        const toBreakBox = prod.quantity.unitQuantity - product.stockQuantity.stockUnits
        product.stockQuantity.stockCartons--
        product.stockQuantity.stockUnits = product.cartonQuantity - toBreakBox
      }
      product.stockQuantity.stockCartons -= prod.quantity.cartonQuantity

      await product.save()
    } catch (err) {
      console.log(err)
    }
  })
}