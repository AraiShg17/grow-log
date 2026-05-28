import { describe, expect, it } from 'vitest';
import {
  formatCareDaysAgo,
  formatDate,
  formatDateTime,
  formatDaysAgo,
} from './formatDate';

describe('formatDate', () => {
  it('formats date in ja-JP (Asia/Tokyo)', () => {
    const result = formatDate(new Date('2026-05-17T12:00:00+09:00'));
    expect(result).toContain('2026');
    expect(result).toContain('17');
  });

  it('accepts ISO date string', () => {
    const result = formatDate('2026-05-17T12:00:00+09:00');
    expect(result).toContain('2026');
    expect(result).toContain('17');
  });

  it('uses JST when the server/runtime timezone is UTC', () => {
    // 2026-05-16T15:00:00Z = 2026-05-17 00:00 JST
    const result = formatDate(new Date('2026-05-16T15:00:00.000Z'));
    expect(result).toContain('17');
  });
});

describe('formatDaysAgo', () => {
  it('returns 今日 for the same JST calendar day', () => {
    expect(
      formatDaysAgo('2026-05-17T01:00:00+09:00', new Date('2026-05-17T22:00:00+09:00')),
    ).toBe('今日');
  });

  it('returns N日前 for past dates in JST', () => {
    expect(
      formatDaysAgo('2026-05-15T12:00:00+09:00', new Date('2026-05-17T12:00:00+09:00')),
    ).toBe('2日前');
  });

  it('returns 記録なし when iso is missing', () => {
    expect(formatCareDaysAgo(undefined)).toBe('記録なし');
  });
});

describe('formatDateTime', () => {
  it('includes time in JST', () => {
    const result = formatDateTime(new Date('2026-05-17T06:30:00.000Z'));
    expect(result).toContain('2026');
    expect(result).toContain('15:30');
  });
});
