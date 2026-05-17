import { describe, expect, it } from 'vitest';
import {
  clampAiPhotoIndex,
  normalizePhotoUrls,
  primaryPhotoUrl,
} from '@/lib/photos/normalizePhotos';

describe('normalizePhotoUrls', () => {
  it('prefers photoUrls array', () => {
    expect(normalizePhotoUrls(['a', 'b'], 'legacy')).toEqual(['a', 'b']);
  });

  it('falls back to legacy single url', () => {
    expect(normalizePhotoUrls(undefined, 'legacy')).toEqual(['legacy']);
  });
});

describe('primaryPhotoUrl', () => {
  it('returns first url', () => {
    expect(primaryPhotoUrl(['a', 'b'])).toBe('a');
  });
});

describe('clampAiPhotoIndex', () => {
  it('clamps out of range to 0', () => {
    expect(clampAiPhotoIndex(5, 3)).toBe(0);
  });
});
