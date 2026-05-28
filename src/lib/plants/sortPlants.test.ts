import { describe, expect, it } from 'vitest';
import { sortPlants } from '@/lib/plants/sortPlants';

describe('sortPlants', () => {
  const plants = [
    {
      id: 'a',
      createdAt: '2026-05-01',
      updatedAt: '2026-05-10',
      lastWateredAt: '2026-05-01',
      lastFertilizedAt: '2026-04-01',
    },
    {
      id: 'b',
      createdAt: '2026-05-12',
      updatedAt: '2026-05-12',
      lastWateredAt: undefined,
      lastFertilizedAt: '2026-05-05',
    },
    {
      id: 'c',
      createdAt: '2026-05-08',
      updatedAt: '2026-05-08',
      lastWateredAt: '2026-04-15',
      lastFertilizedAt: undefined,
    },
  ];

  it('sorts by createdAt descending by default', () => {
    expect(sortPlants(plants, 'createdDesc').map((p) => p.id)).toEqual(['b', 'c', 'a']);
  });

  it('sorts by updatedAt descending', () => {
    expect(sortPlants(plants, 'updatedDesc').map((p) => p.id)).toEqual(['b', 'a', 'c']);
  });

  it('sorts by water oldest first (missing first)', () => {
    expect(sortPlants(plants, 'waterOldest').map((p) => p.id)).toEqual(['b', 'c', 'a']);
  });

  it('sorts by fertilize oldest first (missing first)', () => {
    expect(sortPlants(plants, 'fertilizeOldest').map((p) => p.id)).toEqual([
      'c',
      'a',
      'b',
    ]);
  });
});
