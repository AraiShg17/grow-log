'use client';

import Image from 'next/image';
import { Link } from 'next-view-transitions';
import { type SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react';
import { CompactMarkdownContent } from '@/components/CompactMarkdownContent/CompactMarkdownContent';
import { PanelTitle } from '@/components/PanelTitle/PanelTitle';
import { icons } from '@/icons';
import styles from './PlantTimeline.module.css';

export interface TimelineLog {
  id: string;
  photoUrl: string;
  memo: string;
  aiAdvice: string | null;
  observedAtIso: string;
  dateLabel: string;
  dateTimeLabel: string;
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
              return (
                <li key={log.id} className={styles.timelineItem}>
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
                    <summary className={styles.timelineSummary}>
                      <span className={styles.dot} aria-hidden="true" />
                      <span className={styles.summaryText}>
                        <span className={styles.dateLabel}>{log.dateLabel}</span>
                        {log.memo ? (
                          <span className={styles.memoPreview}>{log.memo}</span>
                        ) : null}
                      </span>
                    </summary>
                    <article className={styles.detailCard} aria-live="polite">
                      <div className={styles.imageWrap}>
                        <Image
                          src={log.photoUrl}
                          alt={`${plantName}の観察写真`}
                          fill
                          sizes="(max-width: 899px) 100vw, 420px"
                          className={styles.image}
                        />
                      </div>
                      <div className={styles.detailBody}>
                        <time
                          className={styles.detailDate}
                          dateTime={log.observedAtIso}
                        >
                          {log.dateTimeLabel}
                        </time>
                        {log.memo ? <p className={styles.memo}>{log.memo}</p> : null}
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
