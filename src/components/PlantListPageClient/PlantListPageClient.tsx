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
  title?: string;
  emptyMessage?: string;
  emptyActionHref?: string;
  emptyActionLabel?: string;
  showCareActions?: boolean;
}

export function PlantListPageClient({
  plants,
  title = '植物一覧',
  emptyMessage = 'まだ植物が登録されていません。',
  emptyActionHref = '/plants/new',
  emptyActionLabel = '最初の植物を登録する',
  showCareActions = true,
}: PlantListPageClientProps) {
  const actions =
    showCareActions && plants.length > 0 ? (
      <PlantCareQuickActions plants={plants} />
    ) : null;

  return (
    <PlantListViewProvider>
      <PageShell title={title} actions={actions}>
        {plants.length === 0 ? (
          <div className={styles.empty}>
            <p>{emptyMessage}</p>
            <Link href={emptyActionHref} className={styles.newLink}>
              {emptyActionLabel}
            </Link>
          </div>
        ) : (
          <PlantListBrowse plants={plants} />
        )}
      </PageShell>
    </PlantListViewProvider>
  );
}
