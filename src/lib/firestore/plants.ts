import { FieldValue, Timestamp, type Query } from 'firebase-admin/firestore';
import { getDb } from '@/lib/firebase/admin';
import { isSunlightTagId, type SunlightTagId } from '@/lib/plants/sunlightTags';
import type { Plant, PlantDocument, PlantLog, PlantLogDocument } from '@/types/plant';

const PLANTS_COLLECTION = 'plants';

function toPlant(id: string, data: PlantDocument, latestPhotoUrl?: string): Plant {
  const rawTag = data.sunlightTag;
  const sunlightTag =
    typeof rawTag === 'string' && isSunlightTagId(rawTag) ? rawTag : undefined;

  return {
    id,
    name: data.name,
    firstPhotoUrl: data.firstPhotoUrl,
    latestPhotoUrl,
    careGuide: data.careGuide,
    sunlightTag,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
}

function toPlantLog(id: string, data: PlantLogDocument): PlantLog {
  return {
    id,
    photoUrl: data.photoUrl,
    memo: data.memo,
    aiAdvice: data.aiAdvice,
    observedAt: data.observedAt.toDate(),
    createdAt: data.createdAt.toDate(),
  };
}

export async function listPlants(): Promise<Plant[]> {
  const snapshot = await getDb()
    .collection(PLANTS_COLLECTION)
    .orderBy('updatedAt', 'desc')
    .get();

  return Promise.all(
    snapshot.docs.map(async (doc) => {
      const latestLogSnapshot = await doc.ref
        .collection('logs')
        .orderBy('observedAt', 'desc')
        .limit(1)
        .get();
      const latestLog = latestLogSnapshot.docs[0]?.data() as
        | PlantLogDocument
        | undefined;

      return toPlant(doc.id, doc.data() as PlantDocument, latestLog?.photoUrl);
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
  firstPhotoUrl: string;
  careGuide: string;
  sunlightTag: SunlightTagId;
}): Promise<string> {
  const now = FieldValue.serverTimestamp();
  const ref = await getDb().collection(PLANTS_COLLECTION).add({
    name: input.name,
    firstPhotoUrl: input.firstPhotoUrl,
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
    photoUrl: string;
    memo: string;
    aiAdvice: string;
    observedAt: Date;
  },
): Promise<string> {
  const db = getDb();
  const batch = db.batch();
  const logRef = db.collection(PLANTS_COLLECTION).doc(plantId).collection('logs').doc();

  batch.set(logRef, {
    photoUrl: input.photoUrl,
    memo: input.memo,
    aiAdvice: input.aiAdvice,
    observedAt: Timestamp.fromDate(input.observedAt),
    createdAt: FieldValue.serverTimestamp(),
  });

  batch.update(db.collection(PLANTS_COLLECTION).doc(plantId), {
    updatedAt: FieldValue.serverTimestamp(),
  });

  await batch.commit();
  return logRef.id;
}

export async function deletePlantWithLogs(plantId: string): Promise<void> {
  const db = getDb();
  const plantRef = db.collection(PLANTS_COLLECTION).doc(plantId);
  const logsSnapshot = await plantRef.collection('logs').get();

  let batch = db.batch();
  let operationCount = 0;

  async function commitIfNeeded() {
    if (operationCount === 0) {
      return;
    }

    await batch.commit();
    batch = db.batch();
    operationCount = 0;
  }

  for (const logDoc of logsSnapshot.docs) {
    batch.delete(logDoc.ref);
    operationCount += 1;

    if (operationCount >= 450) {
      await commitIfNeeded();
    }
  }

  batch.delete(plantRef);
  operationCount += 1;

  await commitIfNeeded();
}
