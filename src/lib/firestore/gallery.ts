import { FieldPath, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getDb } from '@/lib/firebase/admin';
import { GALLERY_MAX_PHOTOS, GALLERY_PAGE_SIZE } from '@/lib/gallery/constants';
import { formatDateTime } from '@/lib/utils/formatDate';
import type {
  GalleryPageCursor,
  GalleryPhoto,
  GalleryPhotoDocument,
  GalleryPhotoPage,
} from '@/types/gallery';

const GALLERY_PHOTOS_COLLECTION = 'galleryPhotos';

function toGalleryPhoto(id: string, data: GalleryPhotoDocument): GalleryPhoto {
  return {
    id,
    photoUrl: data.photoUrl,
    createdAt: data.createdAt.toDate(),
  };
}

function toGalleryPhotoItem(photo: GalleryPhoto) {
  return {
    id: photo.id,
    url: photo.photoUrl,
    dateLabel: formatDateTime(photo.createdAt),
    observedAtIso: photo.createdAt.toISOString(),
    isAiPhoto: false as const,
  };
}

function toNextCursor(last: GalleryPhoto | undefined): GalleryPageCursor | null {
  if (!last) {
    return null;
  }

  return {
    createdAtIso: last.createdAt.toISOString(),
    id: last.id,
  };
}

export async function countGalleryPhotos(): Promise<number> {
  const snapshot = await getDb().collection(GALLERY_PHOTOS_COLLECTION).count().get();

  return snapshot.data().count;
}

export async function listGalleryPhotoPage(
  cursor?: GalleryPageCursor | null,
): Promise<GalleryPhotoPage> {
  let query = getDb()
    .collection(GALLERY_PHOTOS_COLLECTION)
    .orderBy('createdAt', 'desc')
    .orderBy(FieldPath.documentId(), 'desc')
    .limit(GALLERY_PAGE_SIZE);

  if (cursor) {
    query = query.startAfter(
      Timestamp.fromDate(new Date(cursor.createdAtIso)),
      cursor.id,
    );
  }

  const [count, snapshot] = await Promise.all([countGalleryPhotos(), query.get()]);
  const photos = snapshot.docs.map((doc) =>
    toGalleryPhoto(doc.id, doc.data() as GalleryPhotoDocument),
  );

  return {
    photos: photos.map(toGalleryPhotoItem),
    totalCount: count,
    nextCursor:
      photos.length === GALLERY_PAGE_SIZE ? toNextCursor(photos.at(-1)) : null,
  };
}

export async function createGalleryPhotos(photoUrls: string[]): Promise<void> {
  if (photoUrls.length === 0) {
    return;
  }

  const db = getDb();
  const count = await countGalleryPhotos();
  const remaining = GALLERY_MAX_PHOTOS - count;

  if (remaining <= 0) {
    throw new Error('ギャラリーの登録上限に達しています。');
  }
  if (photoUrls.length > remaining) {
    throw new Error(`ギャラリーにはあと${remaining}枚まで投稿できます。`);
  }

  const batch = db.batch();

  for (const photoUrl of photoUrls) {
    const ref = db.collection(GALLERY_PHOTOS_COLLECTION).doc();
    batch.set(ref, {
      photoUrl,
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
}
