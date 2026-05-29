'use client';

import { useCallback, useLayoutEffect, useState } from 'react';
import {
  buildTimelineOpenState,
  timelineOpenStatesEqual,
  writeTimelineOpenState,
} from '@/lib/timeline/timelineAccordionStorage';

export function useTimelineAccordion(plantId: string, logIds: readonly string[]) {
  const logIdsKey = logIds.join('\0');

  const [openById, setOpenById] = useState<Record<string, boolean>>(() =>
    buildTimelineOpenState(plantId, logIds),
  );

  useLayoutEffect(() => {
    setOpenById((prev) => {
      const next = buildTimelineOpenState(plantId, logIds);
      if (timelineOpenStatesEqual(prev, next, logIds)) {
        return prev;
      }
      return next;
    });
  }, [plantId, logIdsKey, logIds]);

  const isOpen = useCallback(
    (logId: string) => openById[logId] ?? true,
    [openById],
  );

  const setOpen = useCallback(
    (logId: string, open: boolean) => {
      setOpenById((prev) => {
        if (prev[logId] === open) {
          return prev;
        }
        const next = { ...prev, [logId]: open };
        writeTimelineOpenState(plantId, next);
        return next;
      });
    },
    [plantId],
  );

  return { isOpen, setOpen };
}
