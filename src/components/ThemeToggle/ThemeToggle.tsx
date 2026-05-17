'use client';

import { useEffect, useState } from 'react';
import { MaterialIcon } from '@/components/MaterialIcon/MaterialIcon';
import { icons } from '@/icons';
import styles from './ThemeToggle.module.css';

type Theme = 'light' | 'dark';

const storageKey = 'grow-log-theme';

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const stored = window.localStorage.getItem(storageKey);
  return stored === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem(storageKey, theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const storedTheme = getStoredTheme();
    setTheme(storedTheme);
    applyTheme(storedTheme);
  }, []);

  const nextTheme = theme === 'light' ? 'dark' : 'light';

  return (
    <button
      type="button"
      className={styles.button}
      aria-label={`${nextTheme === 'dark' ? 'ダーク' : 'ライト'}テーマに切り替え`}
      aria-pressed={theme === 'dark'}
      onClick={() => {
        setTheme(nextTheme);
        applyTheme(nextTheme);
      }}
    >
      <span className={styles.viewport} aria-hidden="true">
        <span className={styles.track} data-theme={theme}>
          <MaterialIcon name={icons.lightMode} size="sm" className={styles.icon} />
          <MaterialIcon name={icons.darkMode} size="sm" className={styles.icon} />
        </span>
      </span>
    </button>
  );
}
