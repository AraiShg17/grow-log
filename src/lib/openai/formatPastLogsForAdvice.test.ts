import { describe, expect, it } from 'vitest';
import { formatPastLogsForAdvice } from './formatPastLogsForAdvice';
import type { PlantLog } from '@/types/plant';

const base: Omit<PlantLog, 'id' | 'observedAt'> = {
  photoUrls: [],
  aiPhotoIndex: 0,
  memo: '元気',
  aiAdvice: '様子見でよい。',
  visualSnapshot: '葉は緑で4枚。',
  createdAt: new Date('2026-01-01T00:00:00Z'),
};

describe('formatPastLogsForAdvice', () => {
  it('includes visual snapshot and advice in chronological order', () => {
    const text = formatPastLogsForAdvice([
      {
        ...base,
        id: 'new',
        observedAt: new Date('2026-03-01T00:00:00Z'),
      },
      {
        ...base,
        id: 'old',
        observedAt: new Date('2026-02-01T00:00:00Z'),
        visualSnapshot: '以前は黄ばみ1枚。',
      },
    ]);

    expect(text.indexOf('以前は黄ばみ')).toBeLessThan(text.indexOf('葉は緑で4枚'));
    expect(text).toContain('当時の写真から読み取った状態');
    expect(text).toContain('当時のアドバイス');
  });
});
