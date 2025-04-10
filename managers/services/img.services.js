const fs = require('fs');
const path = require('path')
const { error } = require("console");

function deleteImageFile(filename) {
  const imagePath = path.join(__dirname, '../../src/uploads', filename);

  if (fs.existsSync(imagePath)) {
    try {
      fs.unlinkSync(imagePath);
      console.log('Image file deleted successfully:', imagePath);
    } catch (err) {
      console.error('Error while deleting image file:', err.message);
    }
  } else {
    console.warn('Image file not found:', imagePath);
  }
}


module.exports = {
    deleteImageFile
}