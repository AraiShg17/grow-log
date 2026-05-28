'use client';

import Image from 'next/image';
import { Link } from 'next-view-transitions';
import { MaterialIcon } from '@/components/MaterialIcon/MaterialIcon';
import { icons } from '@/icons';
import { rememberPlantListAnchor } from '@/lib/navigation/plantListAnchor';
import { getSunlightTagLabel } from '@/lib/plants/sunlightTags';
import { formatCareDaysAgo, formatDate } from '@/lib/utils/formatDate';
import type { PlantListItem } from '@/types/plant';
import styles from './PlantCard.module.css';

interface PlantCardProps {
  plant: PlantListItem;
}

export function PlantCard({ plant }: PlantCardProps) {
  const photoUrl = plant.latestPhotoUrl ?? plant.photoUrls[0] ?? '';
  const sunlightLabel = getSunlightTagLabel(plant.sunlightTag);
  const hasPhoto = Boolean(photoUrl);

  return (
    <article className={styles.card}>
      <Link
        href={`/plants/${plant.id}`}
        className={styles.cardLink}
        onClick={() => rememberPlantListAnchor(plant.id)}
      >
        <div className={styles.imageWrap}>
          {hasPhoto ? (
            <Image
              src={photoUrl}
              alt={`${plant.name}の写真`}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className={styles.image}
            />
          ) : (
            <div className={styles.imagePlaceholder} aria-hidden>
              <span className={styles.imagePlaceholderText}>写真なし</span>
            </div>
          )}
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
          <div className={styles.careMeta}>
            <span
              className={styles.careItem}
              aria-label={`最後の水やり ${formatCareDaysAgo(plant.lastWateredAt)}`}
            >
              <MaterialIcon
                name={icons.waterDrop}
                size="sm"
                className={[styles.careIcon, styles.careIconWater].join(' ')}
              />
              <span className={styles.careDays} aria-hidden>
                {formatCareDaysAgo(plant.lastWateredAt)}
              </span>
            </span>
            <span
              className={styles.careItem}
              aria-label={`最後の肥料 ${formatCareDaysAgo(plant.lastFertilizedAt)}`}
            >
              <MaterialIcon
                name={icons.compost}
                size="sm"
                className={[styles.careIcon, styles.careIconFertilize].join(' ')}
              />
              <span className={styles.careDays} aria-hidden>
                {formatCareDaysAgo(plant.lastFertilizedAt)}
              </span>
            </span>
          </div>
          <p className={styles.meta}>更新 {formatDate(plant.updatedAt)}</p>
        </div>
      </Link>
    </article>
  );
}
