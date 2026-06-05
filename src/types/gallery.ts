import type { Timestamp } from 'firebase-admin/firestore';

export interface GalleryPhoto {
  id: string;
  photoUrl: string;
  createdAt: Date;
}

export interface GalleryPhotoDocument {
  photoUrl: string;
  createdAt: Timestamp;
}

export interface GalleryPhotoItem {
  id: string;
  url: string;
  dateLabel: string;
  observedAtIso: string;
  isAiPhoto: false;
}

export interface GalleryPageCursor {
  createdAtIso: string;
  id: string;
}

export interface GalleryPhotoPage {
  photos: GalleryPhotoItem[];
  totalCount: number;
  nextCursor: GalleryPageCursor | null;
}
