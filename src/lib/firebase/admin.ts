import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
  type App,
} from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getGcpProjectId, getFirestoreDatabaseId } from '@/lib/env';

let app: App | undefined;

function getFirebaseApp(): App {
  if (app) {
    return app;
  }

  const existing = getApps();
  if (existing.length > 0) {
    app = existing[0];
    return app;
  }

  const projectId = getGcpProjectId();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  app = initializeApp({
    projectId,
    credential:
      clientEmail && privateKey
        ? cert({ projectId, clientEmail, privateKey })
        : applicationDefault(),
  });

  return app;
}

export function getDb() {
  const databaseId = getFirestoreDatabaseId();
  return getFirestore(getFirebaseApp(), databaseId);
}
