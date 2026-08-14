'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import {
  archivePlantAction,
  deletePlantAction,
  restorePlantAction,
  updatePlantAction,
  type ActionResult,
} from '@/app/actions/plants';
import { ListBackLink } from '@/components/ListBackLink/ListBackLink';
import { LoadingOverlay } from '@/components/LoadingOverlay/LoadingOverlay';
import { MaterialIcon } from '@/components/MaterialIcon/MaterialIcon';
import { plantListAnchorHref } from '@/lib/navigation/plantListAnchor';
import { getSunlightTagLabel, type SunlightTagId } from '@/lib/plants/sunlightTags';
import { icons } from '@/icons';
import { useRouter } from 'next/navigation';
import styles from './PlantManagePanel.module.css';

interface PlantManagePanelProps {
  plantId: string;
  plantName: string;
  sunlightTag?: SunlightTagId;
  archived: boolean;
}

const initialState: ActionResult = { success: false };

export function PlantManagePanel({
  plantId,
  plantName,
  sunlightTag,
  archived,
}: PlantManagePanelProps) {
  const router = useRouter();
  const sunlightLabel = getSunlightTagLabel(sunlightTag);
  const [isEditing, setIsEditing] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [archivePending, startArchiveTransition] = useTransition();
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

  function handleArchiveToggle() {
    const confirmed = archived
      ? window.confirm('この植物をアーカイブから戻しますか？')
      : window.confirm(
          'この植物をアーカイブしますか？植物一覧には表示されなくなります。',
        );

    if (!confirmed) {
      return;
    }

    setArchiveError(null);
    startArchiveTransition(async () => {
      const result = archived
        ? await restorePlantAction(plantId)
        : await archivePlantAction(plantId);

      if (!result.success) {
        setArchiveError(result.error ?? '操作に失敗しました。');
        return;
      }

      router.refresh();
    });
  }

  const archiveButtonLabel = archived ? 'アーカイブから戻す' : '植物をアーカイブ';
  const backHref = archived ? plantListAnchorHref(plantId, '/archive') : undefined;
  const backLabel = archived ? 'アーカイブへ戻る' : '一覧へ戻る';

  return (
    <section className={styles.panel} aria-label="植物の管理">
      <LoadingOverlay active={updatePending} message="植物の情報を更新しています…" />
      <LoadingOverlay active={deletePending} message="植物と写真を削除しています…" />
      <LoadingOverlay
        active={archivePending}
        message={archived ? '植物を一覧へ戻しています…' : '植物をアーカイブしています…'}
      />

      <div className={styles.titleBlock}>
        <ListBackLink plantId={plantId} href={backHref} variant="icon">
          {backLabel}
        </ListBackLink>
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
            {archived ? (
              <span className={styles.archiveTag}>アーカイブ済み</span>
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

        <button
          type="button"
          className={styles.iconButton}
          aria-label={archiveButtonLabel}
          disabled={archivePending || updatePending || deletePending}
          onClick={handleArchiveToggle}
        >
          <MaterialIcon name={archived ? icons.unarchive : icons.archive} size="sm" />
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
      {archiveError ? <p className={styles.error}>{archiveError}</p> : null}
      {deleteState.error ? <p className={styles.error}>{deleteState.error}</p> : null}
    </section>
  );
}
