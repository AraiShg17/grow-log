'use client';

import { useActionState, useState } from 'react';
import { createPlantLogAction, type ActionResult } from '@/app/actions/plants';
import { Button } from '@/components/Button/Button';
import { LoadingOverlay } from '@/components/LoadingOverlay/LoadingOverlay';
import { PhotoInput } from '@/components/PhotoInput/PhotoInput';
import {
  MAX_LOG_AI_PHOTOS,
  MAX_LOG_PHOTOS,
  MIN_LOG_AI_PHOTOS,
} from '@/lib/photos/constants';
import styles from './LogForm.module.css';

const initialState: ActionResult = { success: false };

interface LogFormProps {
  plantId: string;
}

export function LogForm({ plantId }: LogFormProps) {
  const action = createPlantLogAction.bind(null, plantId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [compressingPhotos, setCompressingPhotos] = useState(false);
  const [aiSelectionValid, setAiSelectionValid] = useState(true);
  const [photoCount, setPhotoCount] = useState(0);

  const submitDisabled =
    pending || compressingPhotos || (photoCount > 0 && !aiSelectionValid);

  return (
    <>
      <LoadingOverlay active={pending} message="観察記録を保存しています…" />
      <form action={formAction} className={styles.form}>
        <PhotoInput
          required={false}
          maxPhotos={MAX_LOG_PHOTOS}
          aiSelectionMode="multi"
          minAiSelections={MIN_LOG_AI_PHOTOS}
          maxAiSelections={MAX_LOG_AI_PHOTOS}
          onPhotoCountChange={setPhotoCount}
          onAiSelectionValidChange={setAiSelectionValid}
          onCompressingChange={setCompressingPhotos}
        />

        <label className={styles.field}>
          <span className={styles.label}>メモ</span>
          <textarea
            name="memo"
            rows={4}
            className={styles.textarea}
            placeholder="葉の色、土の乾き具合など（写真がないときはメモ必須）"
          />
        </label>

        {state.error ? <p className={styles.error}>{state.error}</p> : null}

        <Button type="submit" disabled={submitDisabled} fullWidth>
          {pending ? '保存中…' : '記録を保存'}
        </Button>
      </form>
    </>
  );
}
