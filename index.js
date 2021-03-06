'use strict'

const AWS = require('aws-sdk');
const formidable = require('formidable');
const Promise = require('bluebird');

/**
 * @param {string} accessKey - AWS Access Key
 * @param {string} secretKey - AWS Secret Key
 * @constructor
 */
function Client(accessKey, secretKey) {
    if (!accessKey || !secretKey) {
        throw new Error('You forgot a required parameter');
    }
    AWS.config.update({ accessKeyId: accessKey, secretAccessKey: secretKey });

    this.s3 = new AWS.S3();

    // Promisifying all prototypes methods with suffix "Sync"...
    Promise.promisifyAll(Object.getPrototypeOf(this), { suffix: 'Sync' });
}

/**
 * Upload file to a local directory temporary(AWS S3 doesn't allow streams), then upload to AWS S3
 * and then finally remove the temp file
 *
 * @param {string} bucket - the S3 bucket
 * @param {string} bucketPath - the S3 Bucket Path
 * @param {string} acl - the ACL the defines the permissions for the file, see more: http://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html
 * @param {object} req - the HTTP request containg the file(Stream)
 * @returns {function}
 * @private
 */
Client.prototype.upload = function (bucket, bucketPath, acl, req, cb) {

  const self = this;

  const form = new formidable.IncomingForm();

  let filename;

  let totalData=Buffer.alloc(0);

  form.on('error', function (err) {
    cb(err);
  });

  form.onPart = function(part) {
    filename = part.filename;
    part.addListener('data', function (data) {
      totalData = Buffer.concat([totalData,data],totalData.length+data.length);
    });

  }

  form.on('end', function () {
    const uniqueName = (new Date()).getTime() + filename;

    self.s3.upload({
      "Bucket": bucket,
      "Key": bucketPath+'/'+uniqueName,
      "Body": totalData,
      "ACL": acl
    }, function (error, response) {
      if (error) {
        return cb(error);
      }

      cb(false, response);
    });

  });

  // parse the incoming request containing the form data
  form.parse(req);

};

module.exports = Client;
