const path = require('path')
const router = require('express').Router();
const multer = require('multer');
const multerS3 = require('multer-s3');
const { s3Client , PRIVATE_BUCKET, REGION  } = require('../../../managers/utils/s3Client');
const { v4: uuidv4 } = require('uuid');

const generateFilename = ({ fieldname, originalname, encoding, mimetype }) => {
  const ext = path.extname(originalname);
  console.log('originalname ====>', originalname, ext);
  return `${uuidv4()}${ext}`; 
}
const parentDirPathInS3 = ({maincategory, subcategory}) => {
  return `uploads/${maincategory}/${subcategory}/`;
} 

const privatebucketupload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: PRIVATE_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const filepath = parentDirPathInS3(req.body) + generateFilename(file);
      cb(null, filepath); 
    }
  })
});


module.exports = {
  privatebucketupload,
};

