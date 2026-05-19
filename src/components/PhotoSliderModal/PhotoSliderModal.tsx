'use client';

import { MaterialIcon } from '@/components/MaterialIcon/MaterialIcon';
import { icons } from '@/icons';
import type { PlantPhotoItem } from '@/lib/photos/collectPlantPhotos';
import { getSwipeDirection } from '@/lib/utils/swipeDirection';
import Image from 'next/image';
import { useCallback, useEffect, useRef } from 'react';
import styles from './PhotoSliderModal.module.css';

interface PhotoSliderModalProps {
  open: boolean;
  photos: readonly PlantPhotoItem[];
  activeIndex: number;
  plantName: string;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function PhotoSliderModal({
  open,
  photos,
  activeIndex,
  plantName,
  onClose,
  onIndexChange,
}: PhotoSliderModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);

  const safeIndex =
    photos.length === 0 ? 0 : Math.min(Math.max(activeIndex, 0), photos.length - 1);
  const current = photos[safeIndex];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open) {
      dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  const goPrev = useCallback(() => {
    if (photos.length === 0) {
      return;
    }
    onIndexChange(safeIndex === 0 ? photos.length - 1 : safeIndex - 1);
  }, [onIndexChange, photos.length, safeIndex]);

  const goNext = useCallback(() => {
    if (photos.length === 0) {
      return;
    }
    onIndexChange(safeIndex === photos.length - 1 ? 0 : safeIndex + 1);
  }, [onIndexChange, photos.length, safeIndex]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goNext();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goNext, goPrev, open]);

  const onTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.changedTouches[0];
    if (!touch) {
      return;
    }
    swipeStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const onTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      const start = swipeStartRef.current;
      swipeStartRef.current = null;
      if (!start || photos.length <= 1) {
        return;
      }

      const touch = event.changedTouches[0];
      if (!touch) {
        return;
      }

      const direction = getSwipeDirection(
        start.x,
        start.y,
        touch.clientX,
        touch.clientY,
      );
      if (direction === 'next') {
        goNext();
      } else if (direction === 'prev') {
        goPrev();
      }
    },
    [goNext, goPrev, photos.length],
  );

  if (photos.length === 0) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      aria-label={`${plantName}の写真スライダー`}
    >
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.meta}>
            <p className={styles.counter}>
              {safeIndex + 1} / {photos.length}
            </p>
            <p className={styles.dateLabel}>{current?.dateLabel ?? ''}</p>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="閉じる"
            onClick={onClose}
          >
            <MaterialIcon name={icons.close} size="sm" />
          </button>
        </header>

        <div
          className={styles.stage}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onTouchCancel={() => {
            swipeStartRef.current = null;
          }}
        >
          <button
            type="button"
            className={styles.navButton}
            aria-label="前の写真"
            onClick={goPrev}
            disabled={photos.length <= 1}
          >
            <MaterialIcon name={icons.chevronLeft} size="sm" />
          </button>

          <div className={styles.imageWrap}>
            <Image
              key={current.id}
              src={current.url}
              alt={`${plantName}の写真 ${safeIndex + 1}`}
              fill
              sizes="100vw"
              className={styles.image}
              priority
            />
            {current.isAiPhoto ? <span className={styles.aiBadge}>AI分析</span> : null}
          </div>

          <button
            type="button"
            className={styles.navButton}
            aria-label="次の写真"
            onClick={goNext}
            disabled={photos.length <= 1}
          >
            <MaterialIcon name={icons.chevronRight} size="sm" />
          </button>
        </div>
      </div>
    </dialog>
  );
}
