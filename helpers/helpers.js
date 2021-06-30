const fs = require('fs')
const path = require('path')

exports.clearImage = (filepath) => {
  const filePath = path.join(__dirname, '../', filepath)
  fs.unlink(filePath, err => console.log(err))
}