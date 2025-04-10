const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client,PRIVATE_BUCKET } = require("./s3Client.js");

// Set the parameters
const params = {
  Bucket: PRIVATE_BUCKET, // The name of the bucket. For example, 'sample-bucket-101'.
  Key: "sample1.text", // The name of the object. For example, 'sample_upload.txt'.
  Body: "BODY", // The content of the object. For example, 'Hello world!".
};

const uploadToS3 = async () => {
  // Create an object and upload it to the Amazon S3 bucket.
  try {
    const results = await s3Client.send(new PutObjectCommand(params));
    console.log(
        "Successfully created " +
        params.Key +
        " and uploaded it to " +
        params.Bucket +
        "/" +
        params.Key
    );
    return results; // For unit tests.
  } catch (err) {
    console.log("Error", err);
  }
};
uploadToS3();
module.exports = {uploadToS3, params};