/** Firestore の photoUrls を正規化（空文字を除外） */
export function normalizePhotoUrls(photoUrls?: string[]): string[] {
  return (photoUrls ?? [])
    .filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
    .map((url) => url.trim());
}

export function primaryPhotoUrl(photoUrls?: string[]): string {
  return normalizePhotoUrls(photoUrls)[0] ?? '';
}

export function hasExpandableTimelineDetail(input: {
  photoUrls?: string[];
  aiAdvice?: string | null;
}): boolean {
  return (
    normalizePhotoUrls(input.photoUrls).length > 0 || Boolean(input.aiAdvice?.trim())
  );
}

export function clampAiPhotoIndex(
  index: number | undefined,
  photoCount: number,
): number {
  if (photoCount <= 0) {
    return 0;
  }
  if (
    typeof index !== 'number' ||
    !Number.isInteger(index) ||
    index < 0 ||
    index >= photoCount
  ) {
    return 0;
  }
  return index;
}
