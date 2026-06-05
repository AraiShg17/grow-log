'use client';

import { GalleryUploadForm } from '@/components/GalleryUploadForm/GalleryUploadForm';
import { MaterialIcon } from '@/components/MaterialIcon/MaterialIcon';
import { icons } from '@/icons';
import { useEffect, useRef, useState } from 'react';
import styles from './GalleryPageHeader.module.css';

interface GalleryPageHeaderProps {
  initialTotalCount: number;
  maxPhotos: number;
  hasPhotos: boolean;
  selectionMode: boolean;
  selectedCount: number;
  deletePending: boolean;
  onStartSelection: () => void;
  onCancelSelection: () => void;
  onConfirmDelete: () => void;
}

export function GalleryPageHeader({
  initialTotalCount,
  maxPhotos,
  hasPhotos,
  selectionMode,
  selectedCount,
  deletePending,
  onStartSelection,
  onCancelSelection,
  onConfirmDelete,
}: GalleryPageHeaderProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const limitReached = initialTotalCount >= maxPhotos;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (uploadOpen) {
      dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [uploadOpen]);

  function closeUploadModal() {
    setUploadOpen(false);
  }

  return (
    <>
      <div className={styles.row}>
        <h1 className={styles.title}>ギャラリー</h1>
        <div className={styles.actions}>
          {selectionMode ? (
            <>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={onCancelSelection}
                disabled={deletePending}
              >
                キャンセル
              </button>
              <button
                type="button"
                className={styles.dangerButton}
                onClick={onConfirmDelete}
                disabled={deletePending || selectedCount === 0}
              >
                {selectedCount > 0 ? `${selectedCount}枚を削除` : '削除'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={styles.uploadButton}
                onClick={() => setUploadOpen(true)}
                disabled={limitReached}
                aria-haspopup="dialog"
              >
                <MaterialIcon name={icons.photoCamera} size="sm" />
                画像を投稿
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={onStartSelection}
                disabled={!hasPhotos}
              >
                <MaterialIcon name={icons.delete} size="sm" />
                削除
              </button>
            </>
          )}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby="gallery-upload-title"
        onClose={closeUploadModal}
        onCancel={closeUploadModal}
      >
        <div className={styles.dialogInner}>
          <header className={styles.dialogHeader}>
            <h2 id="gallery-upload-title" className={styles.dialogTitle}>
              ギャラリーに投稿
            </h2>
            <button
              type="button"
              className={styles.closeButton}
              onClick={closeUploadModal}
              aria-label="閉じる"
            >
              <MaterialIcon name={icons.close} size="sm" />
            </button>
          </header>
          <div className={styles.dialogBody}>
            <GalleryUploadForm
              variant="modal"
              initialTotalCount={initialTotalCount}
              maxPhotos={maxPhotos}
              onComplete={closeUploadModal}
            />
          </div>
        </div>
      </dialog>
    </>
  );
}
