import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';

type Options = {
  prefixKey: string;
};

type UploadFile = { file: Express.Multer.File } & Options;
type DeleteFile = { filename: string } & Options;

interface GetImageUrlParams {
  author: string;
  filename: string;
}

@Injectable()
export class S3Service {
  S3_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
  S3_REGION = process.env.AWS_REGION;
  S3_BUCKET_URL = `https://${this.S3_BUCKET_NAME}.s3.amazonaws.com`;
  s3client: S3Client;

  constructor() {
    this.s3client = new S3Client({ region: this.S3_REGION });
  }

  async uploadPicture({ file, prefixKey }: UploadFile) {
    return this.s3client.send(
      new PutObjectCommand({
        Bucket: this.S3_BUCKET_NAME,
        Key: `${prefixKey}/${file.originalname}`,
        Body: file.buffer,
      }),
    );
  }

  async deletePicture({ filename, prefixKey }: DeleteFile) {
    return this.s3client.send(
      new DeleteObjectCommand({
        Bucket: this.S3_BUCKET_NAME,
        Key: `${prefixKey}/${filename}`,
      }),
    );
  }

  getPostImageUrl({ author, filename }: GetImageUrlParams) {
    return `${this.S3_BUCKET_URL}/posts/${author}/${filename}`;
  }

  getProfileImageUrl(filename: string) {
    return `${this.S3_BUCKET_URL}/users/${filename}`;
  }
}
