import { describe, expect, it } from 'vitest';
import { formatDate, formatDateTime } from './formatDate';

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

describe('formatDateTime', () => {
  it('includes time in JST', () => {
    const result = formatDateTime(new Date('2026-05-17T06:30:00.000Z'));
    expect(result).toContain('2026');
    expect(result).toContain('15:30');
  });
});
