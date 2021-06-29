const express = require('express')

const app = express()

app.use('/', () => {
  console.log('Working')
})

app.listen(3000)