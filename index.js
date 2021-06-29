const express = require('express')
const mongoose = require('mongoose')

const authRoutes = require('./routes/authRoutes')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
})

app.use('/auth', authRoutes)

app.use('/', () => {
  console.log('Working')
})

mongoose.connect('mongodb+srv://stradox:lV7herVan0r0ss@cluster0.tilxb.mongodb.net/bopmana?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(result => {
    // console.log(result)
    app.listen(8080)
  })
  .catch(err => console.log(err))