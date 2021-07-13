const mongoose = require('mongoose')

const Schema = mongoose.Schema

const returnSchema = new Schema({
  businessId: {
    type: Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  saleId: {
    type: Schema.Types.ObjectId,
    ref: 'Sale',
    required: true
  },
  products: [{
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    price: {
      unitPrice: Number,
      cartonPrice: Number
    },
    quantity: {
      unitQuantity: Number,
      cartonQuantity: Number,
    },
    subtotalPrice: {
      type: Number,
      required: true
    }
  }],
  totalPrice: {
    type: Number,
    required: true
  },
  accepted: {
    type: Boolean,
    default: false
  },
  acceptedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
})

module.exports = mongoose.model('Return', returnSchema)