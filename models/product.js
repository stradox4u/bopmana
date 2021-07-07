const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  prices: [{
    unitPrice: Number,
    cartonPrice: Number,
  }],
  cartonQuantity: {
    type: Number,
    required: true,
  },
  businessId: {
    type: Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  imageUrl: {
    type: String,
    required: false
  },
  stockQuantity: [{
    stockUnits: Number,
    stockCartons: Number
  }],
}, { timestamps: true })

module.exports = mongoose.model('Product', productSchema)