/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0

ABOUT THIS NODE.JS SAMPLE: This sample is part of the Amazon S3 Developer Guide topic at
https://docs.aws.amazon.com/AmazonS3/latest/dev/UploadObjectPreSignedURLJavaScriptSDK.html

Purpose:
s3_put_presignedURL.js demonstrates how to generate a presigned URL that a non-authenticated user
can use to get an object from an S3 bucket.

Inputs:
- REGION (into command line below)
- BUCKET_NAME (into command line below)
- FILE_NAME (into command line below)
- EXPIRATION (into code; in seconds, e.g., 60*5)

Running the code:
node s3_presignedURLs.js REGION BUCKET_NAME FILE_NAME
*/
// snippet-start:[s3.JavaScript.get.presignedURL.complete]
const AWS = require('aws-sdk');
const { s3Client,PRIVATE_BUCKET, REGION } = require("./s3Client.js");
// Set the AWS region
const region = REGION;
AWS.config.update(region);
// Create S3 service object
const s3 = new AWS.S3();
// Set the parameters
const myBucket = PRIVATE_BUCKET; //BUCKET_NAME
const signedUrlExpireSeconds = 60*5; //EXPIRATION
const getObject = async (myKey) => {
    console.log(myKey);
    const presignedURL = s3.getSignedUrl('getObject', {
        Bucket: myBucket,
        Key: myKey,
        Expires: signedUrlExpireSeconds
    })
    console.log(presignedURL);
    return presignedURL;
}
module.exports = { getObject }