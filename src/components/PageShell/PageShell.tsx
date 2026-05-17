import type { ReactNode } from 'react';
import styles from './PageShell.module.css';

interface PageShellProps {
  title: string;
  titleContent?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

export function PageShell({ title, titleContent, actions, children }: PageShellProps) {
  return (
    <main id="main" className={styles.container}>
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <header className={styles.pageHeader}>
            {titleContent ?? <h1 className={styles.title}>{title}</h1>}
            {actions ? <div className={styles.actions}>{actions}</div> : null}
          </header>
          {children}
        </div>
      </section>
    </main>
  );
}
