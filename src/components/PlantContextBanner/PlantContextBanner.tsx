import Image from 'next/image';
import { getSunlightTagLabel, type SunlightTagId } from '@/lib/plants/sunlightTags';
import { normalizePhotoUrls, primaryPhotoUrl } from '@/lib/photos/normalizePhotos';
import styles from './PlantContextBanner.module.css';

interface PlantContextBannerProps {
  name: string;
  photoUrls?: string[];
  latestPhotoUrl?: string;
  sunlightTag?: SunlightTagId;
}

export function PlantContextBanner({
  name,
  photoUrls,
  latestPhotoUrl,
  sunlightTag,
}: PlantContextBannerProps) {
  const photoUrl =
    latestPhotoUrl ??
    primaryPhotoUrl(photoUrls) ??
    normalizePhotoUrls(photoUrls)[0] ??
    '';
  const sunlightLabel = getSunlightTagLabel(sunlightTag);

  return (
    <div className={styles.banner} aria-label={`投稿先: ${name}`}>
      <div className={styles.thumb}>
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt=""
            fill
            sizes="80px"
            className={styles.thumbImage}
          />
        ) : (
          <span className={styles.thumbPlaceholder} aria-hidden>
            写真なし
          </span>
        )}
      </div>
      <div className={styles.body}>
        <p className={styles.kicker}>投稿先の植物</p>
        <p className={styles.name}>{name}</p>
        {sunlightLabel ? <p className={styles.tag}>推奨: {sunlightLabel}</p> : null}
      </div>
    </div>
  );
}
