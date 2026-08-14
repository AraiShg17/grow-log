import { Link } from 'next-view-transitions';
import { ArchiveNavLink } from '@/components/AppHeader/ArchiveNavLink';
import { MaterialIcon } from '@/components/MaterialIcon/MaterialIcon';
import { icons } from '@/icons';
import styles from './AppHeader.module.css';

export function AppHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.brand}>
          <MaterialIcon
            name={icons.pottedPlant}
            size="lg"
            className={styles.brandIcon}
          />
          Grow Log
        </Link>
        <nav className={styles.nav} aria-label="メイン">
          <Link href="/" className={styles.navLink}>
            植物一覧
          </Link>
          <Link
            href="/plants/new"
            className={styles.navLinkPrimary}
            aria-label="植物登録"
          >
            <MaterialIcon name={icons.add} size="sm" className={styles.navIcon} />
            <span className={styles.navLinkSrOnly}>植物登録</span>
          </Link>
          <Link href="/gallery" className={styles.navLinkGallery}>
            <MaterialIcon
              name={icons.photoLibrary}
              size="sm"
              className={styles.navIcon}
            />
            <span className={styles.navLinkText}>ギャラリー</span>
          </Link>
          <ArchiveNavLink />
        </nav>
      </div>
    </header>
  );
}
