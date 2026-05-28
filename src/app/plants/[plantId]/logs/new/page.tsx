import { notFound } from 'next/navigation';
import { PageShell } from '@/components/PageShell/PageShell';
import { PageTitleWithHistoryBack } from '@/components/PageTitleWithHistoryBack/PageTitleWithHistoryBack';
import { PlantContextBanner } from '@/components/PlantContextBanner/PlantContextBanner';
import { LogForm } from '@/components/LogForm/LogForm';
import { normalizePhotoUrls } from '@/lib/photos/normalizePhotos';
import { getPlant } from '@/lib/firestore/plants';

interface NewLogPageProps {
  params: Promise<{ plantId: string }>;
}

export const dynamic = 'force-dynamic';

export default async function NewLogPage({ params }: NewLogPageProps) {
  const { plantId } = await params;
  const plant = await getPlant(plantId);

  if (!plant) {
    notFound();
  }

  return (
    <PageShell
      title="観察記録を追加"
      titleContent={<PageTitleWithHistoryBack title="観察記録を追加" />}
    >
      <PlantContextBanner
        name={plant.name}
        photoUrls={normalizePhotoUrls(plant.photoUrls)}
        latestPhotoUrl={plant.latestPhotoUrl}
        sunlightTag={plant.sunlightTag}
      />
      <LogForm plantId={plantId} />
    </PageShell>
  );
}
