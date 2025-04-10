const multer = require('multer');
const path = require('path');
const express = require("express");
const app = express();
const fs = require('fs');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const maincategory = req.body.maincategory || 'default';
        const subcategory = req.body.subcategory || 'default';
        const destinationPath = `./src/uploads/${maincategory}/${subcategory}/`; // Adjust destination path according to req.main and req.secondary
        fs.mkdirSync(destinationPath, { recursive: true }); // Create directory if it doesn't exist
        cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + '-' + Date.now() + path.extname(file.originalname)
        );
    },
});


module.exports = {
    upload: multer({ storage })
};