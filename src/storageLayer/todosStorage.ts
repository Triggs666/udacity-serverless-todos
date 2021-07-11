import * as AWS from "aws-sdk";
import { Logger } from "winston";
import { createLogger } from "../utils/logger";

export class TodosStorageAccess{
    
  private readonly s3:AWS.S3;
  private readonly logger:Logger;
  private readonly bucketName = process.env.IMAGES_S3_BUCKET;
  private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION

  constructor(){
    this.s3 = new AWS.S3({signatureVersion: 'v4'});
    this.logger = createLogger('STORAGE_LAYER::TODO_ACCESS');
  }

  getUploadUrl(imageId: string):string {
    
    this.logger.info('Get upload URL', {imageId});

    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: imageId,
      Expires: this.urlExpiration
    });
  
  }
  
}