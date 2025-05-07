const { fileURLToPath } = require("url");
const { s3Client,PRIVATE_BUCKET } = require("./s3Client.js");
const { DeleteObjectCommand, S3Client } = require( "@aws-sdk/client-s3");
// const client = new S3Client({});
const deleteMe = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: PRIVATE_BUCKET,
    Key: key
  });
  try {
    const response = await s3Client.send(command);
    console.log('(s3Delete)S3 resource delete response received=====>',response);
  } catch (err) {
    console.error(`(s3Delete)Error in delete s3 resource`, err);
  }
};
module.exports = {deleteMe}

