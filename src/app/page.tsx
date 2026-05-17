import { Link } from 'next-view-transitions';
import { PlantListBrowse } from '@/components/PlantListBrowse/PlantListBrowse';
import { PageShell } from '@/components/PageShell/PageShell';
import { listPlants } from '@/lib/firestore/plants';
import type { PlantListItem } from '@/types/plant';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const plants = await listPlants();

  const items: PlantListItem[] = plants.map((p) => ({
    id: p.id,
    name: p.name,
    firstPhotoUrl: p.firstPhotoUrl,
    latestPhotoUrl: p.latestPhotoUrl,
    sunlightTag: p.sunlightTag,
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <PageShell title="植物一覧">
      {plants.length === 0 ? (
        <div className={styles.empty}>
          <p>まだ植物が登録されていません。</p>
          <Link href="/plants/new" className={styles.newLink}>
            最初の植物を登録する
          </Link>
        </div>
      ) : (
        <PlantListBrowse plants={items} />
      )}
    </PageShell>
  );
}
