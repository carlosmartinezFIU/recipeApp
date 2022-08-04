require('dotenv').config();
const fs = require('fs-extra');
const S3 = require('aws-sdk/clients/s3');

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY


const s3 = new S3({
    region, 
    accessKeyId,
    secretAccessKey
})

//uploading a file to s3
function uploadImage( file ) {
    const newStreamFile = fs.createReadStream(file.path)

    const params = {
        Bucket: bucketName,
        Body: newStreamFile,
        Key: file.filename,
    }

    return s3.upload(params).promise()
}
exports.uploadImage = uploadImage


//downloading a file from s3

function getImageS3( fileKey ){
    const params = {
        Bucket: bucketName,
        Key: fileKey,
    }

    

    let fileStream = s3.getObject(params).createReadStream();
    return fileStream
}

exports.getImageS3 = getImageS3

function deleteImage( fileKey ){

    const params = {
        Bucket: bucketName,
        Key: fileKey
    }

    s3.deleteObject(params).promise();
}
exports.deleteImage = deleteImage