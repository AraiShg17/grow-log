'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CompactMarkdownContent } from '@/components/CompactMarkdownContent/CompactMarkdownContent';
import { PanelTitle } from '@/components/PanelTitle/PanelTitle';
import { icons } from '@/icons';
import styles from './PlantTimeline.module.css';

export interface TimelineLog {
  id: string;
  photoUrl: string;
  memo: string;
  aiAdvice: string;
  observedAtIso: string;
  dateLabel: string;
  dateTimeLabel: string;
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
  const [selectedLogId, setSelectedLogId] = useState(sortedLogs[0]?.id);

  const selectedLog =
    sortedLogs.find((log) => log.id === selectedLogId) ?? sortedLogs[0];

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
              const isSelected = log.id === selectedLog?.id;

              return (
                <li key={log.id} className={styles.timelineItem}>
                  <button
                    type="button"
                    className={styles.dotButton}
                    aria-label={`${log.dateTimeLabel}の観察記録を表示`}
                    aria-pressed={isSelected}
                    data-selected={isSelected ? 'true' : undefined}
                    onClick={() => setSelectedLogId(log.id)}
                  />
                  <button
                    type="button"
                    className={styles.dateButton}
                    aria-pressed={isSelected}
                    data-selected={isSelected ? 'true' : undefined}
                    onClick={() => setSelectedLogId(log.id)}
                  >
                    <span className={styles.dateLabel}>{log.dateLabel}</span>
                    {log.memo ? <span className={styles.memoPreview}>{log.memo}</span> : null}
                  </button>
                </li>
              );
            })}
          </ol>

          {selectedLog ? (
            <article className={styles.detailCard} aria-live="polite">
              <div className={styles.imageWrap}>
                <Image
                  src={selectedLog.photoUrl}
                  alt={`${plantName}の観察写真`}
                  fill
                  sizes="(max-width: 767px) 100vw, 420px"
                  className={styles.image}
                />
              </div>
              <div className={styles.detailBody}>
                <time className={styles.detailDate} dateTime={selectedLog.observedAtIso}>
                  {selectedLog.dateTimeLabel}
                </time>
                {selectedLog.memo ? <p className={styles.memo}>{selectedLog.memo}</p> : null}
                <CompactMarkdownContent
                  content={selectedLog.aiAdvice}
                  detailLabel="アドバイスの詳細を見る"
                />
              </div>
            </article>
          ) : null}
        </div>
      )}
    </section>
  );
}
