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
  const { summary, detail } = parseCompactSections(content);

  return (
    <div className={styles.wrapper}>
      <MarkdownContent content={summary} />
      {detail ? (
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
