'use client';

import { useActionState, useEffect, useState } from 'react';
import {
  deletePlantAction,
  updatePlantAction,
  type ActionResult,
} from '@/app/actions/plants';
import { ListBackLink } from '@/components/ListBackLink/ListBackLink';
import { LoadingOverlay } from '@/components/LoadingOverlay/LoadingOverlay';
import { MaterialIcon } from '@/components/MaterialIcon/MaterialIcon';
import { getSunlightTagLabel, type SunlightTagId } from '@/lib/plants/sunlightTags';
import { icons } from '@/icons';
import styles from './PlantManagePanel.module.css';

interface PlantManagePanelProps {
  plantId: string;
  plantName: string;
  sunlightTag?: SunlightTagId;
}

const initialState: ActionResult = { success: false };

export function PlantManagePanel({
  plantId,
  plantName,
  sunlightTag,
}: PlantManagePanelProps) {
  const sunlightLabel = getSunlightTagLabel(sunlightTag);
  const [isEditing, setIsEditing] = useState(false);
  const [updateState, updateFormAction, updatePending] = useActionState(
    updatePlantAction.bind(null, plantId),
    initialState,
  );
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deletePlantAction.bind(null, plantId),
    initialState,
  );

  useEffect(() => {
    if (updateState.success) {
      setIsEditing(false);
    }
  }, [updateState.success]);

  return (
    <section className={styles.panel} aria-label="植物の管理">
      <LoadingOverlay active={updatePending} message="植物の情報を更新しています…" />
      <LoadingOverlay active={deletePending} message="植物と写真を削除しています…" />

      <div className={styles.titleBlock}>
        <ListBackLink plantId={plantId} variant="icon" />
        {isEditing ? (
          <form action={updateFormAction} className={styles.editForm}>
            <div className={styles.editNameRow}>
              <input
                name="name"
                required
                defaultValue={plantName}
                className={styles.titleInput}
                aria-label="植物名"
                disabled={updatePending}
                autoFocus
              />
              <button
                type="submit"
                className={styles.iconButton}
                aria-label="植物名を保存"
                disabled={updatePending}
              >
                <MaterialIcon name={icons.check} size="sm" />
              </button>
              <button
                type="button"
                className={styles.iconButton}
                aria-label="編集をキャンセル"
                disabled={updatePending}
                onClick={() => setIsEditing(false)}
              >
                <MaterialIcon name={icons.close} size="sm" />
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.titleHead}>
            <h1 className={styles.title}>{plantName}</h1>
            {sunlightLabel ? (
              <span
                className={styles.titleTag}
                aria-label={`推奨の置き場: ${sunlightLabel}`}
              >
                {sunlightLabel}
              </span>
            ) : null}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="植物情報を編集"
          aria-expanded={isEditing}
          onClick={() => setIsEditing((current) => !current)}
        >
          <MaterialIcon name={icons.edit} size="sm" />
        </button>

        <form
          action={deleteFormAction}
          onSubmit={(event) => {
            if (!window.confirm('この植物と観察記録、関連写真をすべて削除しますか？')) {
              event.preventDefault();
            }
          }}
        >
          <button
            type="submit"
            className={`${styles.iconButton} ${styles.dangerButton}`}
            aria-label="植物を削除"
            disabled={deletePending}
          >
            <MaterialIcon name={icons.delete} size="sm" />
          </button>
        </form>
      </div>

      {updateState.error ? <p className={styles.error}>{updateState.error}</p> : null}
      {deleteState.error ? <p className={styles.error}>{deleteState.error}</p> : null}
    </section>
  );
}
