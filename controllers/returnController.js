const Sale = require('../models/sale')
const Return = require('../models/return')
const Business = require('../models/business')
const eventEmitter = require('../listeners/listeners')

exports.postReturnCreate = async (req, res, next) => {
  const saleId = req.body.saleId
  const products = req.body.products
  const totalPrice = req.body.totalPrice
  const businessId = req.businessId
  const creator = req.userId
  try {
    const sale = await Sale.findById(saleId).populate('creator', 'name')
    if (!sale) {
      const error = new Error('Sale not found')
      error.statusCode = 404
      throw error
    }
    if (creator !== sale.creator.toString() && req.userRole !== 'admin') {
      const error = new Error('Unauthorized')
      error.statusCode = 403
      throw error
    }

    const newReturn = new Return({
      saleId: saleId,
      creator: creator,
      products: products,
      totalPrice: totalPrice,
      businessId: businessId
    })
    const savedReturn = await newReturn.save()
    if (!savedReturn) {
      const error = new Error('Return not saved')
      throw error
    }
    // Save return to the sale
    sale.returns.push(savedReturn._id)
    await sale.save()

    const business = await Business.findById(req.businessId)
      .populate('administrators', 'email')
    if (!business) {
      const error = new Error('Business not found')
      error.statusCode = 404
      throw error
    }

    const baseUrl = process.env.APP_BASE_URL
    eventEmitter.emit('goodsReturned', {
      businessname: business.name,
      recipient: business.administrators[0].email,
      creator: sale.creator.name,
      returnLink: `${baseUrl}/return/${savedReturn._id}`
    })

    res.status(200).json({
      message: 'Return recorded',
      return: savedReturn
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.getReturnIndex = async (req, res, next) => {
  try {
    let returns
    if (req.userRole === 'admin') {
      returns = await Return.find({ businessId: req.businessId })
    } else {
      returns = await Return.find({ creator: req.userId, businessId: req.businessId })
    }
    if (!returns) {
      const error = new Error('No returns found')
      error.statusCode = 404
      throw error
    }
    res.status(200).json({
      message: 'Success',
      returns: returns
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.getReturn = async (req, res, next) => {
  const returnId = req.params.returnId
  try {
    let thisReturn
    if (req.userRole === 'admin') {
      thisReturn = await Return.findOne({
        _id: returnId,
        businessId: req.businessId
      })
    } else {
      thisReturn = await Return.findOne({
        _id: returnId,
        businessId: req.businessId,
        creator: req.userId
      })
    }
    if (!thisReturn) {
      const error = new Error('Return not found')
      error.statusCode = 404
      throw error
    }
    res.status(200).json({
      message: 'Success',
      return: thisReturn
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.patchUpdateReturn = async (req, res, next) => {
  const returnId = req.params.returnId
  try {
    const updatedReturn = await Return.findByIdAndUpdate(returnId, {
      accepted: true,
      acceptedBy: req.userId
    }, { new: true })
    if (!updatedReturn) {
      const error = new Error('Return update failed')
      throw error
    }
    res.status(200).json({
      message: 'Return updated',
      return: updatedReturn
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}