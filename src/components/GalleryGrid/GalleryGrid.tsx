'use client';

import Image from 'next/image';
import { listGalleryPhotoPageAction } from '@/app/actions/gallery';
import { MaterialIcon } from '@/components/MaterialIcon/MaterialIcon';
import { PhotoSliderModal } from '@/components/PhotoSliderModal/PhotoSliderModal';
import { icons } from '@/icons';
import type { GalleryPhotoItem, GalleryPhotoPage } from '@/types/gallery';
import { useEffect, useRef, useState, useTransition } from 'react';
import styles from './GalleryGrid.module.css';

interface GalleryGridProps {
  initialPage: GalleryPhotoPage;
  maxPhotos: number;
  selectionMode: boolean;
  selectedIds: ReadonlySet<string>;
  deleteError: string | null;
  onToggleSelect: (photoId: string) => void;
  onSelectAll: (photoIds: readonly string[]) => void;
  onClearSelection: () => void;
  onExitSelectionMode: () => void;
}

export function GalleryGrid({
  initialPage,
  maxPhotos,
  selectionMode,
  selectedIds,
  deleteError,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onExitSelectionMode,
}: GalleryGridProps) {
  const [photos, setPhotos] = useState<GalleryPhotoItem[]>(initialPage.photos);
  const [totalCount, setTotalCount] = useState(initialPage.totalCount);
  const [nextCursor, setNextCursor] = useState(initialPage.nextCursor);
  const [sliderOpen, setSliderOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    setPhotos(initialPage.photos);
    setTotalCount(initialPage.totalCount);
    setNextCursor(initialPage.nextCursor);
    setError(null);
    loadingRef.current = false;
  }, [initialPage]);

  useEffect(() => {
    if (selectionMode) {
      setSliderOpen(false);
    }
  }, [selectionMode]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !nextCursor || pending) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || loadingRef.current) {
          return;
        }

        loadingRef.current = true;
        startTransition(async () => {
          try {
            const page = await listGalleryPhotoPageAction(nextCursor);
            setPhotos((current) => [...current, ...page.photos]);
            setTotalCount(page.totalCount);
            setNextCursor(page.nextCursor);
            setError(null);
          } catch {
            setError('追加の写真を読み込めませんでした。');
          } finally {
            loadingRef.current = false;
          }
        });
      },
      { rootMargin: '320px 0px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [nextCursor, pending]);

  function openPhoto(index: number) {
    setActiveIndex(index);
    setSliderOpen(true);
  }

  function handlePhotoClick(index: number, photoId: string) {
    if (selectionMode) {
      onToggleSelect(photoId);
      return;
    }
    openPhoto(index);
  }

  const allPhotoIds = photos.map((photo) => photo.id);

  if (photos.length === 0) {
    return (
      <div className={styles.empty}>
        <p>まだ写真が投稿されていません。</p>
        <p>「画像を投稿」から写真を追加できます。</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.status} aria-live="polite">
        <p>
          {totalCount} / {maxPhotos}
        </p>
        <p>{photos.length}枚表示中</p>
      </div>

      {selectionMode ? (
        <div className={styles.selectionBar}>
          <p className={styles.selectionHint}>削除する写真を選択してください</p>
          <div className={styles.selectionActions}>
            <button
              type="button"
              className={styles.textButton}
              onClick={() => onSelectAll(allPhotoIds)}
            >
              すべて選択
            </button>
            <button
              type="button"
              className={styles.textButton}
              onClick={onClearSelection}
            >
              選択を解除
            </button>
            <button
              type="button"
              className={styles.textButton}
              onClick={onExitSelectionMode}
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : null}

      {deleteError ? <p className={styles.error}>{deleteError}</p> : null}

      <ul
        className={
          selectionMode ? `${styles.grid} ${styles.gridSelecting}` : styles.grid
        }
        aria-label={selectionMode ? '削除する写真を選択' : '投稿写真一覧'}
      >
        {photos.map((photo, index) => {
          const selected = selectedIds.has(photo.id);

          return (
            <li key={photo.id} className={styles.item}>
              <button
                type="button"
                className={[
                  styles.photoButton,
                  selectionMode ? styles.photoButtonSelectable : '',
                  selected ? styles.photoButtonSelected : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handlePhotoClick(index, photo.id)}
                aria-label={
                  selectionMode
                    ? `${photo.dateLabel} ${selected ? '選択済み' : '未選択'}`
                    : `ギャラリー写真 ${index + 1}枚目を拡大表示`
                }
                aria-pressed={selectionMode ? selected : undefined}
              >
                <Image
                  src={photo.url}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 33vw, 24rem"
                  className={styles.image}
                />
                {selectionMode ? (
                  <span className={styles.selectMark} aria-hidden>
                    {selected ? <MaterialIcon name={icons.check} size="sm" /> : null}
                  </span>
                ) : (
                  <span className={styles.caption}>
                    <span className={styles.dateLabel}>{photo.dateLabel}</span>
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div ref={sentinelRef} className={styles.sentinel} aria-hidden />
      {pending ? <p className={styles.loading}>写真を読み込んでいます…</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}

      <PhotoSliderModal
        open={sliderOpen}
        photos={photos}
        activeIndex={activeIndex}
        plantName="ギャラリー"
        onClose={() => setSliderOpen(false)}
        onIndexChange={setActiveIndex}
      />
    </>
  );
}
