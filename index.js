const express = require('express')

const authRoutes = require('./routes/authRoutes')

const app = express()

app.use('/auth', authRoutes)

app.use('/', () => {
  console.log('Working')
})


app.listen(3000)