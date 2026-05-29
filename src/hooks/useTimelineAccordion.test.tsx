import { renderHook, act } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useTimelineAccordion } from '@/hooks/useTimelineAccordion';
import { writeTimelineOpenState } from '@/lib/timeline/timelineAccordionStorage';

describe('useTimelineAccordion', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('hydrates from localStorage without flipping closed ids on mount', () => {
    writeTimelineOpenState('plant-1', { logA: false, logB: true });

    const { result } = renderHook(() =>
      useTimelineAccordion('plant-1', ['logA', 'logB']),
    );

    expect(result.current.isOpen('logA')).toBe(false);
    expect(result.current.isOpen('logB')).toBe(true);
  });

  it('persists user toggle', () => {
    const { result } = renderHook(() =>
      useTimelineAccordion('plant-2', ['logA']),
    );

    expect(result.current.isOpen('logA')).toBe(true);

    act(() => {
      result.current.setOpen('logA', false);
    });

    expect(result.current.isOpen('logA')).toBe(false);
    expect(JSON.parse(localStorage.getItem('grow-log-timeline-open:plant-2')!)).toEqual(
      { logA: false },
    );
  });
});
