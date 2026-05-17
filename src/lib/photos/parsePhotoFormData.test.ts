import { describe, expect, it } from 'vitest';
import { MAX_PHOTOS_PER_ENTRY } from '@/lib/photos/constants';
import {
  parseAiPhotoIndexFromFormData,
  parsePhotoFilesFromFormData,
} from '@/lib/photos/parsePhotoFormData';
import { validateLogPhotosFormData } from '@/lib/photos/uploadPhotosFromFormData';

describe('parsePhotoFilesFromFormData', () => {
  it('returns only non-empty image files up to max', () => {
    const formData = new FormData();
    formData.append('photos', new File(['a'], 'a.jpg', { type: 'image/jpeg' }));
    formData.append('photos', new File([], 'empty.jpg', { type: 'image/jpeg' }));
    formData.append('photos', 'not-a-file');

    expect(parsePhotoFilesFromFormData(formData)).toHaveLength(1);
  });

  it('accepts a single file', () => {
    const formData = new FormData();
    formData.append('photos', new File(['a'], 'a.jpg', { type: 'image/jpeg' }));

    expect(parsePhotoFilesFromFormData(formData)).toHaveLength(1);
  });

  it('caps at MAX_PHOTOS_PER_ENTRY', () => {
    const formData = new FormData();
    for (let i = 0; i < MAX_PHOTOS_PER_ENTRY + 2; i += 1) {
      formData.append('photos', new File(['x'], `${i}.jpg`, { type: 'image/jpeg' }));
    }
    expect(parsePhotoFilesFromFormData(formData)).toHaveLength(MAX_PHOTOS_PER_ENTRY);
  });
});

describe('validateLogPhotosFormData', () => {
  it('allows zero photos', () => {
    const formData = new FormData();
    expect(validateLogPhotosFormData(formData)).toBeNull();
  });

  it('errors when over max', () => {
    const formData = new FormData();
    for (let i = 0; i < MAX_PHOTOS_PER_ENTRY + 1; i += 1) {
      formData.append('photos', new File(['x'], `${i}.jpg`, { type: 'image/jpeg' }));
    }
    expect(validateLogPhotosFormData(formData)).toContain('最大');
  });
});

describe('parseAiPhotoIndexFromFormData', () => {
  it('defaults to 0 for invalid values', () => {
    const formData = new FormData();
    formData.set('aiPhotoIndex', '99');
    expect(parseAiPhotoIndexFromFormData(formData, 3)).toBe(0);
  });

  it('returns valid index', () => {
    const formData = new FormData();
    formData.set('aiPhotoIndex', '2');
    expect(parseAiPhotoIndexFromFormData(formData, 5)).toBe(2);
  });
});
