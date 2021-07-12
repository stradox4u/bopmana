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

      if (product.stockQuantity[0].stockUnits >= prod.quantity[0].unitQuantity) {
        product.stockQuantity[0].stockUnits -= prod.quantity[0].unitQuantity
      } else {
        const toBreakBox = prod.quantity[0].unitQuantity - product.stockQuantity[0].stockUnits
        product.stockQuantity[1].stockCartons--
        product.stockQuantity[0].stockUnits = product.cartonQuantity - toBreakBox
      }
      product.stockQuantity[1].stockCartons -= prod.quantity[1].cartonQuantity

      await product.save()
    } catch (err) {
      console.err(err)
    }
  })
}