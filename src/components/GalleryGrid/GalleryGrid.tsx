'use client';

import Image from 'next/image';
import { listGalleryPhotoPageAction } from '@/app/actions/gallery';
import { PhotoSliderModal } from '@/components/PhotoSliderModal/PhotoSliderModal';
import type { GalleryPhotoItem, GalleryPhotoPage } from '@/types/gallery';
import { useEffect, useRef, useState, useTransition } from 'react';
import styles from './GalleryGrid.module.css';

interface GalleryGridProps {
  initialPage: GalleryPhotoPage;
  maxPhotos: number;
}

export function GalleryGrid({ initialPage, maxPhotos }: GalleryGridProps) {
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

      <ul className={styles.grid} aria-label="投稿写真一覧">
        {photos.map((photo, index) => (
          <li key={photo.id} className={styles.item}>
            <button
              type="button"
              className={styles.photoButton}
              onClick={() => openPhoto(index)}
              aria-label={`ギャラリー写真 ${index + 1}枚目を拡大表示`}
            >
              <Image
                src={photo.url}
                alt={`ギャラリー写真 ${index + 1}`}
                fill
                sizes="(max-width: 768px) 33vw, 24rem"
                className={styles.image}
              />
              <span className={styles.caption}>
                <span className={styles.dateLabel}>{photo.dateLabel}</span>
              </span>
            </button>
          </li>
        ))}
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
