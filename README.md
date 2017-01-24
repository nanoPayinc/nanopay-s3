# Nanopay S3

This library is responsible for all the services related to AWS S3.

## Usage

### Upload to S3

```js
const = require('nanopay-s3');

const s3 = new nanopayS3(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY, process.env.NODE_ENV);

const S3_BUCKET = 'nanopay-img';

s3.upload(S3_BUCKET, req, function (error, response) {
  if (error) {
    cb(error);
  }
  
  cb(false, response);
});
```
