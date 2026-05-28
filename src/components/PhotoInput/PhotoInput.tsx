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
import {
  MAX_LOG_AI_PHOTOS,
  MAX_PHOTOS_PER_ENTRY,
  MIN_LOG_AI_PHOTOS,
} from '@/lib/photos/constants';
import styles from './PhotoInput.module.css';

interface PhotoEntry {
  id: string;
  file: File;
  previewUrl: string;
}

type AiSelectionMode = 'single' | 'multi';

interface PhotoInputProps {
  required?: boolean;
  maxPhotos?: number;
  aiSelectionMode?: AiSelectionMode;
  minAiSelections?: number;
  maxAiSelections?: number;
  onPhotoCountChange?: (count: number) => void;
  onAiSelectionValidChange?: (valid: boolean) => void;
  onCompressingChange?: (compressing: boolean) => void;
}

function createEntryId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function clampSelectionCount(
  indices: number[],
  min: number,
  max: number,
  photoCount: number,
): number[] {
  const sorted = [...new Set(indices)]
    .filter((index) => index >= 0 && index < photoCount)
    .sort((a, b) => a - b);
  if (sorted.length < min && photoCount >= min) {
    const filled = [...sorted];
    for (let i = 0; i < photoCount && filled.length < min; i += 1) {
      if (!filled.includes(i)) {
        filled.push(i);
      }
    }
    return filled.sort((a, b) => a - b).slice(0, max);
  }
  return sorted.slice(0, max);
}

export function PhotoInput({
  required = true,
  maxPhotos = MAX_PHOTOS_PER_ENTRY,
  aiSelectionMode = 'single',
  minAiSelections = MIN_LOG_AI_PHOTOS,
  maxAiSelections = MAX_LOG_AI_PHOTOS,
  onPhotoCountChange,
  onAiSelectionValidChange,
  onCompressingChange,
}: PhotoInputProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<PhotoEntry[]>([]);
  const [aiPhotoIndex, setAiPhotoIndex] = useState(0);
  const [aiPhotoIndices, setAiPhotoIndices] = useState<number[]>([]);
  const [compressing, setCompressing] = useState(false);

  const isMultiAi = aiSelectionMode === 'multi';

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

  useEffect(() => {
    syncInputFiles(entries);
  }, [entries, syncInputFiles]);

  useEffect(() => {
    onPhotoCountChange?.(entries.length);
  }, [entries.length, onPhotoCountChange]);

  useEffect(() => {
    onCompressingChange?.(compressing);
  }, [compressing, onCompressingChange]);

  useEffect(() => {
    if (!onAiSelectionValidChange) {
      return;
    }
    if (entries.length === 0) {
      onAiSelectionValidChange(true);
      return;
    }
    const count = isMultiAi ? aiPhotoIndices.length : 1;
    onAiSelectionValidChange(count >= minAiSelections && count <= maxAiSelections);
  }, [
    aiPhotoIndices.length,
    entries.length,
    isMultiAi,
    maxAiSelections,
    minAiSelections,
    onAiSelectionValidChange,
  ]);

  const addFiles = useCallback(
    async (files: File[]) => {
      const imageFiles = files.filter((f) => f.type.startsWith('image/'));
      if (imageFiles.length === 0) {
        return;
      }

      setCompressing(true);
      try {
        const slotsLeft = maxPhotos - entries.length;
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
          const merged = [...prev, ...newEntries].slice(0, maxPhotos);
          syncInputFiles(merged);
          return merged;
        });

        if (isMultiAi) {
          setAiPhotoIndices((prev) => {
            const start = entries.length;
            const added = newEntries.map((_, offset) => start + offset);
            return clampSelectionCount(
              [...prev, ...added],
              minAiSelections,
              maxAiSelections,
              entries.length + newEntries.length,
            );
          });
        } else {
          setAiPhotoIndex((prev) => (entries.length === 0 ? 0 : prev));
        }
      } finally {
        setCompressing(false);
      }
    },
    [
      entries.length,
      isMultiAi,
      maxAiSelections,
      maxPhotos,
      minAiSelections,
      syncInputFiles,
    ],
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

    if (isMultiAi) {
      setAiPhotoIndices((prev) =>
        clampSelectionCount(
          prev.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i)),
          minAiSelections,
          maxAiSelections,
          entries.length - 1,
        ),
      );
    } else {
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
  }

  function toggleAiSelection(index: number) {
    if (!isMultiAi) {
      setAiPhotoIndex(index);
      return;
    }

    setAiPhotoIndices((prev) => {
      const selected = prev.includes(index);
      if (selected) {
        if (prev.length <= minAiSelections) {
          return prev;
        }
        return prev.filter((i) => i !== index);
      }
      if (prev.length >= maxAiSelections) {
        return prev;
      }
      return [...prev, index].sort((a, b) => a - b);
    });
  }

  function isAiSelected(index: number): boolean {
    return isMultiAi ? aiPhotoIndices.includes(index) : index === aiPhotoIndex;
  }

  const canAddMore = entries.length < maxPhotos;
  const hint =
    entries.length === 0
      ? required
        ? `画像を選択（最大${maxPhotos}枚）`
        : `画像を追加（任意・最大${maxPhotos}枚）`
      : `写真を追加（${entries.length}/${maxPhotos}枚）`;

  const aiHint = isMultiAi
    ? `AI分析に使う写真を${minAiSelections}〜${maxAiSelections}枚タップして選んでください`
    : required
      ? 'AI分析に使う写真をタップして選んでください'
      : 'AI分析に使う写真をタップして選べます（写真を付けた場合のみAIが動きます）';

  return (
    <div className={styles.root} role="group" aria-label="写真の選択">
      {isMultiAi ? (
        aiPhotoIndices.map((index) => (
          <input
            key={`ai-${index}`}
            type="hidden"
            name="aiPhotoIndices"
            value={index}
          />
        ))
      ) : (
        <input type="hidden" name="aiPhotoIndex" value={aiPhotoIndex} />
      )}

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
          <p className={styles.aiHint}>{aiHint}</p>
          <ul className={styles.gallery} aria-label="選択した写真">
            {entries.map((entry, index) => {
              const isAi = isAiSelected(index);
              return (
                <li key={entry.id} className={styles.thumbItem}>
                  <button
                    type="button"
                    className={[styles.thumbButton, isAi ? styles.thumbButtonAi : '']
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => toggleAiSelection(index)}
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
        <p className={styles.limitNote}>写真は最大{maxPhotos}枚までです。</p>
      )}
    </div>
  );
}
