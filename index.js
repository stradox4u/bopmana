const path = require('path')
require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
const cookieParser = require('cookie-parser')

const authRoutes = require('./routes/authRoutes')
const productRoutes = require('./routes/productRoutes')
const saleRoutes = require('./routes/saleRoutes')
const businessRoutes = require('./routes/businessRoutes')
const returnRoutes = require('./routes/returnRoutes')
const receiptRoutes = require('./routes/receiptRoutes')

const app = express()

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images')
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(multer({
  storage: fileStorage,
  fileFilter: fileFilter
}).single('image'))
app.use(cookieParser())
app.use('/public', express.static(path.join(__dirname, 'public')))

const corsAllow = process.env.CORS_ALLOW
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', `${corsAllow}`)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  next()
})

app.use('/auth', authRoutes)
app.use('/product', productRoutes)
app.use('/sale', saleRoutes)
app.use('/business', businessRoutes)
app.use('/return', returnRoutes)
app.use('/receipt', receiptRoutes)

app.use((error, req, res, next) => {
  const status = error.statusCode || 500
  const message = error.message
  const data = error.data
  res.status(status).json({ message: message, data: data })
})

const dbUrl = process.env.DATABASE_URL

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
  .then(result => {
    // console.log(result)
    app.listen(process.env.PORT)
  })
  .catch(err => console.log(err))