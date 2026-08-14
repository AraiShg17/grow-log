'use client';

import { Link } from 'next-view-transitions';
import { MaterialIcon } from '@/components/MaterialIcon/MaterialIcon';
import { icons } from '@/icons';
import { plantListAnchorHref } from '@/lib/navigation/plantListAnchor';
import styles from './ListBackLink.module.css';

interface ListBackLinkProps {
  plantId: string;
  href?: string;
  variant?: 'text' | 'icon';
  children?: string;
}

export function ListBackLink({
  plantId,
  href,
  variant = 'text',
  children = '一覧へ戻る',
}: ListBackLinkProps) {
  const backHref = href ?? plantListAnchorHref(plantId);

  if (variant === 'icon') {
    return (
      <Link href={backHref} className={styles.iconLink} aria-label={children}>
        <MaterialIcon name={icons.chevronLeft} size="sm" />
      </Link>
    );
  }

  return (
    <Link href={backHref} className={styles.textLink}>
      {children}
    </Link>
  );
}
