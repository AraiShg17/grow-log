import Image from 'next/image';
import { Link } from 'next-view-transitions';
import { formatDate } from '@/lib/utils/formatDate';
import type { Plant } from '@/types/plant';
import styles from './PlantCard.module.css';

interface PlantCardProps {
  plant: Plant;
}

export function PlantCard({ plant }: PlantCardProps) {
  const photoUrl = plant.latestPhotoUrl ?? plant.firstPhotoUrl;

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
          <h2 className={styles.name}>{plant.name}</h2>
          <p className={styles.meta}>更新 {formatDate(plant.updatedAt)}</p>
        </div>
      </Link>
    </article>
  );
}
