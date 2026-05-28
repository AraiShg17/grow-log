import {
  MAX_LOG_AI_PHOTOS,
  MAX_LOG_PHOTOS,
  MAX_PHOTOS_PER_ENTRY,
  MIN_LOG_AI_PHOTOS,
} from '@/lib/photos/constants';
import {
  countNonEmptyPhotoFiles,
  parseAiPhotoIndexFromFormData,
  parseAiPhotoIndicesFromFormData,
  parsePhotoFilesFromFormData,
} from '@/lib/photos/parsePhotoFormData';
import { uploadPlantPhotoBuffer } from '@/lib/storage/upload';

export interface PreparedPhotoUpload {
  photoUrls: string[];
  /** 先頭の AI 分析写真インデックス（後方互換・バッジ表示用） */
  aiPhotoIndex: number;
  /** AI 分析に使った写真のインデックス（観察記録では複数可） */
  aiPhotoIndices: number[];
  aiBuffers: { buffer: Buffer; mimeType: string }[];
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

/** 観察記録: 写真は任意。枚数と AI 選択数を検証する */
export function validateLogPhotosFormData(formData: FormData): string | null {
  const rawCount = countNonEmptyPhotoFiles(formData);
  if (rawCount > MAX_LOG_PHOTOS) {
    return `写真は最大${MAX_LOG_PHOTOS}枚までです。`;
  }
  if (rawCount === 0) {
    return null;
  }

  const files = parsePhotoFilesFromFormData(formData, MAX_LOG_PHOTOS);
  const indices = parseAiPhotoIndicesFromFormData(formData, files.length);
  if (indices.length < MIN_LOG_AI_PHOTOS) {
    return `AI分析に使う写真を${MIN_LOG_AI_PHOTOS}枚以上選んでください。`;
  }
  if (indices.length > MAX_LOG_AI_PHOTOS) {
    return `AI分析に使う写真は最大${MAX_LOG_AI_PHOTOS}枚までです。`;
  }
  return null;
}

export async function uploadPhotosFromFormData(
  formData: FormData,
  folder: 'plants' | 'logs',
): Promise<PreparedPhotoUpload> {
  const maxPhotos = folder === 'logs' ? MAX_LOG_PHOTOS : MAX_PHOTOS_PER_ENTRY;
  const files = parsePhotoFilesFromFormData(formData, maxPhotos);

  const aiPhotoIndices =
    folder === 'logs'
      ? parseAiPhotoIndicesFromFormData(formData, files.length)
      : [parseAiPhotoIndexFromFormData(formData, files.length)];

  const safeIndices =
    aiPhotoIndices.length > 0 ? aiPhotoIndices : files.length > 0 ? [0] : [];

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

  const aiBuffers = safeIndices.flatMap((index) => {
    const item = buffers[index];
    return item ? [item] : [];
  });

  return {
    photoUrls,
    aiPhotoIndex: safeIndices[0] ?? 0,
    aiPhotoIndices: safeIndices,
    aiBuffers,
  };
}
