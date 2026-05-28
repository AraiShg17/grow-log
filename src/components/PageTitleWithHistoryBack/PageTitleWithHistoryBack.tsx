import { HistoryBackButton } from '@/components/HistoryBackButton/HistoryBackButton';
import styles from './PageTitleWithHistoryBack.module.css';

interface PageTitleWithHistoryBackProps {
  title: string;
}

export function PageTitleWithHistoryBack({ title }: PageTitleWithHistoryBackProps) {
  return (
    <div className={styles.row}>
      <HistoryBackButton />
      <h1 className={styles.title}>{title}</h1>
    </div>
  );
}
