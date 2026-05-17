import type { Timestamp } from 'firebase-admin/firestore';
import type { SunlightTagId } from '@/lib/plants/sunlightTags';

export interface Plant {
  id: string;
  name: string;
  firstPhotoUrl: string;
  latestPhotoUrl?: string;
  careGuide: string;
  /** 育てるうえで推奨する置き場の明るさ（日向／半日向／日陰）。撮影時の環境ではない。タグがない旧データは undefined */
  sunlightTag?: SunlightTagId;
  createdAt: Date;
  updatedAt: Date;
}

/** 一覧カード用（サーバー→クライアントでは updatedAt を ISO 文字列で渡す） */
export type PlantListItem = Pick<
  Plant,
  'id' | 'name' | 'firstPhotoUrl' | 'latestPhotoUrl' | 'sunlightTag'
> & { updatedAt: Date | string };

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
  /** 育てるうえで推奨する置き場の明るさ（撮影時の環境ではない） */
  sunlightTag?: SunlightTagId;
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
