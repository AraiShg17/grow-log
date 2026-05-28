import type { Timestamp } from 'firebase-admin/firestore';
import type { SunlightTagId } from '@/lib/plants/sunlightTags';

export interface Plant {
  id: string;
  name: string;
  /** 登録時の写真（最大10枚）。一覧のサムネイルは先頭 */
  photoUrls: string[];
  /** AI 分析に使った写真の photoUrls 内インデックス（先頭） */
  aiPhotoIndex: number;
  /** AI 分析に使った写真のインデックス一覧（観察記録で複数可） */
  aiPhotoIndices?: number[];
  /** 最新の観察記録の先頭写真（一覧サムネ用・ログに写真があるときのみ） */
  latestPhotoUrl?: string;
  careGuide: string;
  /** 育てるうえで推奨する置き場の明るさ（日向／半日向／日陰）。撮影時の環境ではない。タグがない旧データは undefined */
  sunlightTag?: SunlightTagId;
  createdAt: Date;
  updatedAt: Date;
  /** listPlants 取得時のみ。クイック記録の最新日 */
  lastWateredAt?: Date;
  lastFertilizedAt?: Date;
}

/** 一覧カード用（サーバー→クライアントでは日付を ISO 文字列で渡す） */
export type PlantListItem = Pick<
  Plant,
  'id' | 'name' | 'photoUrls' | 'latestPhotoUrl' | 'sunlightTag'
> & {
  createdAt: Date | string;
  updatedAt: Date | string;
  lastWateredAt?: string;
  lastFertilizedAt?: string;
};

export interface PlantLog {
  id: string;
  photoUrls: string[];
  aiPhotoIndex: number;
  aiPhotoIndices?: number[];
  memo: string;
  aiAdvice: string;
  /** AI が当時の写真から抽出した客観的な状態メモ（次回比較用） */
  visualSnapshot?: string;
  observedAt: Date;
  createdAt: Date;
}

export interface PlantDocument {
  name: string;
  photoUrls: string[];
  aiPhotoIndex: number;
  careGuide: string;
  /** 育てるうえで推奨する置き場の明るさ（撮影時の環境ではない） */
  sunlightTag?: SunlightTagId;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  /** @deprecated 旧データ互換用。新規登録では保存しない */
  typeName?: string;
}

export interface PlantLogDocument {
  photoUrls: string[];
  aiPhotoIndex: number;
  aiPhotoIndices?: number[];
  memo: string;
  aiAdvice?: string;
  visualSnapshot?: string;
  observedAt: Timestamp;
  createdAt: Timestamp;
}

export type PlantChatRole = 'user' | 'assistant';

export interface PlantChatMessage {
  id: string;
  role: PlantChatRole;
  content: string;
  createdAt: Date;
}

/** クライアントへ渡すチャットメッセージ */
export type PlantChatMessageDto = {
  id: string;
  role: PlantChatRole;
  content: string;
  createdAt: string;
};

export interface PlantChatMessageDocument {
  role: PlantChatRole;
  content: string;
  createdAt: Timestamp;
}
