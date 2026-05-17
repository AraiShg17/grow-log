'use client';

import Image from 'next/image';
import { Link } from 'next-view-transitions';
import { getSunlightTagLabel } from '@/lib/plants/sunlightTags';
import { formatDate } from '@/lib/utils/formatDate';
import type { PlantListItem } from '@/types/plant';
import styles from './PlantCard.module.css';

interface PlantCardProps {
  plant: PlantListItem;
}

export function PlantCard({ plant }: PlantCardProps) {
  const photoUrl = plant.latestPhotoUrl ?? plant.firstPhotoUrl;
  const sunlightLabel = getSunlightTagLabel(plant.sunlightTag);

  return (
    <article className={styles.card}>
      <Link href={`/plants/${plant.id}`} className={styles.cardLink}>
        <div className={styles.imageWrap}>
          <Image
            src={photoUrl}
            alt={`${plant.name}の写真`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className={styles.image}
          />
        </div>
        <div className={styles.body}>
          <div className={styles.titleRow}>
            <h2 className={styles.name}>{plant.name}</h2>
            {sunlightLabel ? (
              <span
                className={styles.sunlightTag}
                aria-label={`推奨の置き場: ${sunlightLabel}`}
              >
                {sunlightLabel}
              </span>
            ) : null}
          </div>
          <p className={styles.meta}>更新 {formatDate(plant.updatedAt)}</p>
        </div>
      </Link>
    </article>
  );
}
