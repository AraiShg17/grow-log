'use client';

import { Link } from 'next-view-transitions';
import {
  PhotoGallery,
  type PhotoGalleryItem,
} from '@/components/PhotoGallery/PhotoGallery';
import { PhotoSliderModal } from '@/components/PhotoSliderModal/PhotoSliderModal';
import { useEffect, useMemo, useState } from 'react';
import { MarkdownContent } from '@/components/MarkdownContent/MarkdownContent';
import { PlantLogDeleteButton } from '@/components/PlantLogDeleteButton/PlantLogDeleteButton';
import { PanelTitle } from '@/components/PanelTitle/PanelTitle';
import { useTimelineAccordion } from '@/hooks/useTimelineAccordion';
import { icons } from '@/icons';
import type { PlantPhotoItem } from '@/lib/photos/collectPlantPhotos';
import { rememberPlantListAnchor } from '@/lib/navigation/plantListAnchor';
import { isAiPhotoIndex } from '@/lib/photos/normalizePhotos';
import styles from './PlantTimeline.module.css';

export interface TimelineLog {
  id: string;
  photoUrls: string[];
  aiPhotoIndex?: number;
  aiPhotoIndices?: number[];
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
  const aiPhotoIndex = log.aiPhotoIndex ?? 0;
  return log.photoUrls.map((url, index) => ({
    id: `${log.id}-${index}`,
    url,
    isAiPhoto: isAiPhotoIndex(index, aiPhotoIndex, log.aiPhotoIndices),
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
  const [animateDetails, setAnimateDetails] = useState(false);

  useEffect(() => {
    setAnimateDetails(true);
  }, []);

  const sortedLogs = useMemo(
    () =>
      [...logs].sort(
        (a, b) =>
          new Date(b.observedAtIso).getTime() - new Date(a.observedAtIso).getTime(),
      ),
    [logs],
  );

  const logIds = useMemo(() => sortedLogs.map((log) => log.id), [sortedLogs]);
  const { isOpen, setOpen } = useTimelineAccordion(plantId, logIds);

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
        <Link
          href={addLogHref}
          className={styles.addLink}
          onClick={() => rememberPlantListAnchor(plantId)}
        >
          観察記録を追加
        </Link>
      </div>

      {sortedLogs.length === 0 ? (
        <div className={styles.empty}>
          <p>まだ観察記録がありません。</p>
          <Link
            href={addLogHref}
            className={styles.addLink}
            onClick={() => rememberPlantListAnchor(plantId)}
          >
            最初の観察記録を追加する
          </Link>
        </div>
      ) : (
        <div className={styles.timelineLayout}>
          <ol className={styles.timelineList}>
            {sortedLogs.map((log) => {
              const galleryItems = toGalleryItems(log);
              const hasDetailContent =
                galleryItems.length > 0 || Boolean(log.aiAdvice?.trim());
              const open = isOpen(log.id);

              const summaryRow = (
                <>
                  <span className={styles.dot} aria-hidden="true" />
                  <span className={styles.summaryText}>
                    <time className={styles.dateLabel} dateTime={log.observedAtIso}>
                      {log.dateLabel}
                    </time>
                    {log.memo ? (
                      <span className={styles.memoText}>{log.memo}</span>
                    ) : null}
                  </span>
                </>
              );

              return (
                <li
                  key={log.id}
                  className={[styles.timelineItem, styles.timelineItemInteractive]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className={styles.entryRow}>
                    <details
                      className={[
                        styles.timelineDetails,
                        animateDetails ? styles.timelineDetailsAnimated : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      open={open}
                      onToggle={(event) => {
                        setOpen(log.id, event.currentTarget.open);
                      }}
                    >
                      <summary className={styles.timelineSummary}>{summaryRow}</summary>
                      {hasDetailContent ? (
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
                      ) : null}
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
