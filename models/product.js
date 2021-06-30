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
    halfCartonPrice: Number
  }],
  cartonQuantity: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
    required: false
  },
  stockQuantity: [{
    stockUnits: Number,
    stockCartons: Number
  }],
})

module.exports = mongoose.model('Product', productSchema)