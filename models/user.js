const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'user',
  },
  businessId: {
    type: Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  imageUrl: {
    type: String,
    required: false,
  }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)