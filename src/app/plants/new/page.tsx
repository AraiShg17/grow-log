import { PageShell } from '@/components/PageShell/PageShell';
import { PlantForm } from '@/components/PlantForm/PlantForm';

export default function NewPlantPage() {
  return (
    <PageShell title="植物登録">
      <PlantForm />
    </PageShell>
  );
}
