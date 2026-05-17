import { notFound } from 'next/navigation';
import Link from 'next/link';
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

  return <LogForm plantId={plantId} />;
}
