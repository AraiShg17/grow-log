import { parseCompactSections } from '@/lib/markdown/parseCompactSections';
import { getSunlightTagLabel } from '@/lib/plants/sunlightTags';
import { formatDateTime } from '@/lib/utils/formatDate';
import type { Plant, PlantLog } from '@/types/plant';

const MAX_CARE_GUIDE_CHARS = 2_500;
const MAX_LOGS = 5;
const MAX_MEMO_CHARS = 200;
const MAX_ADVICE_CHARS = 400;

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max)}…`;
}

function summarizeAdvice(aiAdvice: string): string {
  const trimmed = aiAdvice.trim();
  if (!trimmed) {
    return '';
  }
  const { summary } = parseCompactSections(trimmed);
  const gist = summary || trimmed;
  return truncate(gist, MAX_ADVICE_CHARS);
}

/** GPT チャット用の植物コンテキスト（最新ログ中心・文字数制限あり） */
export function buildPlantChatContext(plant: Plant, logs: readonly PlantLog[]): string {
  const sunlightLabel = getSunlightTagLabel(plant.sunlightTag);
  const careGuide = truncate(plant.careGuide, MAX_CARE_GUIDE_CHARS);

  const lines = [
    `植物名: ${plant.name}`,
    sunlightLabel ? `推奨の置き場（日照）: ${sunlightLabel}` : null,
    `登録日: ${formatDateTime(plant.createdAt)}`,
    `最終更新: ${formatDateTime(plant.updatedAt)}`,
    '',
    '【登録時の育成ガイド（抜粋）】',
    careGuide || '（なし）',
  ].filter((line): line is string => line !== null);

  const recentLogs = logs.slice(0, MAX_LOGS);
  if (recentLogs.length > 0) {
    lines.push('', '【直近の観察記録（新しい順・最大5件）】');
    recentLogs.forEach((log, index) => {
      const parts = [`${index + 1}. ${formatDateTime(log.observedAt)}`];
      if (log.memo.trim()) {
        parts.push(`メモ: ${truncate(log.memo, MAX_MEMO_CHARS)}`);
      }
      const advice = summarizeAdvice(log.aiAdvice);
      if (advice) {
        parts.push(`AIアドバイス要点: ${advice}`);
      }
      if (log.photoUrls.length > 0) {
        parts.push(`写真: ${log.photoUrls.length}枚`);
      }
      lines.push(parts.join(' / '));
    });
  } else {
    lines.push('', '【観察記録】まだありません。');
  }

  return lines.join('\n');
}
