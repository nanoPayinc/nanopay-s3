# Nanopay S3

This library is responsible for all the services related to AWS S3.

## Methods

### Upload

- `upload(bucket, req, cb)` (return: function) - Uploads to S3


## Usage

### Upload to S3

```js
const nanopayS3 = require('nanopay-s3');

/**
 * Upload file to a local directory temporary(AWS S3 doesn't allow streams), then upload to AWS S3
 * and then finally remove the temp file
 *
 * @param {string} accessKey - AWS Access Key
 * @param {string} secretKey - AWS Secret Key
 * @private
 */
const s3 = new nanopayS3(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);

const bucket = 'bucket-name';
const bucketPath = 'path/inside/the/bucket';
const acl = 'public-read'; // this ACL allows everyone to see/read the file you're uploading

/**
 * Upload file to a local directory temporary(AWS S3 doesn't allow streams), then upload to AWS S3
 * and then finally remove the temp file
 * @param {string} bucket - the S3 bucket 
 * @param {string} bucketPath - the S3 Bucket Path 
 * @param {string} acl - the ACL the defines the permissions for the file, see more: http://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html
 * @param {object} req - the HTTP request containg the file(Stream)
 * @returns {function} cb - the callback
 * @private
 */
s3.upload(bucket, bucketPath, acl, req, function (error, response) {
  if (error) {
    cb(error);
  }
  
  cb(false, response);
});

```
