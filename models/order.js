const mongoose = require('mongoose')
const Schema = mongoose.Schema

const orderSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: [{
      unitQuantity: Number,
      cartonQuantity: Number,
      halfCartonQuantity: Number,
    }]
  }],
  totalPrice: {
    type: Number,
    required: true,
  }
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)