const fs = require('fs')
const path = require('path')

exports.clearImage = (filepath) => {
  filePath = path.join(__dirname, '../', filepath)
  console.log(filePath)
  fs.unlink(filePath, err => console.log(err))
}