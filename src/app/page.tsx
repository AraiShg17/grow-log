import Link from 'next/link';
import { PageShell } from '@/components/PageShell/PageShell';
import { PlantCard } from '@/components/PlantCard/PlantCard';
import { listPlants } from '@/lib/firestore/plants';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const plants = await listPlants();

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
        <ul className={styles.grid}>
          {plants.map((plant) => (
            <li key={plant.id}>
              <PlantCard plant={plant} />
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
