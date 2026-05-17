import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageShell } from '@/components/PageShell/PageShell';
import { PlantDetail } from '@/components/PlantDetail/PlantDetail';
import { getPlant, listPlantLogs } from '@/lib/firestore/plants';

interface PlantDetailPageProps {
  params: Promise<{ plantId: string }>;
}

export const dynamic = 'force-dynamic';

export default async function PlantDetailPage({ params }: PlantDetailPageProps) {
  const { plantId } = await params;
  const [plant, logs] = await Promise.all([getPlant(plantId), listPlantLogs(plantId)]);

  if (!plant) {
    notFound();
  }

  return (
    <PageShell title={plant.name}>
      <PlantDetail plant={plant} logs={logs} />
    </PageShell>
  );
}
