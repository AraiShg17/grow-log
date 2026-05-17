import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppHeader } from '@/components/AppHeader/AppHeader';
import { ViewTransitions } from '@/components/ViewTransitions/ViewTransitions';
import './globals.css';

export const metadata: Metadata = {
  title: '植物記録',
  description: '植物の育成記録とAIアドバイス',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ja" data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var theme=localStorage.getItem('grow-log-theme')==='dark'?'dark':'light';document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;}catch(e){document.documentElement.dataset.theme='light';}`,
          }}
        />
      </head>
      <body>
        <ViewTransitions>
          <AppHeader />
          {children}
        </ViewTransitions>
      </body>
    </html>
  );
}
