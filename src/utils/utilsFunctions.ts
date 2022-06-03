import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from './sampleClient';
import { randomUUID } from 'crypto';

export function generateRandomFilename(originalName: string) {
  return `${randomUUID().split('-')[0]}_${originalName}`;
}

export function getResourceFromURL(url: string) {
  const pathname = new URL(url).pathname;
  const resource = pathname.split('/').pop();
  return resource;
}
export async function addPictureToBucket(
  profilePicture: Express.Multer.File,
  options: { bucketName; prefixKey },
) {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: options.bucketName,
      Key: `${options.prefixKey}/${profilePicture.originalname}`,
      Body: profilePicture.buffer,
    }),
  );
}

export async function deletePictureFromBucket(
  filename: string,
  options: { bucketName: string; prefixKey: string },
) {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: options.bucketName,
      Key: `${options.prefixKey}/${filename}`,
    }),
  );
}

export function getBucketImageUrlWithAuthorAndPictureName(
  author: string,
  pictureFilename: string,
  bucketName = 'catgram-app',
) {
  return `https://${bucketName}.s3.amazonaws.com/posts/${author}/${pictureFilename}`;
}

const STORAGE_PLACEHOLDER_IMAGE_URI =
  'https://catgram-app.s3.amazonaws.com/users/placeholder/Portrait_Placeholder.png';

export { STORAGE_PLACEHOLDER_IMAGE_URI };
