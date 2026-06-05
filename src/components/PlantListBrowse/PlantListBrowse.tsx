'use client';

import { useMemo } from 'react';
import { PlantCard } from '@/components/PlantCard/PlantCard';
import { PlantListScrollRestore } from '@/components/PlantListScrollRestore/PlantListScrollRestore';
import { plantListAnchorId } from '@/lib/navigation/plantListAnchor';
import { PlantListFilters } from '@/components/PlantListFilters/PlantListFilters';
import { getDisplayedPlants } from '@/lib/plants/plantListViewParams';
import { usePlantListView } from '@/components/PlantListView/PlantListViewProvider';
import type { PlantListItem } from '@/types/plant';
import pageStyles from '@/app/page.module.css';

interface PlantListBrowseProps {
  plants: PlantListItem[];
}

export function PlantListBrowse({ plants }: PlantListBrowseProps) {
  const {
    query,
    sunlight,
    sort,
    filtersActive,
    setQuery,
    setSunlight,
    setSort,
    resetViewParams,
  } = usePlantListView();

  const displayed = useMemo(
    () => getDisplayedPlants(plants, { query, sunlight, sort }),
    [plants, query, sunlight, sort],
  );

  return (
    <>
      <PlantListScrollRestore />
      <PlantListFilters
        query={query}
        onQueryChange={setQuery}
        sunlight={sunlight}
        onSunlightChange={setSunlight}
        sort={sort}
        onSortChange={setSort}
      />
      {displayed.length === 0 ? (
        <div className={pageStyles.filterEmpty}>
          <p>条件に合う植物がありません。</p>
          {filtersActive ? (
            <button
              type="button"
              className={pageStyles.newLink}
              onClick={resetViewParams}
            >
              条件をクリア
            </button>
          ) : null}
        </div>
      ) : (
        <ul className={pageStyles.grid}>
          {displayed.map((plant) => (
            <li
              key={plant.id}
              id={plantListAnchorId(plant.id)}
              className={pageStyles.gridItem}
            >
              <PlantCard plant={plant} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
