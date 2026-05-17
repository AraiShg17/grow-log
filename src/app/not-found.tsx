import { Link } from 'next-view-transitions';
import { PageShell } from '@/components/PageShell/PageShell';

export default function NotFound() {
  return (
    <PageShell title="ページが見つかりません">
      <Link href="/">植物一覧へ戻る</Link>
    </PageShell>
  );
}
