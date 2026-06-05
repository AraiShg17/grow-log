'use server';

import { revalidatePath } from 'next/cache';
import { toActionErrorMessage } from '@/lib/errors/actionError';
import {
  countGalleryPhotos,
  createGalleryPhotos,
  listGalleryPhotoPage,
} from '@/lib/firestore/gallery';
import { GALLERY_MAX_PHOTOS } from '@/lib/gallery/constants';
import {
  uploadPhotosFromFormData,
  validatePhotoFormData,
} from '@/lib/photos/uploadPhotosFromFormData';
import { countNonEmptyPhotoFiles } from '@/lib/photos/parsePhotoFormData';
import type { ActionResult } from '@/app/actions/plants';
import type { GalleryPageCursor, GalleryPhotoPage } from '@/types/gallery';

export async function createGalleryPhotosAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const photoError = validatePhotoFormData(formData);
  if (photoError) {
    return { success: false, error: photoError };
  }

  try {
    const [currentCount, uploadCount] = await Promise.all([
      countGalleryPhotos(),
      Promise.resolve(countNonEmptyPhotoFiles(formData)),
    ]);
    const remaining = GALLERY_MAX_PHOTOS - currentCount;

    if (remaining <= 0) {
      return {
        success: false,
        error: 'ギャラリーの登録上限に達しています。',
      };
    }
    if (uploadCount > remaining) {
      return {
        success: false,
        error: `ギャラリーにはあと${remaining}枚まで投稿できます。`,
      };
    }

    const uploaded = await uploadPhotosFromFormData(formData, 'gallery');
    await createGalleryPhotos(uploaded.photoUrls);

    revalidatePath('/gallery');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: toActionErrorMessage(error, 'ギャラリー写真の投稿に失敗しました。'),
    };
  }
}

export async function listGalleryPhotoPageAction(
  cursor: GalleryPageCursor | null,
): Promise<GalleryPhotoPage> {
  return listGalleryPhotoPage(cursor);
}
