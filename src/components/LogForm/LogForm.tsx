'use client';

import { useActionState } from 'react';
import { createPlantLogAction, type ActionResult } from '@/app/actions/plants';
import { Button } from '@/components/Button/Button';
import { LoadingOverlay } from '@/components/LoadingOverlay/LoadingOverlay';
import { PhotoInput } from '@/components/PhotoInput/PhotoInput';
import styles from './LogForm.module.css';

const initialState: ActionResult = { success: false };

interface LogFormProps {
  plantId: string;
}

export function LogForm({ plantId }: LogFormProps) {
  const action = createPlantLogAction.bind(null, plantId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <>
      <LoadingOverlay
        active={pending}
        message="写真をアップロードして AI がアドバイスを作成しています…"
      />
      <form action={formAction} className={styles.form}>
        <PhotoInput />

        <label className={styles.field}>
          <span className={styles.label}>メモ</span>
          <textarea
            name="memo"
            rows={4}
            className={styles.textarea}
            placeholder="葉の色、土の乾き具合など"
          />
        </label>

        {state.error ? <p className={styles.error}>{state.error}</p> : null}

        <Button type="submit" disabled={pending} fullWidth>
          {pending ? 'AIアドバイスを生成中…' : '記録を保存'}
        </Button>
      </form>
    </>
  );
}
