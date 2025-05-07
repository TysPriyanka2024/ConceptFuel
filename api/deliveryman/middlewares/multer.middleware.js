const multer = require('multer');
const path = require('path');
const express = require("express");
const app = express();
const fs = require('fs');


const storage = multer.diskStorage({
    destination: './src/uploads/',
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

  
  
  
  
