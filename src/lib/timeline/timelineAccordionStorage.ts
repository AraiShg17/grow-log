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
