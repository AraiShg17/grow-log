import { MAX_PHOTOS_PER_ENTRY } from '@/lib/photos/constants';

export function parsePhotoFilesFromFormData(formData: FormData): File[] {
  return formData
    .getAll('photos')
    .filter((item): item is File => item instanceof File && item.size > 0)
    .slice(0, MAX_PHOTOS_PER_ENTRY);
}

/** 上限チェック用（slice 前の枚数） */
export function countNonEmptyPhotoFiles(formData: FormData): number {
  return formData
    .getAll('photos')
    .filter((item): item is File => item instanceof File && item.size > 0).length;
}

export function parseAiPhotoIndexFromFormData(
  formData: FormData,
  photoCount: number,
): number {
  const raw = Number(formData.get('aiPhotoIndex'));
  if (!Number.isInteger(raw) || raw < 0 || raw >= photoCount) {
    return 0;
  }
  return raw;
}
