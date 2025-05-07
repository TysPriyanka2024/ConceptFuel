const multer = require('multer');
const path = require('path');
const express = require('express');
const sharp = require('sharp'); // Import sharp for image compression
const { v4: uuidv4 } = require('uuid'); // Import uuid for unique filenames
const fs = require('fs');

const storage = multer.memoryStorage(); // Use memory storage for image processing

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

const compressImage = async (req, res, next) => {
  try {
    if (!req.files || !req.files.image) {
      // No image provided for update; continue without compression
      return next();
    }

    const imageBuffer = req.files.image[0].buffer;

    // Use sharp to compress the image
    const compressedImageBuffer = await sharp(imageBuffer)
      .resize({ width: 800 }) // You can adjust the width as needed
      .toBuffer();

    // Generate a unique filename using uuid
    const filename = `compressed-${uuidv4()}${path.extname(req.files.image[0].originalname)}`;

    // Save the compressed image to the destination folder
    const imagePath = path.join('./src/uploads/', filename);
    fs.writeFileSync(imagePath, compressedImageBuffer);

    // Update the request object with the compressed image path
    req.body.image = imagePath; // Update the image path in the request body

    next();
  } catch (error) {
    next(error);
  }
};
module.exports = {
  upload: upload,
  compressImage: compressImage,
};
