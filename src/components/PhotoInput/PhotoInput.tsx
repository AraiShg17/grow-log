'use client';

import { type ChangeEvent, type DragEvent, useRef, useState } from 'react';
import { MaterialIcon } from '@/components/MaterialIcon/MaterialIcon';
import { icons } from '@/icons';
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

  function handleDrag(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setFileName(event.target.files?.[0]?.name ?? '');
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();

    const file = Array.from(event.dataTransfer.files).find((item) =>
      item.type.startsWith('image/'),
    );

    if (!file || !inputRef.current) {
      return;
    }

    const files = new DataTransfer();
    files.items.add(file);
    inputRef.current.files = files.files;
    setFileName(file.name);
    inputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
  }

  return (
    <label
      className={styles.dropzone}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
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
      <span className={styles.text}>{fileName || text}</span>
    </label>
  );
}
