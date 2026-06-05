import { GalleryPageClient } from '@/components/GalleryPageClient/GalleryPageClient';
import { listGalleryPhotoPage } from '@/lib/firestore/gallery';
import { GALLERY_MAX_PHOTOS } from '@/lib/gallery/constants';

export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
  const initialPage = await listGalleryPhotoPage();

  return <GalleryPageClient initialPage={initialPage} maxPhotos={GALLERY_MAX_PHOTOS} />;
}
