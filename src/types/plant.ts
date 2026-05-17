import type { Timestamp } from 'firebase-admin/firestore';

export interface Plant {
  id: string;
  name: string;
  firstPhotoUrl: string;
  careGuide: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlantLog {
  id: string;
  photoUrl: string;
  memo: string;
  aiAdvice: string;
  observedAt: Date;
  createdAt: Date;
}

export interface PlantDocument {
  name: string;
  firstPhotoUrl: string;
  careGuide: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  /** @deprecated 旧データ互換用。新規登録では保存しない */
  typeName?: string;
}

export interface PlantLogDocument {
  photoUrl: string;
  memo: string;
  aiAdvice: string;
  observedAt: Timestamp;
  createdAt: Timestamp;
}
