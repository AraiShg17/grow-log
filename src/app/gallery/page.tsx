import { GalleryGrid } from '@/components/GalleryGrid/GalleryGrid';
import { GalleryPageHeader } from '@/components/GalleryPageHeader/GalleryPageHeader';
import { PageShell } from '@/components/PageShell/PageShell';
import { listGalleryPhotoPage } from '@/lib/firestore/gallery';
import { GALLERY_MAX_PHOTOS } from '@/lib/gallery/constants';

export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
  const initialPage = await listGalleryPhotoPage();

  return (
    <PageShell
      title="ギャラリー"
      titleContent={
        <GalleryPageHeader
          initialTotalCount={initialPage.totalCount}
          maxPhotos={GALLERY_MAX_PHOTOS}
        />
      }
    >
      <GalleryGrid initialPage={initialPage} maxPhotos={GALLERY_MAX_PHOTOS} />
    </PageShell>
  );
}
