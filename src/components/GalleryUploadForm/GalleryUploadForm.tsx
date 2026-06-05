'use client';

import { useActionState, useEffect, useState } from 'react';
import { createGalleryPhotosAction } from '@/app/actions/gallery';
import type { ActionResult } from '@/app/actions/plants';
import { Button } from '@/components/Button/Button';
import { LoadingOverlay } from '@/components/LoadingOverlay/LoadingOverlay';
import { PhotoInput } from '@/components/PhotoInput/PhotoInput';
import { useRouter } from 'next/navigation';
import styles from './GalleryUploadForm.module.css';

const initialState: ActionResult = { success: false };

interface GalleryUploadFormProps {
  initialTotalCount: number;
  maxPhotos: number;
  variant?: 'page' | 'modal';
  onComplete?: () => void;
}

export function GalleryUploadForm({
  initialTotalCount,
  maxPhotos,
  variant = 'page',
  onComplete,
}: GalleryUploadFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    createGalleryPhotosAction,
    initialState,
  );
  const [photoCount, setPhotoCount] = useState(0);
  const [compressingPhotos, setCompressingPhotos] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const limitReached = initialTotalCount >= maxPhotos;
  const submitDisabled =
    pending || compressingPhotos || photoCount === 0 || limitReached;

  useEffect(() => {
    if (!state.success) {
      return;
    }

    setPhotoCount(0);
    setResetSignal((value) => value + 1);
    router.refresh();
    onComplete?.();
  }, [onComplete, router, state.success]);

  const formClassName =
    variant === 'modal' ? `${styles.form} ${styles.formModal}` : styles.form;

  return (
    <>
      <LoadingOverlay active={pending} message="ギャラリー写真を投稿しています…" />
      <form action={formAction} className={formClassName}>
        {variant === 'page' ? (
          <div className={styles.header}>
            <p className={styles.title}>ギャラリー写真</p>
            <p className={styles.count}>
              {initialTotalCount} / {maxPhotos}
            </p>
          </div>
        ) : (
          <p className={styles.count}>
            {initialTotalCount} / {maxPhotos}
          </p>
        )}

        {limitReached ? (
          <p className={styles.limit}>ギャラリーの登録上限に達しています。</p>
        ) : (
          <PhotoInput
            aiSelectionMode="none"
            resetSignal={resetSignal}
            onPhotoCountChange={setPhotoCount}
            onCompressingChange={setCompressingPhotos}
          />
        )}

        {state.success && photoCount === 0 ? (
          <p className={styles.success}>ギャラリーに投稿しました。</p>
        ) : null}
        {state.error ? <p className={styles.error}>{state.error}</p> : null}

        <Button type="submit" disabled={submitDisabled} fullWidth>
          {pending ? '投稿中…' : 'ギャラリーに投稿'}
        </Button>
      </form>
    </>
  );
}
