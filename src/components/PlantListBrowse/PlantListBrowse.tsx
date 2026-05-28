'use client';

import { useMemo, useState } from 'react';
import { PlantCard } from '@/components/PlantCard/PlantCard';
import { PlantListScrollRestore } from '@/components/PlantListScrollRestore/PlantListScrollRestore';
import { plantListAnchorId } from '@/lib/navigation/plantListAnchor';
import { PlantListFilters } from '@/components/PlantListFilters/PlantListFilters';
import { filterPlants } from '@/lib/plants/filterPlants';
import {
  DEFAULT_PLANT_SORT,
  sortPlants,
  type PlantSortKey,
} from '@/lib/plants/sortPlants';
import type { PlantListItem } from '@/types/plant';
import pageStyles from '@/app/page.module.css';

interface PlantListBrowseProps {
  plants: PlantListItem[];
}

export function PlantListBrowse({ plants }: PlantListBrowseProps) {
  const [query, setQuery] = useState('');
  const [sunlight, setSunlight] = useState('');
  const [sort, setSort] = useState<PlantSortKey>(DEFAULT_PLANT_SORT);

  const displayed = useMemo(() => {
    const filtered = filterPlants(plants, { query, sunlight });
    return sortPlants(filtered, sort);
  }, [plants, query, sunlight, sort]);

  const filtersActive =
    query.trim() !== '' || sunlight !== '' || sort !== DEFAULT_PLANT_SORT;

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
              onClick={() => {
                setQuery('');
                setSunlight('');
                setSort(DEFAULT_PLANT_SORT);
              }}
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
