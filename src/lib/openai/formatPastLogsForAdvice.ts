import { formatDateTime } from '@/lib/utils/formatDate';
import type { PlantLog } from '@/types/plant';

export const MAX_PAST_LOGS_FOR_ADVICE = 10;

const MAX_ADVICE_CHARS = 500;
const MAX_SNAPSHOT_CHARS = 350;

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max)}…`;
}

/** 過去ログをアドバイス生成用に整形（古い順・写真状態サマリー＋アドバイス全文） */
export function formatPastLogsForAdvice(logs: readonly PlantLog[]): string {
  if (logs.length === 0) {
    return '（過去の観察記録なし）';
  }

  const chronological = [...logs].reverse();

  return chronological
    .map((log, index) => {
      const advice = log.aiAdvice?.trim() || '（なし）';
      const snapshot = log.visualSnapshot?.trim() || '（当時の写真状態は未記録）';

      return [
        `### ${index + 1}. ${formatDateTime(log.observedAt)}`,
        `メモ: ${log.memo?.trim() || 'なし'}`,
        `当時の写真から読み取った状態: ${truncate(snapshot, MAX_SNAPSHOT_CHARS)}`,
        `当時のアドバイス: ${truncate(advice, MAX_ADVICE_CHARS)}`,
      ].join('\n');
    })
    .join('\n\n');
}
