'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import {
  consumePlantListAnchorFromSession,
  plantListAnchorId,
} from '@/lib/navigation/plantListAnchor';

export function PlantListScrollRestore() {
  const pathname = usePathname();

  useEffect(() => {
    const scrollToAnchor = (anchorId: string) => {
      requestAnimationFrame(() => {
        document.getElementById(anchorId)?.scrollIntoView({
          block: 'center',
          behavior: 'auto',
        });
      });
    };

    const hashId = window.location.hash.replace(/^#/, '');
    if (hashId.startsWith('plant-')) {
      scrollToAnchor(hashId);
      return;
    }

    const stored = consumePlantListAnchorFromSession();
    if (stored && stored.pathname === pathname) {
      const anchorId = plantListAnchorId(stored.plantId);
      window.history.replaceState(null, '', `${pathname}#${anchorId}`);
      scrollToAnchor(anchorId);
    }
  }, [pathname]);

  return null;
}
