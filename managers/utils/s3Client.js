require("dotenv").config();
const { S3Client } = require("@aws-sdk/client-s3");
// Set the AWS Region.
const REGION = process.env.REGION;
const PRIVATE_BUCKET =  process.env.BUCKET;
const ACCESS_KEY = process.env.ACCESS_KEY;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;

const s3Client = new S3Client({ region: REGION, credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY
  } });
module.exports = { s3Client , PRIVATE_BUCKET, REGION };