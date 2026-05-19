'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { deletePlantLogAction, type ActionResult } from '@/app/actions/plants';
import { MaterialIcon } from '@/components/MaterialIcon/MaterialIcon';
import { icons } from '@/icons';
import styles from './PlantLogDeleteButton.module.css';

interface PlantLogDeleteButtonProps {
  plantId: string;
  logId: string;
}

const initialState: ActionResult = { success: false };

export function PlantLogDeleteButton({ plantId, logId }: PlantLogDeleteButtonProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    deletePlantLogAction.bind(null, plantId, logId),
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <form
      action={formAction}
      className={styles.form}
      onSubmit={(event) => {
        if (!window.confirm('この観察記録と関連する写真を削除しますか？')) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className={styles.button}
        aria-label="観察記録を削除"
        disabled={pending}
      >
        <MaterialIcon name={icons.delete} size="sm" />
      </button>
      {state.error ? <p className={styles.error}>{state.error}</p> : null}
    </form>
  );
}
