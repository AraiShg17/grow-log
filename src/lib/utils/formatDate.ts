/** 表示用タイムゾーン（サーバーが UTC でも日本時間で揃える） */
export const DISPLAY_TIME_ZONE = 'Asia/Tokyo';

const dateFormatOptions = {
  timeZone: DISPLAY_TIME_ZONE,
  year: 'numeric',
  month: 'long',
  day: 'numeric',
} as const;

const dateTimeFormatOptions = {
  ...dateFormatOptions,
  hour: '2-digit',
  minute: '2-digit',
} as const;

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ja-JP', dateFormatOptions).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ja-JP', dateTimeFormatOptions).format(d);
}

function toJstDateKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: DISPLAY_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function dateKeyToUtcMs(key: string): number {
  const [year, month, day] = key.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

/** 日本時間の暦日で何日前か（0 = 今日） */
export function formatDaysAgo(date: Date | string, now: Date = new Date()): string {
  const target = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(target.getTime())) {
    return '記録なし';
  }

  const diffDays = Math.floor(
    (dateKeyToUtcMs(toJstDateKey(now)) - dateKeyToUtcMs(toJstDateKey(target))) /
      86_400_000,
  );

  if (diffDays < 0) {
    return '今日';
  }
  if (diffDays === 0) {
    return '今日';
  }
  return `${diffDays}日前`;
}

export function formatCareDaysAgo(iso?: string): string {
  if (!iso) {
    return '記録なし';
  }
  return formatDaysAgo(iso);
}
