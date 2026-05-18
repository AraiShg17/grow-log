import { notFound } from 'next/navigation';
import { PageShell } from '@/components/PageShell/PageShell';
import { PlantDetail } from '@/components/PlantDetail/PlantDetail';
import { PlantManagePanel } from '@/components/PlantManagePanel/PlantManagePanel';
import { listPlantChatMessages } from '@/lib/firestore/plantChat';
import { toPlantChatMessageDto } from '@/lib/plantChat/serializePlantChatMessage';
import { PlantChat } from '@/components/PlantChat/PlantChat';
import { getPlant, listPlantLogs } from '@/lib/firestore/plants';

interface PlantDetailPageProps {
  params: Promise<{ plantId: string }>;
}

export const dynamic = 'force-dynamic';

export default async function PlantDetailPage({ params }: PlantDetailPageProps) {
  const { plantId } = await params;
  const [plant, logs, chatMessages] = await Promise.all([
    getPlant(plantId),
    listPlantLogs(plantId),
    listPlantChatMessages(plantId),
  ]);

  if (!plant) {
    notFound();
  }

  return (
    <PageShell
      title={plant.name}
      titleContent={
        <PlantManagePanel
          plantId={plant.id}
          plantName={plant.name}
          sunlightTag={plant.sunlightTag}
        />
      }
    >
      <PlantDetail plant={plant} logs={logs} />
      <PlantChat
        plantId={plant.id}
        plantName={plant.name}
        initialMessages={chatMessages.map(toPlantChatMessageDto)}
      />
    </PageShell>
  );
}
