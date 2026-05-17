'use client';

import Image from 'next/image';
import { useState } from 'react';
import styles from './PhotoGallery.module.css';

interface PhotoGalleryProps {
  photoUrls: string[];
  alt: string;
  sizes?: string;
  /** AI 分析に使った写真のインデックス（バッジ表示用） */
  aiPhotoIndex?: number;
}

export function PhotoGallery({
  photoUrls,
  alt,
  sizes = '(max-width: 899px) 100vw, 420px',
  aiPhotoIndex,
}: PhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (photoUrls.length === 0) {
    return null;
  }

  const safeIndex = Math.min(activeIndex, photoUrls.length - 1);
  const mainUrl = photoUrls[safeIndex] ?? photoUrls[0];

  return (
    <div className={styles.gallery}>
      <div className={styles.mainWrap}>
        <Image
          src={mainUrl}
          alt={alt}
          fill
          sizes={sizes}
          className={styles.mainImage}
          priority={safeIndex === 0}
        />
        {typeof aiPhotoIndex === 'number' && safeIndex === aiPhotoIndex ? (
          <span className={styles.aiBadge}>AI分析</span>
        ) : null}
      </div>

      {photoUrls.length > 1 ? (
        <ul className={styles.thumbs} aria-label="写真の切り替え">
          {photoUrls.map((url, index) => (
            <li key={`${url}-${index}`}>
              <button
                type="button"
                className={[
                  styles.thumbButton,
                  index === safeIndex ? styles.thumbButtonActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setActiveIndex(index)}
                aria-label={`写真${index + 1}を表示`}
                aria-current={index === safeIndex ? 'true' : undefined}
              >
                <Image
                  src={url}
                  alt=""
                  width={56}
                  height={56}
                  className={styles.thumbImage}
                />
                {typeof aiPhotoIndex === 'number' && index === aiPhotoIndex ? (
                  <span className={styles.thumbAiMark}>AI</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
