/** Firestore の旧フィールド（photoUrl / firstPhotoUrl）と新フィールド（photoUrls）を統一 */
export function normalizePhotoUrls(
  photoUrls: string[] | undefined,
  legacyUrl: string | undefined,
): string[] {
  if (photoUrls && photoUrls.length > 0) {
    return photoUrls;
  }
  if (legacyUrl) {
    return [legacyUrl];
  }
  return [];
}

export function primaryPhotoUrl(urls: string[], legacyUrl?: string): string {
  const list = normalizePhotoUrls(urls, legacyUrl);
  return list[0] ?? '';
}

export function clampAiPhotoIndex(index: number | undefined, photoCount: number): number {
  if (photoCount <= 0) {
    return 0;
  }
  if (typeof index !== 'number' || !Number.isInteger(index) || index < 0 || index >= photoCount) {
    return 0;
  }
  return index;
}
