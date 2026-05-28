export type PlantSortKey =
  | 'createdDesc'
  | 'updatedDesc'
  | 'waterOldest'
  | 'fertilizeOldest';

export const DEFAULT_PLANT_SORT: PlantSortKey = 'createdDesc';

export const PLANT_SORT_OPTIONS: ReadonlyArray<{
  id: PlantSortKey;
  label: string;
}> = [
  { id: 'createdDesc', label: '作成順（新しい順）' },
  { id: 'updatedDesc', label: '最終更新（新しい順）' },
  { id: 'waterOldest', label: '水やりが久しい順' },
  { id: 'fertilizeOldest', label: '肥料が久しい順' },
];

export type PlantSortRow = {
  createdAt?: Date | string;
  updatedAt: Date | string;
  lastWateredAt?: Date | string;
  lastFertilizedAt?: Date | string;
};

function toTime(value: Date | string | undefined): number | null {
  if (!value) {
    return null;
  }
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

/** 記録なしを先頭、あとは古い日付順（久しい順） */
function compareCareOldest(
  a: Date | string | undefined,
  b: Date | string | undefined,
): number {
  const aTime = toTime(a);
  const bTime = toTime(b);

  if (aTime === null && bTime === null) {
    return 0;
  }
  if (aTime === null) {
    return -1;
  }
  if (bTime === null) {
    return 1;
  }
  return aTime - bTime;
}

export function sortPlants<T extends PlantSortRow>(
  plants: readonly T[],
  sort: PlantSortKey,
): T[] {
  const copy = [...plants];

  switch (sort) {
    case 'waterOldest':
      return copy.sort((a, b) => compareCareOldest(a.lastWateredAt, b.lastWateredAt));
    case 'fertilizeOldest':
      return copy.sort((a, b) =>
        compareCareOldest(a.lastFertilizedAt, b.lastFertilizedAt),
      );
    case 'updatedDesc':
      return copy.sort((a, b) => {
        const aTime = toTime(a.updatedAt) ?? 0;
        const bTime = toTime(b.updatedAt) ?? 0;
        return bTime - aTime;
      });
    case 'createdDesc':
    default:
      return copy.sort((a, b) => {
        const aTime = toTime(a.createdAt) ?? 0;
        const bTime = toTime(b.createdAt) ?? 0;
        return bTime - aTime;
      });
  }
}
