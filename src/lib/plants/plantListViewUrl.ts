import type { PlantListViewParams } from '@/lib/plants/plantListViewParams';
import { DEFAULT_PLANT_SORT } from '@/lib/plants/sortPlants';

export function buildPlantListViewQuery(params: PlantListViewParams): string {
  const urlParams = new URLSearchParams();

  if (params.query.trim()) {
    urlParams.set('q', params.query);
  }

  if (params.sunlight) {
    urlParams.set('sunlight', params.sunlight);
  }

  if (params.sort !== DEFAULT_PLANT_SORT) {
    urlParams.set('sort', params.sort);
  }

  return urlParams.toString();
}

/** Next.js のナビゲーションを起こさず URL だけ更新する */
export function replacePlantListViewUrl(
  pathname: string,
  params: PlantListViewParams,
): void {
  const suffix = buildPlantListViewQuery(params);
  const nextUrl = suffix ? `${pathname}?${suffix}` : pathname;
  window.history.replaceState(window.history.state, '', nextUrl);
}
