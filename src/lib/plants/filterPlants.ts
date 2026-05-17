import { isSunlightTagId, type SunlightTagId } from '@/lib/plants/sunlightTags';

export type PlantFilterRow = {
  name: string;
  sunlightTag?: SunlightTagId;
};

export interface PlantListFilterInput {
  /** 植物名の部分一致（大小無視） */
  query: string;
  /** 空: 推奨置き場で絞らない / それ以外は有効な日照 ID */
  sunlight: string;
}

export function filterPlants<T extends PlantFilterRow>(
  plants: readonly T[],
  filters: PlantListFilterInput,
): T[] {
  let out = [...plants];
  const q = filters.query.trim().toLowerCase();
  if (q) {
    out = out.filter((p) => p.name.toLowerCase().includes(q));
  }

  const sun = filters.sunlight.trim();
  if (isSunlightTagId(sun)) {
    out = out.filter((p) => p.sunlightTag === sun);
  }

  return out;
}
