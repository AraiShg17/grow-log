'use client';

import { useActionState, useState } from 'react';
import { createPlantAction, type ActionResult } from '@/app/actions/plants';
import { Button } from '@/components/Button/Button';
import { LoadingOverlay } from '@/components/LoadingOverlay/LoadingOverlay';
import { PhotoInput } from '@/components/PhotoInput/PhotoInput';
import styles from './PlantForm.module.css';

const initialState: ActionResult = { success: false };

export function PlantForm() {
  const [state, formAction, pending] = useActionState(createPlantAction, initialState);
  const [photoCount, setPhotoCount] = useState(0);
  const [compressingPhotos, setCompressingPhotos] = useState(false);
  const submitDisabled = pending || compressingPhotos || photoCount === 0;

  return (
    <>
      <LoadingOverlay
        active={pending}
        message="植物名と写真から種を推定し、置き場の推奨タグと育成ガイドを作成しています…"
      />
      <form action={formAction} encType="multipart/form-data" className={styles.form}>
        <label className={styles.field}>
          <span className={styles.label}>植物名</span>
          <input
            name="name"
            required
            className={styles.input}
            placeholder="例: モンステラ"
          />
        </label>

        <PhotoInput
          onPhotoCountChange={setPhotoCount}
          onCompressingChange={setCompressingPhotos}
        />

        {state.error ? <p className={styles.error}>{state.error}</p> : null}

        <Button type="submit" disabled={submitDisabled} fullWidth>
          {pending ? 'AIが分析・生成中…' : '登録する'}
        </Button>
      </form>
    </>
  );
}
