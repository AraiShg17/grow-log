'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  readTimelineOpenState,
  writeTimelineOpenState,
} from '@/lib/timeline/timelineAccordionStorage';

export function useTimelineAccordion(plantId: string, logIds: string[]) {
  const [openById, setOpenById] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenById(readTimelineOpenState(plantId));
  }, [plantId]);

  const isOpen = useCallback((logId: string) => openById[logId] ?? true, [openById]);

  const setOpen = useCallback(
    (logId: string, open: boolean) => {
      setOpenById((prev) => {
        const next = { ...prev, [logId]: open };
        writeTimelineOpenState(plantId, next);
        return next;
      });
    },
    [plantId],
  );

  useEffect(() => {
    setOpenById((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const logId of logIds) {
        if (!(logId in next)) {
          next[logId] = true;
          changed = true;
        }
      }
      if (changed) {
        writeTimelineOpenState(plantId, next);
      }
      return changed ? next : prev;
    });
  }, [logIds, plantId]);

  return { isOpen, setOpen };
}
