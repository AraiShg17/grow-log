import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppHeader } from '@/components/AppHeader/AppHeader';
import '@/styles/material-symbols.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Grow Log — 植物観察アプリ',
  description: '植物の育成記録とAIアドバイス',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body>
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
