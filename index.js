'use strict'

const AWS = require('aws-sdk');
const fs = require('fs');
const formidable = require('formidable');

/**
 * @param {string} accessKey - AWS Access Key
 * @param {string} secretKey - AWS Secret Key
 * @param {string} environment - Environment String(Used to force uploading a file on the 
 *                                                  same environment that's being used)
 * @constructor
 */
function Client(accessKey, secretKey, environment) {
    if (!accessKey || !secretKey || !environment) {
        throw new Error('You forgot a required parameter');
    }
    AWS.config.update({ accessKeyId: accessKey, secretAccessKey: secretKey });
    
    this.s3 = new AWS.S3();
    this.environment = environment;
}

/**
 * Upload file to a local directory temporary(AWS S3 doesn't allow streams), then upload to AWS S3
 * and then finally remove the temp file
 *
 * @param {object} bucket - the S3 Bucket Name
 * @param {object} req - the request containg the file(Stream)
 * @returns {function}
 * @private
 */
Client.prototype.upload = function (bucket, req, cb) {

  const self = this;
  
  const form = new formidable.IncomingForm();

  form.on('error', function (err) {
    cb(err);
  });

  form.onPart = function(part) {
    
    part.addListener('data', function (data) {
      
      const uniqueName = (new Date()).getTime() + part.filename;

      self.s3.upload({
        "Bucket": bucket,
        "Key": self.environment+'/'+uniqueName,
        "Body": data
      }, function (error, response) {
        if (error) {
          return cb(error);
        }
        
        cb(false, response);
      }); 
    });
    
  }

  // parse the incoming request containing the form data
  form.parse(req);

}; 

module.exports = Client;