'use client';

import Image from 'next/image';
import styles from './PhotoGallery.module.css';

export type PhotoGalleryItem = {
  id: string;
  url: string;
  isAiPhoto: boolean;
};

interface PhotoGalleryProps {
  items: readonly PhotoGalleryItem[];
  alt: string;
  onPhotoClick: (photoId: string) => void;
}

export function PhotoGallery({ items, alt, onPhotoClick }: PhotoGalleryProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul className={styles.grid} aria-label={alt}>
      {items.map((item, index) => (
        <li key={item.id}>
          <button
            type="button"
            className={styles.cellButton}
            onClick={() => onPhotoClick(item.id)}
            aria-label={`${alt} ${index + 1}枚目を拡大表示`}
          >
            <Image
              src={item.url}
              alt=""
              fill
              sizes="(max-width: 640px) 33vw, 280px"
              className={styles.image}
            />
            {item.isAiPhoto ? <span className={styles.aiMark}>AI</span> : null}
          </button>
        </li>
      ))}
    </ul>
  );
}
