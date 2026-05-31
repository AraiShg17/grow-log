'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseTimelineAccordionOptions {
  initialOpenById: Record<string, boolean>;
  persistOpenStates: (openById: Record<string, boolean>) => Promise<void>;
  persistDelayMs?: number;
  resetKey?: string;
}

function openStatesEqual(
  a: Record<string, boolean>,
  b: Record<string, boolean>,
): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].every((key) => (a[key] ?? false) === (b[key] ?? false));
}

export function useTimelineAccordion({
  initialOpenById,
  persistOpenStates,
  persistDelayMs = 500,
  resetKey = '',
}: UseTimelineAccordionOptions) {
  const [openById, setOpenById] = useState(initialOpenById);
  const pendingOpenById = useRef<Record<string, boolean>>({});
  const timerId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetKeyRef = useRef(resetKey);

  const flushPending = useCallback(() => {
    const pending = pendingOpenById.current;
    pendingOpenById.current = {};
    timerId.current = null;

    if (Object.keys(pending).length === 0) {
      return;
    }

    void persistOpenStates(pending).catch(() => {
      // Display state is already correct locally. A later toggle will retry saving.
    });
  }, [persistOpenStates]);

  useEffect(() => {
    if (resetKeyRef.current === resetKey) {
      return;
    }
    resetKeyRef.current = resetKey;

    setOpenById((prev) => {
      if (openStatesEqual(prev, initialOpenById)) {
        return prev;
      }

      pendingOpenById.current = {};
      if (timerId.current) {
        clearTimeout(timerId.current);
        timerId.current = null;
      }

      return initialOpenById;
    });
  }, [initialOpenById, resetKey]);

  useEffect(
    () => () => {
      if (timerId.current) {
        clearTimeout(timerId.current);
        flushPending();
      }
    },
    [flushPending],
  );

  const isOpen = useCallback(
    (logId: string) => openById[logId] ?? false,
    [openById],
  );

  const setOpen = useCallback(
    (logId: string, open: boolean) => {
      setOpenById((prev) => {
        if ((prev[logId] ?? false) === open) {
          return prev;
        }

        pendingOpenById.current = {
          ...pendingOpenById.current,
          [logId]: open,
        };

        if (timerId.current) {
          clearTimeout(timerId.current);
        }
        timerId.current = setTimeout(flushPending, persistDelayMs);

        return { ...prev, [logId]: open };
      });
    },
    [flushPending, persistDelayMs],
  );

  return { isOpen, setOpen };
}
