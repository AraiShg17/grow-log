'use client';

import { GalleryUploadForm } from '@/components/GalleryUploadForm/GalleryUploadForm';
import { MaterialIcon } from '@/components/MaterialIcon/MaterialIcon';
import { icons } from '@/icons';
import { useEffect, useRef, useState } from 'react';
import styles from './GalleryPageHeader.module.css';

interface GalleryPageHeaderProps {
  initialTotalCount: number;
  maxPhotos: number;
}

export function GalleryPageHeader({
  initialTotalCount,
  maxPhotos,
}: GalleryPageHeaderProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const limitReached = initialTotalCount >= maxPhotos;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open) {
      dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  function closeModal() {
    setOpen(false);
  }

  return (
    <>
      <div className={styles.row}>
        <h1 className={styles.title}>ギャラリー</h1>
        <button
          type="button"
          className={styles.uploadButton}
          onClick={() => setOpen(true)}
          disabled={limitReached}
          aria-haspopup="dialog"
        >
          <MaterialIcon name={icons.photoCamera} size="sm" />
          画像を投稿
        </button>
      </div>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby="gallery-upload-title"
        onClose={closeModal}
        onCancel={closeModal}
      >
        <div className={styles.dialogInner}>
          <header className={styles.dialogHeader}>
            <h2 id="gallery-upload-title" className={styles.dialogTitle}>
              ギャラリーに投稿
            </h2>
            <button
              type="button"
              className={styles.closeButton}
              onClick={closeModal}
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
              onComplete={closeModal}
            />
          </div>
        </div>
      </dialog>
    </>
  );
}
