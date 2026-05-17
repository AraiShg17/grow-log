import type { ReactNode } from 'react';
import styles from './PageShell.module.css';

interface PageShellProps {
  title: string;
  children: ReactNode;
}

export function PageShell({ title, children }: PageShellProps) {
  return (
    <main id="main" className={styles.container}>
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <header className={styles.pageHeader}>
            <h1 className={styles.title}>{title}</h1>
          </header>
          {children}
        </div>
      </section>
    </main>
  );
}
