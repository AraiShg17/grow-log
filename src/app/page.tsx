import { PlantListPageClient } from '@/components/PlantListPageClient/PlantListPageClient';
import { listPlants } from '@/lib/firestore/plants';
import type { PlantListItem } from '@/types/plant';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const plants = await listPlants();

  const items: PlantListItem[] = plants.map((p) => ({
    id: p.id,
    name: p.name,
    photoUrls: p.photoUrls,
    latestPhotoUrl: p.latestPhotoUrl,
    sunlightTag: p.sunlightTag,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    lastWateredAt: p.lastWateredAt?.toISOString(),
    lastFertilizedAt: p.lastFertilizedAt?.toISOString(),
  }));

  return <PlantListPageClient plants={items} />;
}
