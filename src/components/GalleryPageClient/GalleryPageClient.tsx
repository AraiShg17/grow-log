'use client';

import { deleteGalleryPhotosAction } from '@/app/actions/gallery';
import { GalleryGrid } from '@/components/GalleryGrid/GalleryGrid';
import { GalleryPageHeader } from '@/components/GalleryPageHeader/GalleryPageHeader';
import { LoadingOverlay } from '@/components/LoadingOverlay/LoadingOverlay';
import { PageShell } from '@/components/PageShell/PageShell';
import type { GalleryPhotoPage } from '@/types/gallery';
import { useRouter } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

interface GalleryPageClientProps {
  initialPage: GalleryPhotoPage;
  maxPhotos: number;
}

export function GalleryPageClient({ initialPage, maxPhotos }: GalleryPageClientProps) {
  const router = useRouter();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePending, startDeleteTransition] = useTransition();

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
    setDeleteError(null);
  }, []);

  const startSelectionMode = useCallback(() => {
    setSelectionMode(true);
    setSelectedIds(new Set());
    setDeleteError(null);
  }, []);

  const togglePhotoSelection = useCallback((photoId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  }, []);

  const selectAllPhotos = useCallback((photoIds: readonly string[]) => {
    setSelectedIds(new Set(photoIds));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const confirmDelete = useCallback(() => {
    if (selectedIds.size === 0) {
      return;
    }

    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteGalleryPhotosAction([...selectedIds]);
      if (!result.success) {
        setDeleteError(result.error ?? '削除に失敗しました。');
        return;
      }

      exitSelectionMode();
      router.refresh();
    });
  }, [exitSelectionMode, router, selectedIds]);

  return (
    <>
      <LoadingOverlay
        active={deletePending}
        message="ギャラリー写真を削除しています…"
      />
      <PageShell
        title="ギャラリー"
        titleContent={
          <GalleryPageHeader
            initialTotalCount={initialPage.totalCount}
            maxPhotos={maxPhotos}
            hasPhotos={initialPage.totalCount > 0}
            selectionMode={selectionMode}
            selectedCount={selectedIds.size}
            deletePending={deletePending}
            onStartSelection={startSelectionMode}
            onCancelSelection={exitSelectionMode}
            onConfirmDelete={confirmDelete}
          />
        }
      >
        <GalleryGrid
          initialPage={initialPage}
          maxPhotos={maxPhotos}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          deleteError={deleteError}
          onToggleSelect={togglePhotoSelection}
          onSelectAll={selectAllPhotos}
          onClearSelection={clearSelection}
          onExitSelectionMode={exitSelectionMode}
        />
      </PageShell>
    </>
  );
}
