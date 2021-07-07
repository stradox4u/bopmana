const mongoose = require('mongoose')

const Schema = mongoose.Schema

const businessSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  businessLogoUrl: {
    type: String,
    required: true
  },
  staff: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  administrators: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
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