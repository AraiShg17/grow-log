import { describe, expect, it } from 'vitest';
import { iconNames, icons } from './icons';

describe('icons', () => {
  it('exports unique icon names', () => {
    expect(iconNames).toHaveLength(Object.keys(icons).length);
    expect(new Set(iconNames).size).toBe(iconNames.length);
  });
});
