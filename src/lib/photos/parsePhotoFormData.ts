import { MAX_PHOTOS_PER_ENTRY } from '@/lib/photos/constants';

function getUploadFile(value: FormDataEntryValue): File | null {
  if (typeof value === 'string') {
    return null;
  }
  if (!(value instanceof File) || value.size === 0) {
    return null;
  }
  return value;
}

export function parsePhotoFilesFromFormData(formData: FormData): File[] {
  return formData
    .getAll('photos')
    .map(getUploadFile)
    .filter((file): file is File => file !== null)
    .slice(0, MAX_PHOTOS_PER_ENTRY);
}

/** 上限チェック用（slice 前の枚数） */
export function countNonEmptyPhotoFiles(formData: FormData): number {
  return formData.getAll('photos').filter((item) => getUploadFile(item) !== null)
    .length;
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
