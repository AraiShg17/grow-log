import imageCompression from 'browser-image-compression';

/** これ未満なら再エンコードしない（小さい画像の劣化を避ける） */
const MIN_BYTES_TO_COMPRESS = 450 * 1024;

const compressionOptions = {
  maxSizeMB: 1.2,
  maxWidthOrHeight: 2048,
  useWebWorker: true,
  initialQuality: 0.88,
  fileType: 'image/jpeg',
} satisfies Parameters<typeof imageCompression>[1];

/**
 * ブラウザ上で写真を JPEG に近い形へ縮小し、Server Action 向けのペイロードを抑える。
 * HEIC 等はブラウザがデコードできれば変換、失敗時は元ファイルを返す。
 */
export async function compressImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }
  if (file.type === 'image/gif') {
    return file;
  }

  if (file.size <= MIN_BYTES_TO_COMPRESS) {
    return file;
  }

  try {
    const compressed = await imageCompression(file, compressionOptions);

    if (compressed.size >= file.size * 0.97) {
      return file;
    }

    const baseName = file.name.replace(/\.[^/.]+$/, '') || 'photo';
    return new File([compressed], `${baseName}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}
