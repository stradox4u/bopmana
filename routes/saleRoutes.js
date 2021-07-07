const express = require('express')

const saleController = require('../controllers/saleController')
const isAuth = require('../middleware/isAuthenticated')
const inStock = require('../middleware/checkStock')

const router = express.Router()

router.post('/create', isAuth, inStock, saleController.createSale)

// Get all sales
router.get('/sales', isAuth, saleController.getSalesIndex)

// Get a specific sale
router.get('/:saleId', isAuth, saleController.getSale)


module.exports = router