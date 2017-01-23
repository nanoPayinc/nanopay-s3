
const AWS = require('aws-sdk');
const fs = require('fs');
const formidable = require('formidable');
let s3;

/**
 * @param {string} accessKey - AWS Access Key
 * @param {string} secretKey - AWS Secret Key
 * @param {string} environment - Environment String(Used to force uploading a file on the 
 *                                                  same environment that's being used)
 * @constructor
 */
function Client(accessKey, secretKey, environment) {
    if (!token) {
        throw new Error('Slack Token is required');
    }
    AWS.config.update({ accessKeyId: accessKey, secretAccessKey: secretKey });
    
    this.s3 = new AWS.S3();
    this.environment = environment;
}

/**
 * Upload file to a local directory temporary(AWS S3 doesn't allow streams), then upload to AWS S3
 * and then finally remove the temp file
 *
 * @param {string} localPath - the local file Path to store files temporary
 * @param {object} bucket - the S3 Bucket Name
 * @param {object} req - the request containg the file(Stream)
 * @returns {function}
 * @private
 */
Client.prototype.upload = (localPath , bucket, req, cb) => {

  const form = new formidable.IncomingForm();

  form.uploadDir = localPath;
  
  let newPath, file;

  // every time a file has been uploaded successfully,
  // rename it to an unique name
  form.on('file', function(field, newFile) {
    file = newFile;
    
    // TODO: Create unique Name regardless timestamp
    //(if we have 2 user uploading files at the exact timestamp we'll have problems)
    const uniqueName = (new Date()).getTime() + file.name;
    
    newPath = path.join(form.uploadDir, uniqueName);

    fs.renameSync(file.path, newPath);
  });

  form.on('error', function(err) {
    cb(err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    
    this.uploadS3(newPath, file.name, bucket, 
    function(error, response) {
      if (error) {
        cb(error);
      }
      const awsResponse = response;
      fs.unlink(newPath, function(error, response) {
        if (error) {
          cb(error);
        }

        cb(false, awsResponse);
      })

    });    
  });

  // parse the incoming request containing the form data
  form.parse(req);

}; 

/**
 * Upload file(that already exists) to AWS S3
 * @param {string} filePath - the complete file Path
 * @param {object} fileName - the file Name(with extension)
 * @param {object} bucket - the S3 Bucket Name
 * @returns {function}
 * @private
 */
Client.prototype.uploadS3 = (filePath, fileName, bucket, cb) => {

    const fileBuffer = fs.readFileSync(filePath);
    const metaData = getContentTypeByFile(fileName);
    
    this.s3.putObject({
      Bucket: bucket,
      Key: this.environment+'/'+fileName,
      Body: fileBuffer,
      ContentType: metaData
    }, function(error, response) {
      if (error) {
        return cb(error);
      }
      
      return cb(false,response);
    });    

};

const getContentTypeByFile = fileName => {
  let rc = 'application/octet-stream';
  const fn = fileName.toLowerCase();

  if (fn.indexOf('.html') >= 0) rc = 'text/html';
  else if (fn.indexOf('.css') >= 0) rc = 'text/css';
  else if (fn.indexOf('.json') >= 0) rc = 'application/json';
  else if (fn.indexOf('.js') >= 0) rc = 'application/x-javascript';
  else if (fn.indexOf('.png') >= 0) rc = 'image/png';
  else if (fn.indexOf('.jpg') >= 0) rc = 'image/jpg';

  return rc;
}

module.exports = Client;