const mongoose = require('mongoose')
const Schema = mongoose.Schema

const saleSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessId: {
    type: Schema.Types.ObjectId,
    ref: 'Business',
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
      cartonPrice: Number,
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
  returns: [{
    type: Schema.Types.ObjectId,
    ref: 'Return',
    required: false
  }],
  paid: {
    type: String,
    default: 'full'
  },
  amountPaid: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true,
  }
}, { timestamps: true })

module.exports = mongoose.model('Sale', saleSchema)