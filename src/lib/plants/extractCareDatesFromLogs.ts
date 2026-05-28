import { getCareLogMemo } from '@/lib/plants/careLogMemos';
import { primaryPhotoUrl } from '@/lib/photos/normalizePhotos';
import type { PlantLogDocument } from '@/types/plant';

const WATER_MEMO = getCareLogMemo('water');
const FERTILIZE_MEMO = getCareLogMemo('fertilize');

export interface PlantListCareMetadata {
  latestPhotoUrl?: string;
  lastWateredAt?: Date;
  lastFertilizedAt?: Date;
}

/** observedAt 降順のログから一覧用メタデータを抽出 */
export function extractCareDatesFromLogs(
  logs: readonly { data: () => PlantLogDocument }[],
): PlantListCareMetadata {
  let latestPhotoUrl: string | undefined;
  let lastWateredAt: Date | undefined;
  let lastFertilizedAt: Date | undefined;

  for (const log of logs) {
    const data = log.data();

    if (!latestPhotoUrl) {
      const primary = primaryPhotoUrl(data.photoUrls);
      if (primary) {
        latestPhotoUrl = primary;
      }
    }

    if (!lastWateredAt && data.memo === WATER_MEMO) {
      lastWateredAt = data.observedAt.toDate();
    }

    if (!lastFertilizedAt && data.memo === FERTILIZE_MEMO) {
      lastFertilizedAt = data.observedAt.toDate();
    }

    if (latestPhotoUrl && lastWateredAt && lastFertilizedAt) {
      break;
    }
  }

  return { latestPhotoUrl, lastWateredAt, lastFertilizedAt };
}
