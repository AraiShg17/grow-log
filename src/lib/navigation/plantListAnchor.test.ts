import { describe, expect, it } from 'vitest';
import { plantListAnchorHref, plantListAnchorId } from './plantListAnchor';

describe('plantListAnchor', () => {
  it('builds anchor id and href', () => {
    expect(plantListAnchorId('abc123')).toBe('plant-abc123');
    expect(plantListAnchorHref('abc123')).toBe('/#plant-abc123');
  });
});
