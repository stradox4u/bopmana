const mongoose = require('mongoose')

const Schema = mongoose.Schema

const businessSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  businessLogoUrl: {
    type: String,
    required: false
  },
  address: {
    street1: String,
    street2: String,
    city: String,
    state: String
  },
  staff: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  }],
  administrators: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }],
  subscriptionPlan: {
    type: String,
    default: 'free'
  },
  subscriptionActive: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

module.exports = mongoose.model('Business', businessSchema)