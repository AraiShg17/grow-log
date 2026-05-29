export type TimelineOpenState = Record<string, boolean>;

function storageKey(plantId: string): string {
  return `grow-log-timeline-open:${plantId}`;
}

export function readTimelineOpenState(plantId: string): TimelineOpenState {
  try {
    const raw = localStorage.getItem(storageKey(plantId));
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }
    return parsed as TimelineOpenState;
  } catch {
    return {};
  }
}

export function writeTimelineOpenState(
  plantId: string,
  state: TimelineOpenState,
): void {
  try {
    localStorage.setItem(storageKey(plantId), JSON.stringify(state));
  } catch {
    // ignore
  }
}

/** 保存済み状態と未登録ログのデフォルト（開く）をマージ */
export function buildTimelineOpenState(
  plantId: string,
  logIds: readonly string[],
): TimelineOpenState {
  const stored = readTimelineOpenState(plantId);
  const next: TimelineOpenState = { ...stored };

  for (const logId of logIds) {
    if (!(logId in next)) {
      next[logId] = true;
    }
  }

  return next;
}

export function timelineOpenStatesEqual(
  a: TimelineOpenState,
  b: TimelineOpenState,
  logIds: readonly string[],
): boolean {
  return logIds.every((logId) => (a[logId] ?? true) === (b[logId] ?? true));
}
