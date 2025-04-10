const { fileURLToPath } = require("url");
const { s3Client,PRIVATE_BUCKET } = require("./s3Client");
const { GetObjectCommand, S3Client } = require( "@aws-sdk/client-s3");
// const client = new S3Client({});
const getObject = async (key) => {
  const command = new GetObjectCommand({
    Bucket: PRIVATE_BUCKET,
    Key: key
  });
  try {
    const response = await s3Client.send(command);
    // The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
    const str = await response.Body.transformToString();
    console.log(str);
    console.log('(s3GetObject)S3 resource getObject response received=====>',response);
  } catch (err) {
    console.error(`(s3GetObject)Error in getObject s3 resource`, err);
  }
};
module.exports = { getObject }