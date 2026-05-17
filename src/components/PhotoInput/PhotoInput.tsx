'use client';

import { type ChangeEvent, type DragEvent, useCallback, useRef, useState } from 'react';
import { MaterialIcon } from '@/components/MaterialIcon/MaterialIcon';
import { icons } from '@/icons';
import { compressImageForUpload } from '@/lib/images/compressImageForUpload';
import styles from './PhotoInput.module.css';

interface PhotoInputProps {
  name?: string;
  required?: boolean;
  text?: string;
}

export function PhotoInput({
  name = 'photo',
  required = true,
  text = '画像を選択してください',
}: PhotoInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [compressing, setCompressing] = useState(false);

  const assignToInput = useCallback(async (file: File) => {
    if (!inputRef.current) {
      return;
    }

    setCompressing(true);
    try {
      const ready = await compressImageForUpload(file);
      const files = new DataTransfer();
      files.items.add(ready);
      inputRef.current.files = files.files;
      setFileName(ready.name);
    } finally {
      setCompressing(false);
    }
  }, []);

  function handleDrag(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setFileName('');
      return;
    }
    await assignToInput(file);
  }

  async function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();

    const file = Array.from(event.dataTransfer.files).find((item) =>
      item.type.startsWith('image/'),
    );

    if (!file || !inputRef.current) {
      return;
    }

    await assignToInput(file);
  }

  return (
    <label
      className={[styles.dropzone, compressing ? styles.dropzoneBusy : ''].filter(Boolean).join(' ')}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      aria-busy={compressing || undefined}
    >
      <input
        ref={inputRef}
        name={name}
        type="file"
        accept="image/*"
        required={required}
        className={styles.file}
        onChange={handleChange}
      />
      <MaterialIcon name={icons.photoCamera} size="lg" className={styles.icon} />
      <span className={styles.text}>
        {compressing ? '送信用に画像を準備しています…' : fileName || text}
      </span>
    </label>
  );
}
