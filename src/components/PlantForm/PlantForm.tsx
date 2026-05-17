'use client';

import { useActionState } from 'react';
import { createPlantAction, type ActionResult } from '@/app/actions/plants';
import { Button } from '@/components/Button/Button';
import { LoadingOverlay } from '@/components/LoadingOverlay/LoadingOverlay';
import { PhotoInput } from '@/components/PhotoInput/PhotoInput';
import styles from './PlantForm.module.css';

const initialState: ActionResult = { success: false };

export function PlantForm() {
  const [state, formAction, pending] = useActionState(createPlantAction, initialState);

  return (
    <>
      <LoadingOverlay
        active={pending}
        message="植物名と写真から種を推定し、置き場の推奨タグと育成ガイドを作成しています…"
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

        <PhotoInput />

        {state.error ? <p className={styles.error}>{state.error}</p> : null}

        <Button type="submit" disabled={pending} fullWidth>
          {pending ? 'AIが分析・生成中…' : '登録する'}
        </Button>
      </form>
    </>
  );
}
