'use client';

import { Link } from 'next-view-transitions';
import { usePathname } from 'next/navigation';
import { MaterialIcon } from '@/components/MaterialIcon/MaterialIcon';
import { icons } from '@/icons';
import styles from './AppHeader.module.css';

export function ArchiveNavLink() {
  const pathname = usePathname();
  const inArchive = pathname === '/archive';
  const href = inArchive ? '/' : '/archive';
  const label = inArchive ? '植物一覧' : 'アーカイブ';
  const icon = inArchive ? icons.pottedPlant : icons.archive;

  return (
    <Link href={href} className={styles.navLinkArchive} aria-label={label}>
      <MaterialIcon name={icon} size="sm" className={styles.navIcon} />
      <span className={styles.navLinkText}>{label}</span>
    </Link>
  );
}
