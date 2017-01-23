# Nanopay S3

This library is responsible for all the services related to AWS S3.

## Usage

### Upload locally(temporary) then upload to S3

As the made research, AWS S3 doesn't accept pure streams to be uploaded direct, so we need to upload the file locally and then upload to S3.

```js
const = require('nanopay-s3');

// AWS doesn't accept streaming files, so we need to upload the files temporary
const localPath = STRING_CONTAING_THE_PATH_TO_UPLOAD_THE_FILES;

const bucket = NAME_OF_THE_S3_BUCKET;

const req = HTTP_REQUEST_CONTAINING_STREAMED_DATA;

s3.upload(localPath, bucket, req, (error, response) => {
  if (error) {
    cb(error);
  }

  cb(false, response);
});
```

### Upload direct to S3 (Will work only if you already have a file locally)

```js
const = require('nanopay-s3');

const filePath = THE_EXISTING_FILE_PATH;
const fileName = THE_FILE_NAME;
const bucket = NAME_OF_THE_S3_BUCKET;

const req = HTTP_REQUEST_CONTAINING_STREAMED_DATA;

s3.uploadS3(filePath, fileName, bucket, (error, response) => {
  if (error) {
    cb(error);
  }

  cb(false, response);
});
```