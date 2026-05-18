import { describe, expect, it } from 'vitest';
import { buildPlantChatContext } from './buildPlantChatContext';
import type { Plant, PlantLog } from '@/types/plant';

const plant: Plant = {
  id: 'p1',
  name: 'モンステラ',
  photoUrls: [],
  aiPhotoIndex: 0,
  careGuide: '## まとめ\n水は控えめ',
  sunlightTag: 'partial_sun',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-02-01T00:00:00Z'),
};

const log: PlantLog = {
  id: 'l1',
  photoUrls: ['https://example.com/a.jpg'],
  aiPhotoIndex: 0,
  memo: '葉が黄色い',
  aiAdvice: '## まとめ\n- 水のやりすぎに注意',
  observedAt: new Date('2026-03-01T12:00:00Z'),
  createdAt: new Date('2026-03-01T12:00:00Z'),
};

describe('buildPlantChatContext', () => {
  it('includes plant name and recent logs', () => {
    const context = buildPlantChatContext(plant, [log]);
    expect(context).toContain('モンステラ');
    expect(context).toContain('半日向');
    expect(context).toContain('葉が黄色い');
    expect(context).toContain('水のやりすぎ');
  });
});
