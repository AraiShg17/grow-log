export const PLANT_LIST_ANCHOR_PREFIX = 'plant-';
export const PLANT_LIST_ANCHOR_SESSION_KEY = 'grow-log-list-anchor';

interface StoredPlantListAnchor {
  plantId: string;
  pathname: string;
}

export function plantListAnchorId(plantId: string): string {
  return `${PLANT_LIST_ANCHOR_PREFIX}${plantId}`;
}

export function plantListAnchorHref(plantId: string, pathname = '/'): string {
  return `${pathname}#${plantListAnchorId(plantId)}`;
}

export function rememberPlantListAnchor(plantId: string, pathname = '/'): void {
  try {
    sessionStorage.setItem(
      PLANT_LIST_ANCHOR_SESSION_KEY,
      JSON.stringify({ plantId, pathname }),
    );
  } catch {
    // ignore
  }
}

export function consumePlantListAnchorFromSession(): StoredPlantListAnchor | null {
  try {
    const raw = sessionStorage.getItem(PLANT_LIST_ANCHOR_SESSION_KEY);
    if (!raw) {
      return null;
    }

    sessionStorage.removeItem(PLANT_LIST_ANCHOR_SESSION_KEY);

    try {
      const parsed = JSON.parse(raw) as Partial<StoredPlantListAnchor>;
      if (typeof parsed.plantId === 'string' && parsed.plantId) {
        return {
          plantId: parsed.plantId,
          pathname: typeof parsed.pathname === 'string' ? parsed.pathname : '/',
        };
      }
    } catch {
      return { plantId: raw, pathname: '/' };
    }

    return null;
  } catch {
    return null;
  }
}
