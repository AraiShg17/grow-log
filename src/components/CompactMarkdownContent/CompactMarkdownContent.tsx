import { MarkdownContent } from '@/components/MarkdownContent/MarkdownContent';
import { parseCompactSections } from '@/lib/markdown/parseCompactSections';
import styles from './CompactMarkdownContent.module.css';

interface CompactMarkdownContentProps {
  content: string;
  detailLabel?: string;
}

export function CompactMarkdownContent({
  content,
  detailLabel = '詳細を見る',
}: CompactMarkdownContentProps) {
  const { summary, detail, detailSections } = parseCompactSections(content);

  return (
    <div className={styles.wrapper}>
      <MarkdownContent content={summary} />
      {detailSections.length > 0 ? (
        <div className={styles.sectionList} aria-label={detailLabel}>
          {detailSections.map((section) => (
            <details key={section.title} className={styles.details}>
              <summary className={styles.summary}>{section.title}</summary>
              <div className={styles.detailBody}>
                <MarkdownContent content={section.content} />
              </div>
            </details>
          ))}
        </div>
      ) : detail ? (
        <details className={styles.details}>
          <summary className={styles.summary}>{detailLabel}</summary>
          <div className={styles.detailBody}>
            <MarkdownContent content={detail} />
          </div>
        </details>
      ) : null}
    </div>
  );
}
