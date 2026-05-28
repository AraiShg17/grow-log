'use client';

import { useEffect } from 'react';
import {
  consumePlantListAnchorFromSession,
  plantListAnchorId,
} from '@/lib/navigation/plantListAnchor';

export function PlantListScrollRestore() {
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

    const plantId = consumePlantListAnchorFromSession();
    if (plantId) {
      const anchorId = plantListAnchorId(plantId);
      window.history.replaceState(null, '', `/#${anchorId}`);
      scrollToAnchor(anchorId);
    }
  }, []);

  return null;
}
