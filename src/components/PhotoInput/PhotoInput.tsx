'use client';

import Image from 'next/image';
import {
  type ChangeEvent,
  type DragEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { MaterialIcon } from '@/components/MaterialIcon/MaterialIcon';
import { icons } from '@/icons';
import { compressImageForUpload } from '@/lib/images/compressImageForUpload';
import { MAX_PHOTOS_PER_ENTRY } from '@/lib/photos/constants';
import styles from './PhotoInput.module.css';

interface PhotoEntry {
  id: string;
  file: File;
  previewUrl: string;
}

interface PhotoInputProps {
  required?: boolean;
}

function createEntryId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function PhotoInput({ required = true }: PhotoInputProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<PhotoEntry[]>([]);
  const [aiPhotoIndex, setAiPhotoIndex] = useState(0);
  const [compressing, setCompressing] = useState(false);

  const syncInputFiles = useCallback((nextEntries: PhotoEntry[]) => {
    if (!inputRef.current) {
      return;
    }
    const transfer = new DataTransfer();
    for (const entry of nextEntries) {
      transfer.items.add(entry.file);
    }
    inputRef.current.files = transfer.files;
  }, []);

  useEffect(() => {
    return () => {
      for (const entry of entries) {
        URL.revokeObjectURL(entry.previewUrl);
      }
    };
  }, [entries]);

  const addFiles = useCallback(
    async (files: File[]) => {
      const imageFiles = files.filter((f) => f.type.startsWith('image/'));
      if (imageFiles.length === 0) {
        return;
      }

      setCompressing(true);
      try {
        const slotsLeft = MAX_PHOTOS_PER_ENTRY - entries.length;
        const toAdd = imageFiles.slice(0, slotsLeft);
        if (toAdd.length === 0) {
          return;
        }

        const compressed = await Promise.all(
          toAdd.map((f) => compressImageForUpload(f)),
        );
        const newEntries: PhotoEntry[] = compressed.map((file) => ({
          id: createEntryId(),
          file,
          previewUrl: URL.createObjectURL(file),
        }));

        setEntries((prev) => {
          const merged = [...prev, ...newEntries].slice(0, MAX_PHOTOS_PER_ENTRY);
          syncInputFiles(merged);
          return merged;
        });
      } finally {
        setCompressing(false);
      }
    },
    [entries.length, syncInputFiles],
  );

  function handleDrag(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }
    await addFiles(files);
    event.target.value = '';
  }

  async function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    await addFiles(Array.from(event.dataTransfer.files));
  }

  function removeEntry(index: number) {
    setEntries((prev) => {
      const removed = prev[index];
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      const next = prev.filter((_, i) => i !== index);
      syncInputFiles(next);
      return next;
    });
    setAiPhotoIndex((prev) => {
      if (prev === index) {
        return 0;
      }
      if (prev > index) {
        return prev - 1;
      }
      return prev;
    });
  }

  const canAddMore = entries.length < MAX_PHOTOS_PER_ENTRY;
  const hint =
    entries.length === 0
      ? required
        ? `画像を選択（最大${MAX_PHOTOS_PER_ENTRY}枚）`
        : `画像を追加（任意・最大${MAX_PHOTOS_PER_ENTRY}枚）`
      : `写真を追加（${entries.length}/${MAX_PHOTOS_PER_ENTRY}枚）`;

  return (
    <div className={styles.root} role="group" aria-label="写真の選択">
      <input type="hidden" name="aiPhotoIndex" value={aiPhotoIndex} />

      <input
        ref={inputRef}
        id={inputId}
        name="photos"
        type="file"
        accept="image/*"
        multiple
        required={required && entries.length === 0}
        className={styles.file}
        onChange={handleChange}
      />

      {entries.length > 0 ? (
        <>
          <p className={styles.aiHint}>
            {required
              ? 'AI分析に使う写真をタップして選んでください'
              : 'AI分析に使う写真をタップして選べます（写真を付けた場合のみAIが動きます）'}
          </p>
          <ul className={styles.gallery} aria-label="選択した写真">
            {entries.map((entry, index) => {
              const isAi = index === aiPhotoIndex;
              return (
                <li key={entry.id} className={styles.thumbItem}>
                  <button
                    type="button"
                    className={[styles.thumbButton, isAi ? styles.thumbButtonAi : '']
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => setAiPhotoIndex(index)}
                    aria-pressed={isAi}
                    aria-label={
                      isAi
                        ? `写真${index + 1}：AI分析に使用（選択中）`
                        : `写真${index + 1}：タップしてAI分析に使う`
                    }
                  >
                    <Image
                      src={entry.previewUrl}
                      alt=""
                      width={96}
                      height={96}
                      className={styles.thumbImage}
                      unoptimized
                    />
                    {isAi ? <span className={styles.aiBadge}>AI</span> : null}
                  </button>
                  <button
                    type="button"
                    className={styles.removeButton}
                    aria-label={`写真${index + 1}を削除`}
                    onClick={() => removeEntry(index)}
                  >
                    <MaterialIcon name={icons.close} size="sm" />
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      {canAddMore ? (
        <label
          htmlFor={inputId}
          className={[styles.dropzone, compressing ? styles.dropzoneBusy : '']
            .filter(Boolean)
            .join(' ')}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          aria-busy={compressing || undefined}
        >
          <MaterialIcon name={icons.photoCamera} size="lg" className={styles.icon} />
          <span className={styles.text}>
            {compressing ? '送信用に画像を準備しています…' : hint}
          </span>
        </label>
      ) : (
        <p className={styles.limitNote}>写真は最大{MAX_PHOTOS_PER_ENTRY}枚までです。</p>
      )}
    </div>
  );
}
