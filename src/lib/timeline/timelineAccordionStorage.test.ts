import { afterEach, describe, expect, it } from 'vitest';
import {
  readTimelineOpenState,
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
});
