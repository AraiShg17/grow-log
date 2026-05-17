'use client';

import { bulkCreateCareLogsAction } from '@/app/actions/plants';
import { MaterialIcon } from '@/components/MaterialIcon/MaterialIcon';
import { icons } from '@/icons';
import type { CareLogKind } from '@/lib/plants/careLogMemos';
import type { PlantListItem } from '@/types/plant';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import styles from './PlantCareQuickActions.module.css';

interface PlantCareQuickActionsProps {
  plants: PlantListItem[];
}

const DIALOG_COPY: Record<
  CareLogKind,
  { title: string; submit: string; ariaLabel: string }
> = {
  water: {
    title: '水やりする植物',
    submit: '水やりを記録',
    ariaLabel: '水やり',
  },
  fertilize: {
    title: '肥料やりする植物',
    submit: '肥料やりを記録',
    ariaLabel: '肥料やり',
  },
};

export function PlantCareQuickActions({ plants }: PlantCareQuickActionsProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [activeKind, setActiveKind] = useState<CareLogKind | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sortedPlants = useMemo(
    () => [...plants].sort((a, b) => a.name.localeCompare(b.name, 'ja')),
    [plants],
  );

  const allIds = useMemo(() => sortedPlants.map((p) => p.id), [sortedPlants]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (activeKind) {
      dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [activeKind]);

  function openDialog(kind: CareLogKind) {
    setError(null);
    setSelectedIds(new Set());
    setActiveKind(kind);
  }

  function closeDialog() {
    setActiveKind(null);
    setError(null);
    setSelectedIds(new Set());
  }

  function togglePlant(plantId: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(plantId);
      } else {
        next.delete(plantId);
      }
      return next;
    });
  }

  function handleSubmit() {
    if (!activeKind || selectedIds.size === 0) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await bulkCreateCareLogsAction([...selectedIds], activeKind);
      if (!result.success) {
        setError(result.error ?? '記録に失敗しました。');
        return;
      }
      closeDialog();
      router.refresh();
    });
  }

  const copy = activeKind ? DIALOG_COPY[activeKind] : null;

  return (
    <>
      <div className={styles.toolbar} role="group" aria-label="お手入れの記録">
        <button
          type="button"
          className={[
            styles.iconButton,
            styles.iconButtonWater,
            activeKind === 'water' ? styles.iconButtonWaterActive : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-label="水やりを記録"
          aria-haspopup="dialog"
          onClick={() => openDialog('water')}
        >
          <MaterialIcon name={icons.waterDrop} label="水やり" />
        </button>
        <button
          type="button"
          className={[
            styles.iconButton,
            styles.iconButtonFertilize,
            activeKind === 'fertilize' ? styles.iconButtonFertilizeActive : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-label="肥料やりを記録"
          aria-haspopup="dialog"
          onClick={() => openDialog('fertilize')}
        >
          <MaterialIcon name={icons.compost} label="肥料やり" />
        </button>
      </div>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        onClose={closeDialog}
        onCancel={(e) => {
          e.preventDefault();
          closeDialog();
        }}
      >
        {copy ? (
          <div className={styles.dialogInner}>
            <header className={styles.dialogHeader}>
              <h2 className={styles.dialogTitle}>{copy.title}</h2>
              <button
                type="button"
                className={styles.closeButton}
                aria-label="閉じる"
                onClick={closeDialog}
              >
                <MaterialIcon name={icons.close} size="sm" />
              </button>
            </header>

            <div className={styles.dialogBody}>
              <div className={styles.bulkActions}>
                <button
                  type="button"
                  className={styles.textButton}
                  onClick={() => setSelectedIds(new Set(allIds))}
                >
                  すべて選択
                </button>
                <button
                  type="button"
                  className={styles.textButton}
                  onClick={() => setSelectedIds(new Set())}
                >
                  選択を解除
                </button>
              </div>

              <ul className={styles.plantList}>
                {sortedPlants.map((plant) => (
                  <li key={plant.id}>
                    <label className={styles.plantOption}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(plant.id)}
                        onChange={(e) => togglePlant(plant.id, e.target.checked)}
                      />
                      <span className={styles.plantName}>{plant.name}</span>
                    </label>
                  </li>
                ))}
              </ul>

              {error ? <p className={styles.error}>{error}</p> : null}
            </div>

            <footer className={styles.dialogFooter}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={closeDialog}
                disabled={pending}
              >
                キャンセル
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleSubmit}
                disabled={pending || selectedIds.size === 0}
              >
                {pending ? '記録中…' : copy.submit}
              </button>
            </footer>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
