import { describe, expect, it } from 'vitest';
import { formatDate, formatDateTime } from './formatDate';

describe('formatDate', () => {
  it('formats date in ja-JP', () => {
    const result = formatDate(new Date('2026-05-17T12:00:00+09:00'));
    expect(result).toContain('2026');
    expect(result).toContain('17');
  });

  it('accepts ISO date string', () => {
    const result = formatDate('2026-05-17T12:00:00+09:00');
    expect(result).toContain('2026');
    expect(result).toContain('17');
  });
});

describe('formatDateTime', () => {
  it('includes time', () => {
    const result = formatDateTime(new Date('2026-05-17T15:30:00+09:00'));
    expect(result).toContain('2026');
  });
});
