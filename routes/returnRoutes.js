const express = require('express')

const isAuth = require('../middleware/isAuthenticated')
const isVerified = require('../middleware/userIsVerified')
const isAdmin = require('../middleware/isAdmin')
const returnController = require('../controllers/returnController')

const router = express.Router()

router.post('/create', isAuth, isVerified, returnController.postReturnCreate)

router.get('/returns', isAuth, isVerified, returnController.getReturnIndex)

router.get('/:returnId', isAuth, isVerified, returnController.getReturn)

router.patch('/:returnId', isAuth, isAdmin, isVerified, returnController.patchUpdateReturn)

module.exports = router