import { Timestamp } from 'firebase-admin/firestore';
import { deleteSubcollection } from '@/lib/firestore/deleteSubcollection';
import { getDb } from '@/lib/firebase/admin';
import type {
  PlantChatMessage,
  PlantChatMessageDocument,
  PlantChatRole,
} from '@/types/plant';

const PLANTS_COLLECTION = 'plants';
const CHAT_MESSAGES_COLLECTION = 'chatMessages';

function toPlantChatMessage(
  id: string,
  data: PlantChatMessageDocument,
): PlantChatMessage {
  return {
    id,
    role: data.role,
    content: data.content,
    createdAt: data.createdAt.toDate(),
  };
}

export async function listPlantChatMessages(
  plantId: string,
  limit = 100,
): Promise<PlantChatMessage[]> {
  const snapshot = await getDb()
    .collection(PLANTS_COLLECTION)
    .doc(plantId)
    .collection(CHAT_MESSAGES_COLLECTION)
    .orderBy('createdAt', 'asc')
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) =>
    toPlantChatMessage(doc.id, doc.data() as PlantChatMessageDocument),
  );
}

export async function appendPlantChatMessages(
  plantId: string,
  messages: ReadonlyArray<{ role: PlantChatRole; content: string }>,
): Promise<PlantChatMessage[]> {
  const db = getDb();
  const collectionRef = db
    .collection(PLANTS_COLLECTION)
    .doc(plantId)
    .collection(CHAT_MESSAGES_COLLECTION);

  const batch = db.batch();
  const created: PlantChatMessage[] = [];
  const baseMs = Date.now();

  messages.forEach((message, index) => {
    const createdAt = Timestamp.fromMillis(baseMs + index);
    const ref = collectionRef.doc();
    batch.set(ref, {
      role: message.role,
      content: message.content,
      createdAt,
    });
    created.push({
      id: ref.id,
      role: message.role,
      content: message.content,
      createdAt: createdAt.toDate(),
    });
  });

  await batch.commit();
  return created;
}

export async function deletePlantChatMessages(plantId: string): Promise<void> {
  await deleteSubcollection(
    getDb()
      .collection(PLANTS_COLLECTION)
      .doc(plantId)
      .collection(CHAT_MESSAGES_COLLECTION),
  );
}
