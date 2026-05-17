import type { ReactNode } from 'react';
import { MaterialIcon } from '@/components/MaterialIcon/MaterialIcon';
import type { IconName } from '@/icons';
import styles from './PanelTitle.module.css';

interface PanelTitleProps {
  id: string;
  icon: IconName;
  children: ReactNode;
}

export function PanelTitle({ id, icon, children }: PanelTitleProps) {
  return (
    <h3 id={id} className={styles.title}>
      <MaterialIcon name={icon} size="sm" className={styles.icon} />
      <span>{children}</span>
    </h3>
  );
}
