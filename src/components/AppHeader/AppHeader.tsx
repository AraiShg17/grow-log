import { Link } from 'next-view-transitions';
import { MaterialIcon } from '@/components/MaterialIcon/MaterialIcon';
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle';
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
          <Link href="/plants/new" className={styles.navLinkPrimary}>
            <MaterialIcon name={icons.add} size="sm" className={styles.navIcon} />
            植物を登録
          </Link>
          <Link href="/gallery" className={styles.navLinkGallery}>
            <MaterialIcon
              name={icons.photoLibrary}
              size="sm"
              className={styles.navIcon}
            />
            <span className={styles.navLinkText}>ギャラリー</span>
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
