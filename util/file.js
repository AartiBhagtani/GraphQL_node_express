const path = require('path');
const fs = require('fs');

const clearImage = filePath => {
  filepath = path.join(__dirname, '..', filePath);
  fs.unlink(filepath, err => {console.log(err)});
} 

exports.clearImage = clearImage