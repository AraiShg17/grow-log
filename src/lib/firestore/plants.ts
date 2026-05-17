import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getDb } from '@/lib/firebase/admin';
import type { Plant, PlantDocument, PlantLog, PlantLogDocument } from '@/types/plant';

const PLANTS_COLLECTION = 'plants';

function toPlant(id: string, data: PlantDocument): Plant {
  return {
    id,
    name: data.name,
    firstPhotoUrl: data.firstPhotoUrl,
    careGuide: data.careGuide,
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

  return snapshot.docs.map((doc) => toPlant(doc.id, doc.data() as PlantDocument));
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
}): Promise<string> {
  const now = FieldValue.serverTimestamp();
  const ref = await getDb().collection(PLANTS_COLLECTION).add({
    name: input.name,
    firstPhotoUrl: input.firstPhotoUrl,
    careGuide: input.careGuide,
    createdAt: now,
    updatedAt: now,
  });

  return ref.id;
}

export async function listPlantLogs(plantId: string, limit = 20): Promise<PlantLog[]> {
  const snapshot = await getDb()
    .collection(PLANTS_COLLECTION)
    .doc(plantId)
    .collection('logs')
    .orderBy('observedAt', 'desc')
    .limit(limit)
    .get();

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
