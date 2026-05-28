'use client';

import { PLANT_SORT_OPTIONS, type PlantSortKey } from '@/lib/plants/sortPlants';
import { SUNLIGHT_TAG_OPTIONS } from '@/lib/plants/sunlightTags';
import styles from './PlantListFilters.module.css';

export interface PlantListFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  sunlight: string;
  onSunlightChange: (value: string) => void;
  sort: PlantSortKey;
  onSortChange: (value: PlantSortKey) => void;
}

export function PlantListFilters({
  query,
  onQueryChange,
  sunlight,
  onSunlightChange,
  sort,
  onSortChange,
}: PlantListFiltersProps) {
  const chipClass = (active: boolean) =>
    [styles.chip, active ? styles.chipActive : ''].filter(Boolean).join(' ');

  return (
    <details className={styles.searchAccordion}>
      <summary className={styles.searchSummary}>絞り込み・並べ替え</summary>
      <div className={styles.searchAccordionBody}>
        <input
          id="plant-list-search"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          className={styles.searchInput}
          placeholder="名前の一部で絞り込み"
          aria-label="植物名で絞り込み"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        <div className={styles.filterBlock}>
          <div className={styles.chips} role="group" aria-label="置き場で絞り込み">
            <button
              type="button"
              className={chipClass(sunlight === '')}
              aria-current={sunlight === '' ? 'true' : undefined}
              onClick={() => onSunlightChange('')}
            >
              すべて
            </button>
            {SUNLIGHT_TAG_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={chipClass(sunlight === opt.id)}
                aria-current={sunlight === opt.id ? 'true' : undefined}
                onClick={() => onSunlightChange(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.filterBlock}>
          <p className={styles.filterLabel}>並べ替え</p>
          <div className={styles.chips} role="group" aria-label="並べ替え">
            {PLANT_SORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={chipClass(sort === opt.id)}
                aria-current={sort === opt.id ? 'true' : undefined}
                onClick={() => onSortChange(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </details>
  );
}
