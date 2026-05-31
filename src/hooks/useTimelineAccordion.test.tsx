import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useTimelineAccordion } from '@/hooks/useTimelineAccordion';

describe('useTimelineAccordion', () => {
  it('uses server-provided initial open state', () => {
    const persistOpenStates = vi.fn();
    const { result } = renderHook(() =>
      useTimelineAccordion({
        initialOpenById: { logA: false, logB: true },
        persistOpenStates,
      }),
    );

    expect(result.current.isOpen('logA')).toBe(false);
    expect(result.current.isOpen('logB')).toBe(true);
    expect(result.current.isOpen('missing')).toBe(false);
  });

  it('updates optimistically and persists the final debounced state', async () => {
    const persistOpenStates = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useTimelineAccordion({
        initialOpenById: { logA: true, logB: true },
        persistOpenStates,
        persistDelayMs: 1,
      }),
    );

    act(() => {
      result.current.setOpen('logA', false);
      result.current.setOpen('logA', true);
      result.current.setOpen('logB', false);
    });

    expect(result.current.isOpen('logA')).toBe(true);
    expect(result.current.isOpen('logB')).toBe(false);
    expect(persistOpenStates).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(persistOpenStates).toHaveBeenCalledTimes(1);
    });

    expect(persistOpenStates).toHaveBeenCalledWith({ logA: true, logB: false });
  });
});
