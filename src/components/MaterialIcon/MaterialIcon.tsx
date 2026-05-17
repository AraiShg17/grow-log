import type { IconName } from '@/icons';
import styles from './MaterialIcon.module.css';

interface MaterialIconProps {
  /** @see src/icons.ts */
  name: IconName;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MaterialIcon({
  name,
  label,
  size = 'md',
  className,
}: MaterialIconProps) {
  const classes = ['material-symbols-outlined', styles[size], className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <span
      className={classes}
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      {name}
    </span>
  );
}
