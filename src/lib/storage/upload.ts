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

function objectNameFromPublicUrl(url: string): string | null {
  const bucketName = getGcsBucketName();
  const prefix = `https://storage.googleapis.com/${bucketName}/`;

  if (!url.startsWith(prefix)) {
    return null;
  }

  return decodeURIComponent(url.slice(prefix.length));
}

export async function deleteStorageObjectByUrl(url: string): Promise<void> {
  const objectName = objectNameFromPublicUrl(url);
  if (!objectName) {
    return;
  }

  await getStorage()
    .bucket(getGcsBucketName())
    .file(objectName)
    .delete({ ignoreNotFound: true });
}

export async function deleteStorageObjectsByUrls(urls: string[]): Promise<void> {
  await Promise.all(urls.map((url) => deleteStorageObjectByUrl(url)));
}
