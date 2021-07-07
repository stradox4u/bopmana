const mongoose = require('mongoose')

const Schema = mongoose.Schema

const expenseSchema = new Schema({
  approved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    userId: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  businessId: {
    type: Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  }
})

module.exports = mongoose.model('Expense', expenseSchema)