const AuthMiddleware = require('./auth.middleware');
const MulterMiddleware = require('./multer.middleware');
const FamarkCloud = require('./famark.middleware')
const S3bucketCloudMiddleware = require('./s3Cloud.middleware')

module.exports = {
  AuthMiddleware,
  MulterMiddleware,
  FamarkCloud,
  S3bucketCloudMiddleware
};
