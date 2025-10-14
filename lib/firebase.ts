// File: lib/firebase.ts
import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore | undefined;

try {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!serviceAccountKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
  }

  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID environment variable is not set');
  }

  console.log(`Initializing Firebase for project ID: ${projectId}`); // Debug log

  let parsedServiceAccount;
  try {
    parsedServiceAccount = JSON.parse(serviceAccountKey);
  } catch (error) {
    throw new Error(`Invalid FIREBASE_SERVICE_ACCOUNT_KEY: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(parsedServiceAccount),
      projectId,
    });
  }

  db = admin.firestore();
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
}

export { db };