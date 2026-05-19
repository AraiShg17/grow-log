import { describe, expect, it } from 'vitest';
import { collectPlantPhotos } from './collectPlantPhotos';
import type { Plant, PlantLog } from '@/types/plant';

const plant: Plant = {
  id: 'p1',
  name: 'モンステラ',
  photoUrls: ['https://example.com/reg.jpg'],
  aiPhotoIndex: 0,
  careGuide: '',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

describe('collectPlantPhotos', () => {
  it('collects registration and log photos in chronological order', () => {
    const logs: PlantLog[] = [
      {
        id: 'l2',
        photoUrls: ['https://example.com/log2.jpg'],
        aiPhotoIndex: 0,
        memo: '',
        aiAdvice: '',
        observedAt: new Date('2026-03-01T00:00:00Z'),
        createdAt: new Date('2026-03-01T00:00:00Z'),
      },
      {
        id: 'l1',
        photoUrls: ['https://example.com/log1.jpg'],
        aiPhotoIndex: 0,
        memo: '',
        aiAdvice: '',
        observedAt: new Date('2026-02-01T00:00:00Z'),
        createdAt: new Date('2026-02-01T00:00:00Z'),
      },
    ];

    const photos = collectPlantPhotos(plant, logs);
    expect(photos.map((p) => p.url)).toEqual([
      'https://example.com/reg.jpg',
      'https://example.com/log1.jpg',
      'https://example.com/log2.jpg',
    ]);
  });
});
