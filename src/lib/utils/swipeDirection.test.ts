import { describe, expect, it } from 'vitest';
import { getSwipeDirection } from './swipeDirection';

describe('getSwipeDirection', () => {
  it('returns next on swipe left', () => {
    expect(getSwipeDirection(200, 100, 100, 105)).toBe('next');
  });

  it('returns prev on swipe right', () => {
    expect(getSwipeDirection(100, 100, 200, 105)).toBe('prev');
  });

  it('returns null when movement is too short', () => {
    expect(getSwipeDirection(100, 100, 120, 100)).toBeNull();
  });

  it('returns null when vertical movement dominates', () => {
    expect(getSwipeDirection(100, 100, 180, 300)).toBeNull();
  });
});
