'use client';

import { useEffect } from 'react';
import styles from './LoadingOverlay.module.css';

interface LoadingOverlayProps {
  active: boolean;
  message?: string;
}

export function LoadingOverlay({
  active,
  message = '処理中です…',
}: LoadingOverlayProps) {
  useEffect(() => {
    if (!active) {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);

  if (!active) {
    return null;
  }

  return (
    <div
      className={styles.overlay}
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      aria-live="polite"
      aria-label={message}
    >
      <div className={styles.dialog}>
        <div className={styles.spinner} aria-hidden="true" />
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
}
