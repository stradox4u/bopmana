const express = require('express')

const saleController = require('../controllers/saleController')
const isAuth = require('../middleware/isAuthenticated')
const inStock = require('../middleware/checkStock')
const isVerified = require('../middleware/userIsVerified')

const router = express.Router()

router.post('/create', isAuth, isVerified, inStock, saleController.createSale)

// Get all sales
router.get('/sales', isAuth, isVerified, saleController.getSalesIndex)

// Get a specific sale
router.get('/:saleId', isAuth, isVerified, saleController.getSale)


module.exports = router