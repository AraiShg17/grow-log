import { describe, expect, it } from 'vitest';
import {
  clampAiPhotoIndex,
  hasExpandableTimelineDetail,
  normalizePhotoUrls,
  primaryPhotoUrl,
} from '@/lib/photos/normalizePhotos';

describe('normalizePhotoUrls', () => {
  it('returns non-empty trimmed urls', () => {
    expect(normalizePhotoUrls(['a', 'b'])).toEqual(['a', 'b']);
  });

  it('filters empty strings', () => {
    expect(normalizePhotoUrls(['', '  ', 'https://example.com/a.jpg'])).toEqual([
      'https://example.com/a.jpg',
    ]);
  });

  it('returns empty array when undefined', () => {
    expect(normalizePhotoUrls(undefined)).toEqual([]);
  });
});

describe('primaryPhotoUrl', () => {
  it('returns first url', () => {
    expect(primaryPhotoUrl(['a', 'b'])).toBe('a');
  });
});

describe('hasExpandableTimelineDetail', () => {
  it('is false when only memo exists', () => {
    expect(hasExpandableTimelineDetail({})).toBe(false);
  });

  it('is true when aiAdvice exists', () => {
    expect(
      hasExpandableTimelineDetail({
        aiAdvice: '## まとめ\n- test',
      }),
    ).toBe(true);
  });

  it('is true when photos exist', () => {
    expect(
      hasExpandableTimelineDetail({
        photoUrls: ['https://example.com/a.jpg'],
      }),
    ).toBe(true);
  });
});

describe('clampAiPhotoIndex', () => {
  it('clamps out of range to 0', () => {
    expect(clampAiPhotoIndex(5, 3)).toBe(0);
  });
});
