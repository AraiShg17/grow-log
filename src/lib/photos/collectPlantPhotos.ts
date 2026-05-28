import { isAiPhotoIndex, normalizePhotoUrls } from '@/lib/photos/normalizePhotos';
import { formatDateTime } from '@/lib/utils/formatDate';
import type { Plant, PlantLog } from '@/types/plant';

export type PlantPhotoItem = {
  id: string;
  url: string;
  dateLabel: string;
  observedAtIso: string;
  isAiPhoto: boolean;
};

/** 登録写真と全観察記録の写真を時系列（古い順）で集める */
export function collectPlantPhotos(
  plant: Plant,
  logs: readonly PlantLog[],
): PlantPhotoItem[] {
  const items: PlantPhotoItem[] = [];

  normalizePhotoUrls(plant.photoUrls).forEach((url, index) => {
    items.push({
      id: `${plant.id}-initial-${index}`,
      url,
      dateLabel: formatDateTime(plant.createdAt),
      observedAtIso: plant.createdAt.toISOString(),
      isAiPhoto: index === plant.aiPhotoIndex,
    });
  });

  const sortedLogs = [...logs].sort(
    (a, b) => a.observedAt.getTime() - b.observedAt.getTime(),
  );

  for (const log of sortedLogs) {
    const urls = normalizePhotoUrls(log.photoUrls);
    urls.forEach((url, index) => {
      items.push({
        id: `${log.id}-${index}`,
        url,
        dateLabel: formatDateTime(log.observedAt),
        observedAtIso: log.observedAt.toISOString(),
        isAiPhoto: isAiPhotoIndex(index, log.aiPhotoIndex, log.aiPhotoIndices),
      });
    });
  }

  return items;
}
