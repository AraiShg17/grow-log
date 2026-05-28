import { Timestamp } from 'firebase-admin/firestore';
import { describe, expect, it } from 'vitest';
import { getCareLogMemo } from '@/lib/plants/careLogMemos';
import { extractCareDatesFromLogs } from '@/lib/plants/extractCareDatesFromLogs';
import type { PlantLogDocument } from '@/types/plant';

function logDoc(memo: string, observedAt: Date, photoUrls: string[] = []) {
  const data: PlantLogDocument = {
    photoUrls,
    aiPhotoIndex: 0,
    memo,
    observedAt: Timestamp.fromDate(observedAt),
    createdAt: Timestamp.fromDate(observedAt),
  };
  return { data: () => data };
}

describe('extractCareDatesFromLogs', () => {
  it('picks latest water and fertilize memos', () => {
    const result = extractCareDatesFromLogs([
      logDoc('観察メモ', new Date('2026-05-10')),
      logDoc(getCareLogMemo('water'), new Date('2026-05-08')),
      logDoc(getCareLogMemo('fertilize'), new Date('2026-05-01')),
      logDoc(getCareLogMemo('water'), new Date('2026-04-20')),
    ]);

    expect(result.lastWateredAt?.toISOString()).toBe(
      new Date('2026-05-08').toISOString(),
    );
    expect(result.lastFertilizedAt?.toISOString()).toBe(
      new Date('2026-05-01').toISOString(),
    );
  });
});
