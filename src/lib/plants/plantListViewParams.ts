import { DEFAULT_PLANT_SORT, type PlantSortKey } from '@/lib/plants/sortPlants';
import { filterPlants, type PlantFilterRow } from '@/lib/plants/filterPlants';
import { sortPlants, type PlantSortRow } from '@/lib/plants/sortPlants';

export interface PlantListViewParams {
  query: string;
  sunlight: string;
  sort: PlantSortKey;
}

const PLANT_SORT_KEYS: PlantSortKey[] = [
  'createdDesc',
  'updatedDesc',
  'waterOldest',
  'fertilizeOldest',
];

export function isPlantSortKey(value: string): value is PlantSortKey {
  return PLANT_SORT_KEYS.includes(value as PlantSortKey);
}

export function readPlantListViewParams(
  searchParams: URLSearchParams,
): PlantListViewParams {
  const sort = searchParams.get('sort') ?? '';

  return {
    query: searchParams.get('q') ?? '',
    sunlight: searchParams.get('sunlight') ?? '',
    sort: isPlantSortKey(sort) ? sort : DEFAULT_PLANT_SORT,
  };
}

export function getDisplayedPlants<T extends PlantFilterRow & PlantSortRow>(
  plants: readonly T[],
  params: PlantListViewParams,
): T[] {
  return sortPlants(
    filterPlants(plants, {
      query: params.query,
      sunlight: params.sunlight,
    }),
    params.sort,
  );
}
