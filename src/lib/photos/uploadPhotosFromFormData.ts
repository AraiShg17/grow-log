import { MAX_PHOTOS_PER_ENTRY } from '@/lib/photos/constants';
import {
  countNonEmptyPhotoFiles,
  parseAiPhotoIndexFromFormData,
  parsePhotoFilesFromFormData,
} from '@/lib/photos/parsePhotoFormData';
import { uploadPlantPhotoBuffer } from '@/lib/storage/upload';

export interface PreparedPhotoUpload {
  photoUrls: string[];
  aiPhotoIndex: number;
  aiBuffer: Buffer;
  aiMimeType: string;
}

export function validatePhotoFormData(formData: FormData): string | null {
  const rawCount = countNonEmptyPhotoFiles(formData);
  if (rawCount === 0) {
    return '写真を1枚以上選択してください。';
  }
  if (rawCount > MAX_PHOTOS_PER_ENTRY) {
    return `写真は最大${MAX_PHOTOS_PER_ENTRY}枚までです。`;
  }
  return null;
}

/** 観察記録: 写真は任意。枚数の上限だけ検証する */
export function validateLogPhotosFormData(formData: FormData): string | null {
  const rawCount = countNonEmptyPhotoFiles(formData);
  if (rawCount > MAX_PHOTOS_PER_ENTRY) {
    return `写真は最大${MAX_PHOTOS_PER_ENTRY}枚までです。`;
  }
  return null;
}

export async function uploadPhotosFromFormData(
  formData: FormData,
  folder: 'plants' | 'logs',
): Promise<PreparedPhotoUpload> {
  const files = parsePhotoFilesFromFormData(formData);
  const aiPhotoIndex = parseAiPhotoIndexFromFormData(formData, files.length);

  const buffers = await Promise.all(
    files.map(async (file) => ({
      buffer: Buffer.from(await file.arrayBuffer()),
      mimeType: file.type || 'image/jpeg',
    })),
  );

  const photoUrls = await Promise.all(
    buffers.map(({ buffer, mimeType }) =>
      uploadPlantPhotoBuffer(buffer, mimeType, folder),
    ),
  );

  const ai = buffers[aiPhotoIndex] ?? buffers[0];

  return {
    photoUrls,
    aiPhotoIndex,
    aiBuffer: ai.buffer,
    aiMimeType: ai.mimeType,
  };
}
