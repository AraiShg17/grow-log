'use client';

import { Link } from 'next-view-transitions';
import { MaterialIcon } from '@/components/MaterialIcon/MaterialIcon';
import { icons } from '@/icons';
import { plantListAnchorHref } from '@/lib/navigation/plantListAnchor';
import styles from './ListBackLink.module.css';

interface ListBackLinkProps {
  plantId: string;
  variant?: 'text' | 'icon';
  children?: string;
}

export function ListBackLink({
  plantId,
  variant = 'text',
  children = '一覧へ戻る',
}: ListBackLinkProps) {
  const href = plantListAnchorHref(plantId);

  if (variant === 'icon') {
    return (
      <Link href={href} className={styles.iconLink} aria-label="一覧へ戻る">
        <MaterialIcon name={icons.chevronLeft} size="sm" />
      </Link>
    );
  }

  return (
    <Link href={href} className={styles.textLink}>
      {children}
    </Link>
  );
}
