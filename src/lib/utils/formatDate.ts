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
