import { describe, expect, it, vi } from 'vitest';
import {
  buildPlantListViewQuery,
  replacePlantListViewUrl,
} from './plantListViewUrl';

describe('plantListViewUrl', () => {
  it('buildPlantListViewQuery omits default sort', () => {
    expect(
      buildPlantListViewQuery({
        query: 'モンステラ',
        sunlight: 'full_sun',
        sort: 'createdDesc',
      }),
    ).toBe('q=%E3%83%A2%E3%83%B3%E3%82%B9%E3%83%86%E3%83%A9&sunlight=full_sun');
  });

  it('replacePlantListViewUrl updates location without navigation', () => {
    const replaceState = vi.fn();
    vi.stubGlobal('history', {
      ...window.history,
      replaceState,
      state: null,
    });

    replacePlantListViewUrl('/plants', {
      query: '',
      sunlight: '',
      sort: 'waterOldest',
    });

    expect(replaceState).toHaveBeenCalledWith(null, '', '/plants?sort=waterOldest');
  });
});
