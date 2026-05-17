import { describe, expect, it } from 'vitest';
import { filterPlants } from '@/lib/plants/filterPlants';
import type { Plant } from '@/types/plant';

function plant(p: Partial<Plant> & Pick<Plant, 'id' | 'name'>): Plant {
  const now = new Date('2024-01-01');
  const firstPhotoUrl =
    p.firstPhotoUrl ?? p.photoUrls?.[0] ?? 'https://storage.googleapis.com/b/x.jpg';
  const photoUrls = p.photoUrls ?? [firstPhotoUrl];
  return {
    careGuide: '',
    createdAt: now,
    updatedAt: now,
    ...p,
    photoUrls,
    aiPhotoIndex: p.aiPhotoIndex ?? 0,
    firstPhotoUrl,
  };
}

describe('filterPlants', () => {
  const plants: Plant[] = [
    plant({ id: '1', name: 'モンステラ', sunlightTag: 'shade' }),
    plant({ id: '2', name: 'サンスベリア', sunlightTag: 'full_sun' }),
    plant({ id: '3', name: 'モス', sunlightTag: undefined }),
  ];

  it('filters by name substring case-insensitive', () => {
    expect(
      filterPlants(plants, { query: 'モン', sunlight: '' }).map((x) => x.id),
    ).toEqual(['1']);
    expect(
      filterPlants(plants, { query: 'サン', sunlight: '' }).map((x) => x.id),
    ).toEqual(['2']);
  });

  it('filters by sunlight id', () => {
    expect(
      filterPlants(plants, { query: '', sunlight: 'full_sun' }).map((x) => x.id),
    ).toEqual(['2']);
  });
});
