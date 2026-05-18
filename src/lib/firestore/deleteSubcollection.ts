import type { CollectionReference } from 'firebase-admin/firestore';
import { getDb } from '@/lib/firebase/admin';

const BATCH_LIMIT = 450;

/** サブコレクションの全ドキュメントをバッチ削除する */
export async function deleteSubcollection(
  collectionRef: CollectionReference,
): Promise<void> {
  const snapshot = await collectionRef.get();
  if (snapshot.empty) {
    return;
  }

  let batch = getDb().batch();
  let operationCount = 0;

  async function commitIfNeeded() {
    if (operationCount === 0) {
      return;
    }
    await batch.commit();
    batch = getDb().batch();
    operationCount = 0;
  }

  for (const doc of snapshot.docs) {
    batch.delete(doc.ref);
    operationCount += 1;
    if (operationCount >= BATCH_LIMIT) {
      await commitIfNeeded();
    }
  }

  await commitIfNeeded();
}
