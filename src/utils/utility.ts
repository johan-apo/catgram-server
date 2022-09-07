import { randomUUID } from 'crypto';

export function generateRandomFilename(originalName: string) {
  return `${randomUUID().split('-')[0]}_${originalName}`;
}

export function getResourceFromURL(url: string) {
  const pathname = new URL(url).pathname;
  const resource = pathname.split('/').pop();
  return resource;
}
