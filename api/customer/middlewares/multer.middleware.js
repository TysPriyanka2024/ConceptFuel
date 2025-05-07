const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const storage = multer.memoryStorage();

const compressAndSaveImage = async (file) => {
  try {
    // Use sharp to compress the image
    const compressedImageBuffer = await sharp(file.buffer)
      .resize({ width: 800 }) // You can adjust the width as needed
      .toBuffer();

    // Generate a unique filename using uuid
    const filename = `compressed-${uuidv4()}${path.extname(file.originalname)}`;

    // Save the compressed image to the destination folder
    const imagePath = path.join('./src/uploads/', filename);
    fs.writeFileSync(imagePath, compressedImageBuffer);

    return imagePath;
  } catch (error) {
    throw error;
  }
};

const fileFilter = (req, file, cb) => {
  try {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];

    if (!allowedMimes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
    }

    // Call the compressAndSaveImage function
    compressAndSaveImage(file)
      .then(compressedImagePath => {
        // Update the request object with the compressed image path
        req.compressedImagePath = compressedImagePath;
        cb(null, true);
      })
      .catch(error => {
        throw error;
      });
  } catch (error) {
    cb(error);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

module.exports = {
  upload: upload,
};
