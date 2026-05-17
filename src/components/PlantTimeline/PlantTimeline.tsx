'use client';

import { Link } from 'next-view-transitions';
import { PhotoGallery } from '@/components/PhotoGallery/PhotoGallery';
import { type SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react';
import { CompactMarkdownContent } from '@/components/CompactMarkdownContent/CompactMarkdownContent';
import { PanelTitle } from '@/components/PanelTitle/PanelTitle';
import { icons } from '@/icons';
import styles from './PlantTimeline.module.css';

export interface TimelineLog {
  id: string;
  photoUrls: string[];
  aiPhotoIndex?: number;
  memo: string;
  aiAdvice: string | null;
  observedAtIso: string;
  dateLabel: string;
  detailLabel: string | null;
}

interface PlantTimelineProps {
  plantName: string;
  logs: TimelineLog[];
  addLogHref: string;
}

export function PlantTimeline({ plantName, logs, addLogHref }: PlantTimelineProps) {
  const sortedLogs = useMemo(
    () =>
      [...logs].sort(
        (a, b) =>
          new Date(b.observedAtIso).getTime() - new Date(a.observedAtIso).getTime(),
      ),
    [logs],
  );

  const latestId = sortedLogs[0]?.id;
  const [latestOpen, setLatestOpen] = useState(true);
  const prevLatestIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (latestId === undefined) {
      return;
    }
    if (prevLatestIdRef.current !== latestId) {
      prevLatestIdRef.current = latestId;
      setLatestOpen(true);
    }
  }, [latestId]);

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
              const isLatest = log.id === latestId;
              const hasDetail =
                log.photoUrls.length > 0 || Boolean(log.aiAdvice?.trim());
              const summaryRow = (
                <>
                  <span className={styles.dot} aria-hidden="true" />
                  <span className={styles.summaryText}>
                    <time
                      className={styles.dateLabel}
                      dateTime={log.observedAtIso}
                    >
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
                    <div className={styles.timelineStatic}>{summaryRow}</div>
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
                  <details
                    className={styles.timelineDetails}
                    {...(isLatest
                      ? {
                          open: latestOpen,
                          onToggle: (e: SyntheticEvent<HTMLDetailsElement>) => {
                            setLatestOpen(e.currentTarget.open);
                          },
                        }
                      : {})}
                  >
                    <summary className={styles.timelineSummary}>{summaryRow}</summary>
                    <article className={styles.detailCard} aria-live="polite">
                      {log.photoUrls.length > 0 ? (
                        <PhotoGallery
                          photoUrls={log.photoUrls}
                          alt={`${plantName}の観察写真`}
                          aiPhotoIndex={log.aiPhotoIndex}
                        />
                      ) : null}
                      <div className={styles.detailBody}>
                        {log.photoUrls.length > 0 && log.memo ? (
                          <p className={styles.memo}>{log.memo}</p>
                        ) : null}
                        {log.aiAdvice ? (
                          <CompactMarkdownContent
                            content={log.aiAdvice}
                            detailLabel={log.detailLabel ?? '詳細を見る'}
                          />
                        ) : null}
                      </div>
                    </article>
                  </details>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}
