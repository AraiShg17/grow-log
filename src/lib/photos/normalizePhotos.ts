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

export function normalizeAiPhotoIndices(
  indices: number[] | undefined,
  fallbackIndex: number,
  photoCount: number,
): number[] {
  if (photoCount <= 0) {
    return [];
  }

  const primary = clampAiPhotoIndex(fallbackIndex, photoCount);
  const fromArray = (indices ?? [])
    .filter(
      (index): index is number =>
        Number.isInteger(index) && index >= 0 && index < photoCount,
    )
    .filter((index, position, list) => list.indexOf(index) === position)
    .sort((a, b) => a - b);

  if (fromArray.length > 0) {
    return fromArray;
  }

  return [primary];
}

export function isAiPhotoIndex(
  index: number,
  aiPhotoIndex: number,
  aiPhotoIndices: number[] | undefined,
): boolean {
  if (aiPhotoIndices && aiPhotoIndices.length > 0) {
    return aiPhotoIndices.includes(index);
  }
  return index === aiPhotoIndex;
}
