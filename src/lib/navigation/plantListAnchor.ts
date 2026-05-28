export const PLANT_LIST_ANCHOR_PREFIX = 'plant-';
export const PLANT_LIST_ANCHOR_SESSION_KEY = 'grow-log-list-anchor';

export function plantListAnchorId(plantId: string): string {
  return `${PLANT_LIST_ANCHOR_PREFIX}${plantId}`;
}

export function plantListAnchorHref(plantId: string): string {
  return `/#${plantListAnchorId(plantId)}`;
}

export function rememberPlantListAnchor(plantId: string): void {
  try {
    sessionStorage.setItem(PLANT_LIST_ANCHOR_SESSION_KEY, plantId);
  } catch {
    // ignore
  }
}

export function consumePlantListAnchorFromSession(): string | null {
  try {
    const plantId = sessionStorage.getItem(PLANT_LIST_ANCHOR_SESSION_KEY);
    if (plantId) {
      sessionStorage.removeItem(PLANT_LIST_ANCHOR_SESSION_KEY);
    }
    return plantId;
  } catch {
    return null;
  }
}
