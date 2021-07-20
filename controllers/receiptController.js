const Sale = require('../models/sale')

exports.getReceipt = async (req, res, next) => {
  const saleId = req.params.saleId
  const sale = await Sale.findById(saleId)
    .populate('businessId', ['name', 'address'])
    .populate('creator', 'name')
    .populate('products.productId', 'title')
  if (!sale) {
    const error = new Error('Sale not found')
    error.statusCode = 404
    throw error
  }
  res.status(200).json({ sale })
}