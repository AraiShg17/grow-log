import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'node:crypto';
import { getGcpProjectId, getGcsBucketName } from '@/lib/env';

let storage: Storage | undefined;

function getStorage(): Storage {
  if (!storage) {
    storage = new Storage({ projectId: getGcpProjectId() });
  }
  return storage;
}

function extensionFromMime(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'image/heif': 'heif',
  };
  return map[mimeType] ?? 'jpg';
}

export async function uploadPlantPhotoBuffer(
  buffer: Buffer,
  mimeType: string,
  folder: 'plants' | 'logs',
): Promise<string> {
  const bucketName = getGcsBucketName();
  const extension = extensionFromMime(mimeType);
  const objectName = `${folder}/${randomUUID()}.${extension}`;

  const bucket = getStorage().bucket(bucketName);
  const blob = bucket.file(objectName);

  await blob.save(buffer, {
    contentType: mimeType,
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  });

  return `https://storage.googleapis.com/${bucketName}/${objectName}`;
}

export async function uploadPlantPhoto(
  file: File,
  folder: 'plants' | 'logs',
): Promise<string> {
  const mimeType = file.type || 'image/jpeg';
  const buffer = Buffer.from(await file.arrayBuffer());
  return uploadPlantPhotoBuffer(buffer, mimeType, folder);
}
