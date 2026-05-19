'use client';

import { Link } from 'next-view-transitions';
import {
  PhotoGallery,
  type PhotoGalleryItem,
} from '@/components/PhotoGallery/PhotoGallery';
import { PhotoSliderModal } from '@/components/PhotoSliderModal/PhotoSliderModal';
import { useMemo, useState } from 'react';
import { MarkdownContent } from '@/components/MarkdownContent/MarkdownContent';
import { PlantLogDeleteButton } from '@/components/PlantLogDeleteButton/PlantLogDeleteButton';
import { PanelTitle } from '@/components/PanelTitle/PanelTitle';
import { icons } from '@/icons';
import type { PlantPhotoItem } from '@/lib/photos/collectPlantPhotos';
import { hasExpandableTimelineDetail } from '@/lib/photos/normalizePhotos';
import styles from './PlantTimeline.module.css';

export interface TimelineLog {
  id: string;
  photoUrls: string[];
  aiPhotoIndex?: number;
  memo: string;
  aiAdvice: string | null;
  observedAtIso: string;
  dateLabel: string;
  /** Firestore の観察記録のみ削除可能（登録行は false） */
  canDelete: boolean;
}

interface PlantTimelineProps {
  plantId: string;
  plantName: string;
  logs: TimelineLog[];
  allPhotos: readonly PlantPhotoItem[];
  addLogHref: string;
}

function toGalleryItems(log: TimelineLog): PhotoGalleryItem[] {
  return log.photoUrls.map((url, index) => ({
    id: `${log.id}-${index}`,
    url,
    isAiPhoto: typeof log.aiPhotoIndex === 'number' && index === log.aiPhotoIndex,
  }));
}

function renderDeleteButton(plantId: string, log: TimelineLog) {
  if (!log.canDelete) {
    return null;
  }
  return <PlantLogDeleteButton plantId={plantId} logId={log.id} />;
}

export function PlantTimeline({
  plantId,
  plantName,
  logs,
  allPhotos,
  addLogHref,
}: PlantTimelineProps) {
  const [sliderOpen, setSliderOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const sortedLogs = useMemo(
    () =>
      [...logs].sort(
        (a, b) =>
          new Date(b.observedAtIso).getTime() - new Date(a.observedAtIso).getTime(),
      ),
    [logs],
  );

  function openPhoto(photoId: string) {
    const index = allPhotos.findIndex((photo) => photo.id === photoId);
    if (index < 0) {
      return;
    }
    setActiveIndex(index);
    setSliderOpen(true);
  }

  return (
    <section className={styles.panel} aria-labelledby="timeline-heading">
      <div className={styles.header}>
        <PanelTitle id="timeline-heading" icon={icons.photoCamera}>
          観察年表
        </PanelTitle>
        <Link href={addLogHref} className={styles.addLink}>
          観察記録を追加
        </Link>
      </div>

      {sortedLogs.length === 0 ? (
        <div className={styles.empty}>
          <p>まだ観察記録がありません。</p>
          <Link href={addLogHref} className={styles.addLink}>
            最初の観察記録を追加する
          </Link>
        </div>
      ) : (
        <div className={styles.timelineLayout}>
          <ol className={styles.timelineList}>
            {sortedLogs.map((log) => {
              const galleryItems = toGalleryItems(log);
              const hasDetail = hasExpandableTimelineDetail({
                photoUrls: log.photoUrls,
                aiAdvice: log.aiAdvice,
              });
              const summaryRow = (
                <>
                  <span className={styles.dot} aria-hidden="true" />
                  <span className={styles.summaryText}>
                    <time className={styles.dateLabel} dateTime={log.observedAtIso}>
                      {log.dateLabel}
                    </time>
                    {log.memo ? (
                      <span className={styles.memoPreview}>{log.memo}</span>
                    ) : null}
                  </span>
                </>
              );

              if (!hasDetail) {
                return (
                  <li
                    key={log.id}
                    className={[styles.timelineItem, styles.timelineItemStatic]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <div className={styles.entryRow}>
                      <div className={styles.timelineStatic}>{summaryRow}</div>
                      {renderDeleteButton(plantId, log)}
                    </div>
                  </li>
                );
              }

              return (
                <li
                  key={log.id}
                  className={[styles.timelineItem, styles.timelineItemInteractive]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className={styles.entryRow}>
                    <details className={styles.timelineDetails} open>
                      <summary className={styles.timelineSummary}>{summaryRow}</summary>
                      <article className={styles.detailCard} aria-live="polite">
                        {galleryItems.length > 0 ? (
                          <PhotoGallery
                            items={galleryItems}
                            alt={`${plantName}の観察写真`}
                            onPhotoClick={openPhoto}
                          />
                        ) : null}
                        {log.aiAdvice?.trim() ? (
                          <div className={styles.detailBody}>
                            <MarkdownContent content={log.aiAdvice} />
                          </div>
                        ) : null}
                      </article>
                    </details>
                    {renderDeleteButton(plantId, log)}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <PhotoSliderModal
        open={sliderOpen}
        photos={allPhotos}
        activeIndex={activeIndex}
        plantName={plantName}
        onClose={() => setSliderOpen(false)}
        onIndexChange={setActiveIndex}
      />
    </section>
  );
}
