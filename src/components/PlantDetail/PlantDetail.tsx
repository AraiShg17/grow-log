import { CompactMarkdownContent } from '@/components/CompactMarkdownContent/CompactMarkdownContent';
import { PanelTitle } from '@/components/PanelTitle/PanelTitle';
import {
  PlantTimeline,
  type TimelineLog,
} from '@/components/PlantTimeline/PlantTimeline';
import { icons } from '@/icons';
import { collectPlantPhotos } from '@/lib/photos/collectPlantPhotos';
import { normalizePhotoUrls } from '@/lib/photos/normalizePhotos';
import { formatDateTime } from '@/lib/utils/formatDate';
import type { Plant, PlantLog } from '@/types/plant';
import styles from './PlantDetail.module.css';

interface PlantDetailProps {
  plant: Plant;
  logs: PlantLog[];
}

export function PlantDetail({ plant, logs }: PlantDetailProps) {
  const timelineLogs: TimelineLog[] = [
    {
      id: `${plant.id}-initial`,
      photoUrls: normalizePhotoUrls(plant.photoUrls),
      aiPhotoIndex: plant.aiPhotoIndex,
      memo: '植物を登録しました。',
      aiAdvice: null,
      observedAtIso: plant.createdAt.toISOString(),
      dateLabel: formatDateTime(plant.createdAt),
      canDelete: false,
    },
    ...logs.map((log) => ({
      id: log.id,
      photoUrls: normalizePhotoUrls(log.photoUrls),
      aiPhotoIndex: log.aiPhotoIndex,
      aiPhotoIndices: log.aiPhotoIndices,
      memo: log.memo,
      aiAdvice: log.aiAdvice,
      observedAtIso: log.observedAt.toISOString(),
      dateLabel: formatDateTime(log.observedAt),
      canDelete: true,
    })),
  ];
  const addLogHref = `/plants/${plant.id}/logs/new`;
  const allPhotos = collectPlantPhotos(plant, logs);

  return (
    <div className={styles.container}>
      <div className={styles.detailGrid}>
        <PlantTimeline
          plantId={plant.id}
          plantName={plant.name}
          logs={timelineLogs}
          allPhotos={allPhotos}
          addLogHref={addLogHref}
        />

        <section className={styles.carePanel} aria-labelledby="care-guide-heading">
          <PanelTitle id="care-guide-heading" icon={icons.tempPreferencesEco}>
            AI育成方法
          </PanelTitle>
          <CompactMarkdownContent
            content={plant.careGuide}
            detailLabel="育成の詳細を見る"
          />
        </section>
      </div>
    </div>
  );
}
