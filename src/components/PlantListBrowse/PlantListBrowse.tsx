'use client';

import { useMemo, useState } from 'react';
import { PlantCard } from '@/components/PlantCard/PlantCard';
import { PlantListFilters } from '@/components/PlantListFilters/PlantListFilters';
import { filterPlants } from '@/lib/plants/filterPlants';
import type { PlantListItem } from '@/types/plant';
import pageStyles from '@/app/page.module.css';

interface PlantListBrowseProps {
  plants: PlantListItem[];
}

export function PlantListBrowse({ plants }: PlantListBrowseProps) {
  const [query, setQuery] = useState('');
  const [sunlight, setSunlight] = useState('');

  const filtered = useMemo(
    () => filterPlants(plants, { query, sunlight }),
    [plants, query, sunlight],
  );

  const filtersActive = query.trim() !== '' || sunlight !== '';

  return (
    <>
      <PlantListFilters
        query={query}
        onQueryChange={setQuery}
        sunlight={sunlight}
        onSunlightChange={setSunlight}
      />
      {filtered.length === 0 ? (
        <div className={pageStyles.filterEmpty}>
          <p>条件に合う植物がありません。</p>
          {filtersActive ? (
            <button
              type="button"
              className={pageStyles.newLink}
              onClick={() => {
                setQuery('');
                setSunlight('');
              }}
            >
              条件をクリア
            </button>
          ) : null}
        </div>
      ) : (
        <ul className={pageStyles.grid}>
          {filtered.map((plant) => (
            <li key={plant.id}>
              <PlantCard plant={plant} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
