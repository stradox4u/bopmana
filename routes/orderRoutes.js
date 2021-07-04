const express = require('express')

const orderController = require('../controllers/orderController')
const isAuth = require('../middleware/isAuthenticated')
const inStock = require('../middleware/checkStock')

const router = express.Router()

router.post('/create', isAuth, inStock, orderController.createOrder)

// Get all orders
router.get('/orders', isAuth, orderController.getOrdersIndex)

// Get a specific order
router.get('/:orderId', isAuth, orderController.getOrder)


module.exports = router