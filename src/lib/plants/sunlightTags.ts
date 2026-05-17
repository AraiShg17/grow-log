export const SUNLIGHT_TAG_OPTIONS = [
  { id: 'full_sun', label: '日向' },
  { id: 'partial_sun', label: '半日向' },
  { id: 'shade', label: '日陰' },
] as const;

export type SunlightTagId = (typeof SUNLIGHT_TAG_OPTIONS)[number]['id'];

const SUNLIGHT_IDS = new Set<string>(SUNLIGHT_TAG_OPTIONS.map((o) => o.id));

export function isSunlightTagId(value: string): value is SunlightTagId {
  return SUNLIGHT_IDS.has(value);
}

export function getSunlightTagLabel(id: SunlightTagId | undefined): string | null {
  if (!id) {
    return null;
  }
  const found = SUNLIGHT_TAG_OPTIONS.find((o) => o.id === id);
  return found?.label ?? null;
}
