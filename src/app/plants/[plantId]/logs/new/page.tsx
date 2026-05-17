import { notFound } from 'next/navigation';
import { Link } from 'next-view-transitions';
import { PageShell } from '@/components/PageShell/PageShell';
import { LogForm } from '@/components/LogForm/LogForm';
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
      actions={<Link href={`/plants/${plantId}`}>詳細へ戻る</Link>}
    >
      <LogForm plantId={plantId} />
    </PageShell>
  );
}
