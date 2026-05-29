import { afterEach, describe, expect, it } from 'vitest';
import {
  buildTimelineOpenState,
  readTimelineOpenState,
  timelineOpenStatesEqual,
  writeTimelineOpenState,
} from './timelineAccordionStorage';

describe('timelineAccordionStorage', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('writes and reads open state per plant', () => {
    writeTimelineOpenState('plant-a', { log1: true, log2: false });
    expect(readTimelineOpenState('plant-a')).toEqual({ log1: true, log2: false });
    expect(readTimelineOpenState('plant-b')).toEqual({});
  });

  it('buildTimelineOpenState defaults missing logs to open', () => {
    writeTimelineOpenState('plant-a', { log1: false });
    expect(buildTimelineOpenState('plant-a', ['log1', 'log2'])).toEqual({
      log1: false,
      log2: true,
    });
  });

  it('timelineOpenStatesEqual compares only listed log ids', () => {
    expect(
      timelineOpenStatesEqual({ a: true }, { a: true, b: false }, ['a']),
    ).toBe(true);
    expect(
      timelineOpenStatesEqual({ a: true }, { a: false }, ['a']),
    ).toBe(false);
  });
});
