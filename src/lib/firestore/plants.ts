import { FieldValue, Timestamp, type Query } from 'firebase-admin/firestore';
import { getDb } from '@/lib/firebase/admin';
import { isSunlightTagId, type SunlightTagId } from '@/lib/plants/sunlightTags';
import {
  clampAiPhotoIndex,
  normalizeAiPhotoIndices,
  normalizePhotoUrls,
} from '@/lib/photos/normalizePhotos';
import { extractCareDatesFromLogs } from '@/lib/plants/extractCareDatesFromLogs';
import type { Plant, PlantDocument, PlantLog, PlantLogDocument } from '@/types/plant';

const PLANTS_COLLECTION = 'plants';

function toPlant(id: string, data: PlantDocument, latestPhotoUrl?: string): Plant {
  const rawTag = data.sunlightTag;
  const sunlightTag =
    typeof rawTag === 'string' && isSunlightTagId(rawTag) ? rawTag : undefined;

  const photoUrls = normalizePhotoUrls(data.photoUrls);
  const aiPhotoIndex = clampAiPhotoIndex(data.aiPhotoIndex, photoUrls.length);

  return {
    id,
    name: data.name,
    photoUrls,
    aiPhotoIndex,
    latestPhotoUrl,
    careGuide: data.careGuide,
    sunlightTag,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
}

function toPlantLog(id: string, data: PlantLogDocument): PlantLog {
  const photoUrls = normalizePhotoUrls(data.photoUrls);
  const aiPhotoIndex = clampAiPhotoIndex(data.aiPhotoIndex, photoUrls.length);
  const aiPhotoIndices = normalizeAiPhotoIndices(
    data.aiPhotoIndices,
    aiPhotoIndex,
    photoUrls.length,
  );

  const visualSnapshot =
    typeof data.visualSnapshot === 'string' ? data.visualSnapshot.trim() : undefined;

  return {
    id,
    photoUrls,
    aiPhotoIndex,
    aiPhotoIndices: aiPhotoIndices.length > 0 ? aiPhotoIndices : undefined,
    memo: data.memo,
    aiAdvice: typeof data.aiAdvice === 'string' ? data.aiAdvice : '',
    visualSnapshot: visualSnapshot || undefined,
    observedAt: data.observedAt.toDate(),
    createdAt: data.createdAt.toDate(),
    accordionOpen:
      typeof data.accordionOpen === 'boolean' ? data.accordionOpen : undefined,
  };
}

export async function listPlants(): Promise<Plant[]> {
  const snapshot = await getDb()
    .collection(PLANTS_COLLECTION)
    .orderBy('createdAt', 'desc')
    .get();

  return Promise.all(
    snapshot.docs.map(async (doc) => {
      const logsSnapshot = await doc.ref
        .collection('logs')
        .orderBy('observedAt', 'desc')
        .get();

      const { latestPhotoUrl, lastWateredAt, lastFertilizedAt } =
        extractCareDatesFromLogs(
          logsSnapshot.docs.map((logDoc) => ({
            data: () => logDoc.data() as PlantLogDocument,
          })),
        );

      const plant = toPlant(doc.id, doc.data() as PlantDocument, latestPhotoUrl);
      return {
        ...plant,
        lastWateredAt,
        lastFertilizedAt,
      };
    }),
  );
}

export async function getPlant(plantId: string): Promise<Plant | null> {
  const doc = await getDb().collection(PLANTS_COLLECTION).doc(plantId).get();
  if (!doc.exists) {
    return null;
  }
  return toPlant(doc.id, doc.data() as PlantDocument);
}

export async function createPlant(input: {
  name: string;
  photoUrls: string[];
  aiPhotoIndex: number;
  careGuide: string;
  sunlightTag: SunlightTagId;
}): Promise<string> {
  const now = FieldValue.serverTimestamp();
  const ref = await getDb().collection(PLANTS_COLLECTION).add({
    name: input.name,
    photoUrls: input.photoUrls,
    aiPhotoIndex: input.aiPhotoIndex,
    careGuide: input.careGuide,
    sunlightTag: input.sunlightTag,
    createdAt: now,
    updatedAt: now,
  });

  return ref.id;
}

export async function updatePlant(
  plantId: string,
  input: {
    name: string;
  },
): Promise<void> {
  await getDb().collection(PLANTS_COLLECTION).doc(plantId).update({
    name: input.name,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function getPlantLog(
  plantId: string,
  logId: string,
): Promise<PlantLog | null> {
  const doc = await getDb()
    .collection(PLANTS_COLLECTION)
    .doc(plantId)
    .collection('logs')
    .doc(logId)
    .get();

  if (!doc.exists) {
    return null;
  }

  return toPlantLog(doc.id, doc.data() as PlantLogDocument);
}

export async function listPlantLogs(plantId: string, limit = 20): Promise<PlantLog[]> {
  let query: Query = getDb()
    .collection(PLANTS_COLLECTION)
    .doc(plantId)
    .collection('logs')
    .orderBy('observedAt', 'desc');

  if (limit > 0) {
    query = query.limit(limit);
  }

  const snapshot = await query.get();

  return snapshot.docs.map((doc) => toPlantLog(doc.id, doc.data() as PlantLogDocument));
}

export async function createPlantLog(
  plantId: string,
  input: {
    photoUrls: string[];
    aiPhotoIndex: number;
    aiPhotoIndices?: number[];
    memo: string;
    aiAdvice: string;
    visualSnapshot?: string;
    observedAt: Date;
  },
): Promise<string> {
  const db = getDb();
  const batch = db.batch();
  const logRef = db.collection(PLANTS_COLLECTION).doc(plantId).collection('logs').doc();

  const aiPhotoIndices = normalizeAiPhotoIndices(
    input.aiPhotoIndices,
    input.aiPhotoIndex,
    input.photoUrls.length,
  );

  batch.set(logRef, {
    photoUrls: input.photoUrls,
    aiPhotoIndex: aiPhotoIndices[0] ?? input.aiPhotoIndex,
    ...(aiPhotoIndices.length > 0 ? { aiPhotoIndices } : {}),
    memo: input.memo,
    aiAdvice: input.aiAdvice,
    ...(input.visualSnapshot ? { visualSnapshot: input.visualSnapshot } : {}),
    observedAt: Timestamp.fromDate(input.observedAt),
    createdAt: FieldValue.serverTimestamp(),
  });

  batch.update(db.collection(PLANTS_COLLECTION).doc(plantId), {
    updatedAt: FieldValue.serverTimestamp(),
  });

  await batch.commit();
  return logRef.id;
}

export async function deletePlantLog(plantId: string, logId: string): Promise<void> {
  const db = getDb();
  const batch = db.batch();
  const logRef = db
    .collection(PLANTS_COLLECTION)
    .doc(plantId)
    .collection('logs')
    .doc(logId);

  batch.delete(logRef);
  batch.update(db.collection(PLANTS_COLLECTION).doc(plantId), {
    updatedAt: FieldValue.serverTimestamp(),
  });

  await batch.commit();
}

export async function updateTimelineAccordionOpenState(
  plantId: string,
  logOpenById: Record<string, boolean>,
): Promise<void> {
  const db = getDb();
  const batch = db.batch();
  const plantRef = db.collection(PLANTS_COLLECTION).doc(plantId);
  let hasUpdates = false;

  for (const [logId, accordionOpen] of Object.entries(logOpenById)) {
    batch.update(plantRef.collection('logs').doc(logId), {
      accordionOpen,
    });
    hasUpdates = true;
  }

  if (!hasUpdates) {
    return;
  }

  await batch.commit();
}

export async function deletePlantWithLogs(plantId: string): Promise<void> {
  const { deleteSubcollection } = await import('@/lib/firestore/deleteSubcollection');
  const { deletePlantChatMessages } = await import('@/lib/firestore/plantChat');

  const db = getDb();
  const plantRef = db.collection(PLANTS_COLLECTION).doc(plantId);

  await Promise.all([
    deleteSubcollection(plantRef.collection('logs')),
    deletePlantChatMessages(plantId),
  ]);

  await plantRef.delete();
}
