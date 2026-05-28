'use client';

import { useRouter } from 'next/navigation';
import { MaterialIcon } from '@/components/MaterialIcon/MaterialIcon';
import { icons } from '@/icons';
import styles from './HistoryBackButton.module.css';

interface HistoryBackButtonProps {
  ariaLabel?: string;
}

export function HistoryBackButton({ ariaLabel = '戻る' }: HistoryBackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={styles.button}
      aria-label={ariaLabel}
      onClick={() => router.back()}
    >
      <MaterialIcon name={icons.chevronLeft} size="sm" />
    </button>
  );
}
