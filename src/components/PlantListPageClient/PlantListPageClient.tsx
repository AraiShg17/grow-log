'use client';

import { Link } from 'next-view-transitions';
import { PlantCareQuickActions } from '@/components/PlantCareQuickActions/PlantCareQuickActions';
import { PlantListBrowse } from '@/components/PlantListBrowse/PlantListBrowse';
import { PlantListViewProvider } from '@/components/PlantListView/PlantListViewProvider';
import { PageShell } from '@/components/PageShell/PageShell';
import type { PlantListItem } from '@/types/plant';
import styles from '@/app/page.module.css';

interface PlantListPageClientProps {
  plants: PlantListItem[];
}

export function PlantListPageClient({ plants }: PlantListPageClientProps) {
  return (
    <PlantListViewProvider>
      <PageShell
        title="植物一覧"
        actions={plants.length > 0 ? <PlantCareQuickActions plants={plants} /> : null}
      >
        {plants.length === 0 ? (
          <div className={styles.empty}>
            <p>まだ植物が登録されていません。</p>
            <Link href="/plants/new" className={styles.newLink}>
              最初の植物を登録する
            </Link>
          </div>
        ) : (
          <PlantListBrowse plants={plants} />
        )}
      </PageShell>
    </PlantListViewProvider>
  );
}
