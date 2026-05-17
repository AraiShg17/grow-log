'use client';

import { useActionState } from 'react';
import { createPlantAction, type ActionResult } from '@/app/actions/plants';
import { Button } from '@/components/Button/Button';
import { LoadingOverlay } from '@/components/LoadingOverlay/LoadingOverlay';
import styles from './PlantForm.module.css';

const initialState: ActionResult = { success: false };

export function PlantForm() {
  const [state, formAction, pending] = useActionState(createPlantAction, initialState);

  return (
    <>
      <LoadingOverlay
        active={pending}
        message="写真をアップロードして AI が育成方法を作成しています…"
      />
      <form action={formAction} className={styles.form}>
        <label className={styles.field}>
          <span className={styles.label}>植物名</span>
          <input
            name="name"
            required
            className={styles.input}
            placeholder="例: モンステラ"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>写真</span>
          <input
            name="photo"
            type="file"
            accept="image/*"
            required
            className={styles.file}
          />
        </label>

        {state.error ? <p className={styles.error}>{state.error}</p> : null}

        <Button type="submit" disabled={pending} fullWidth>
          {pending ? 'AIが育成方法を生成中…' : '登録する'}
        </Button>
      </form>
    </>
  );
}
