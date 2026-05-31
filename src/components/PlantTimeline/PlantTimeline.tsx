'use client';

import { updateTimelineAccordionOpenStateAction } from '@/app/actions/plants';
import { Link } from 'next-view-transitions';
import {
  PhotoGallery,
  type PhotoGalleryItem,
} from '@/components/PhotoGallery/PhotoGallery';
import { PhotoSliderModal } from '@/components/PhotoSliderModal/PhotoSliderModal';
import { useCallback, useId, useMemo, useState } from 'react';
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
  accordionOpen: boolean;
  canToggleAccordion: boolean;
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

function hasExpandableContent(log: TimelineLog): boolean {
  return log.photoUrls.length > 0 || Boolean(log.aiAdvice?.trim());
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
  const accordionId = useId();

  const sortedLogs = useMemo(
    () =>
      [...logs].sort(
        (a, b) =>
          new Date(b.observedAtIso).getTime() - new Date(a.observedAtIso).getTime(),
      ),
    [logs],
  );

  const initialOpenById = useMemo(
    () =>
      Object.fromEntries(
        sortedLogs
          .filter((log) => log.canToggleAccordion && hasExpandableContent(log))
          .map((log) => [log.id, log.accordionOpen]),
      ),
    [sortedLogs],
  );
  const accordionResetKey = useMemo(
    () =>
      `${plantId}:${sortedLogs
        .filter((log) => log.canToggleAccordion && hasExpandableContent(log))
        .map((log) => log.id)
        .join('\0')}`,
    [plantId, sortedLogs],
  );
  const persistOpenStates = useCallback(
    (openById: Record<string, boolean>) =>
      updateTimelineAccordionOpenStateAction(plantId, openById).then(() => undefined),
    [plantId],
  );
  const { isOpen, setOpen } = useTimelineAccordion({
    initialOpenById,
    persistOpenStates,
    resetKey: accordionResetKey,
  });

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
            {sortedLogs.map((log, index) => {
              const galleryItems = toGalleryItems(log);
              const hasContent =
                galleryItems.length > 0 || Boolean(log.aiAdvice?.trim());
              const canExpand = log.canToggleAccordion && hasContent;
              const open = canExpand ? isOpen(log.id) : true;
              const panelId = `${accordionId}-timeline-panel-${index}`;

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
                    <div
                      className={[
                        styles.timelineDetails,
                        open ? styles.timelineDetailsOpen : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {canExpand ? (
                        <button
                          type="button"
                          className={styles.timelineSummary}
                          aria-expanded={open}
                          aria-controls={panelId}
                          onClick={() => setOpen(log.id, !open)}
                        >
                          {summaryRow}
                        </button>
                      ) : (
                        <div className={styles.timelineSummary}>{summaryRow}</div>
                      )}
                      {hasContent ? (
                        <div id={panelId} hidden={!open}>
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
                        </div>
                      ) : null}
                    </div>
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
