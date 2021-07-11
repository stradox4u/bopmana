const mongoose = require('mongoose')

const Schema = mongoose.Schema

const purchaseSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product'
  },
  unitPurchasePrice: {
    type: Number,
    requird: true
  },
  cartonPurchasePrice: {
    type: Number,
    required: true
  },
  unitPurchaseQuantity: {
    type: Number,
    required: false
  },
  cartonPurchaseQuantity: {
    type: Number,
    required: false
  },
  exhausted: {
    type: Boolean,
    default: false
  }
})

module.exports = mongoose.model('Purchase', purchaseSchema)