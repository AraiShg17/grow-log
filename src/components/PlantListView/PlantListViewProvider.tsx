'use client';

import {
  DEFAULT_PLANT_SORT,
  readPlantListViewParams,
  type PlantListViewParams,
} from '@/lib/plants/plantListViewParams';
import { replacePlantListViewUrl } from '@/lib/plants/plantListViewUrl';
import type { PlantSortKey } from '@/lib/plants/sortPlants';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface PlantListViewContextValue {
  query: string;
  sunlight: string;
  sort: PlantSortKey;
  filtersActive: boolean;
  setQuery: (value: string) => void;
  setSunlight: (value: string) => void;
  setSort: (value: PlantSortKey) => void;
  resetViewParams: () => void;
}

const PlantListViewContext = createContext<PlantListViewContextValue | null>(null);

export function PlantListViewProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialParams = useMemo(
    () => readPlantListViewParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const [viewParams, setViewParams] = useState<PlantListViewParams>(initialParams);

  const updateViewParams = useCallback(
    (next: Partial<PlantListViewParams>) => {
      setViewParams((prev) => {
        const merged = { ...prev, ...next };
        replacePlantListViewUrl(pathname, merged);
        return merged;
      });
    },
    [pathname],
  );

  const setQuery = useCallback(
    (value: string) => {
      updateViewParams({ query: value });
    },
    [updateViewParams],
  );

  const setSunlight = useCallback(
    (value: string) => {
      updateViewParams({ sunlight: value });
    },
    [updateViewParams],
  );

  const setSort = useCallback(
    (value: PlantSortKey) => {
      updateViewParams({ sort: value });
    },
    [updateViewParams],
  );

  const resetViewParams = useCallback(() => {
    const next: PlantListViewParams = {
      query: '',
      sunlight: '',
      sort: DEFAULT_PLANT_SORT,
    };
    setViewParams(next);
    replacePlantListViewUrl(pathname, next);
  }, [pathname]);

  const filtersActive =
    viewParams.query.trim() !== '' ||
    viewParams.sunlight !== '' ||
    viewParams.sort !== DEFAULT_PLANT_SORT;

  const value = useMemo(
    () => ({
      query: viewParams.query,
      sunlight: viewParams.sunlight,
      sort: viewParams.sort,
      filtersActive,
      setQuery,
      setSunlight,
      setSort,
      resetViewParams,
    }),
    [
      filtersActive,
      resetViewParams,
      setQuery,
      setSort,
      setSunlight,
      viewParams.query,
      viewParams.sort,
      viewParams.sunlight,
    ],
  );

  return (
    <PlantListViewContext.Provider value={value}>{children}</PlantListViewContext.Provider>
  );
}

export function usePlantListView() {
  const context = useContext(PlantListViewContext);
  if (!context) {
    throw new Error('usePlantListView must be used within PlantListViewProvider');
  }
  return context;
}
