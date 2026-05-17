import { CompactMarkdownContent } from '@/components/CompactMarkdownContent/CompactMarkdownContent';
import { PanelTitle } from '@/components/PanelTitle/PanelTitle';
import {
  PlantTimeline,
  type TimelineLog,
} from '@/components/PlantTimeline/PlantTimeline';
import { icons } from '@/icons';
import { formatDate, formatDateTime } from '@/lib/utils/formatDate';
import type { Plant, PlantLog } from '@/types/plant';
import styles from './PlantDetail.module.css';

interface PlantDetailProps {
  plant: Plant;
  logs: PlantLog[];
}

export function PlantDetail({ plant, logs }: PlantDetailProps) {
  const timelineLogs: TimelineLog[] = logs.map((log) => ({
    id: log.id,
    photoUrl: log.photoUrl,
    memo: log.memo,
    aiAdvice: log.aiAdvice,
    observedAtIso: log.observedAt.toISOString(),
    dateLabel: formatDate(log.observedAt),
    dateTimeLabel: formatDateTime(log.observedAt),
  }));
  const addLogHref = `/plants/${plant.id}/logs/new`;

  return (
    <div className={styles.container}>
      <div className={styles.detailGrid}>
        <PlantTimeline
          plantName={plant.name}
          logs={timelineLogs}
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
