export type CareLogKind = 'water' | 'fertilize';

const CARE_LOG_MEMOS: Record<CareLogKind, string> = {
  water: '水をあげました。',
  fertilize: '肥料をあげました。',
};

export function getCareLogMemo(kind: CareLogKind): string {
  return CARE_LOG_MEMOS[kind];
}

export function isCareLogKind(value: string): value is CareLogKind {
  return value === 'water' || value === 'fertilize';
}
