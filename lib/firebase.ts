// lib/firebase.ts
import admin from 'firebase-admin';
import type { Firestore } from 'firebase-admin/firestore';

if (typeof window !== 'undefined') {
  // Ensure this file is only used on the server
  throw new Error('lib/firebase.ts should only be imported on the server.');
}

const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const projectId = process.env.FIREBASE_PROJECT_ID;

if (!serviceAccountRaw) {
  throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable');
}
if (!projectId) {
  throw new Error('Missing FIREBASE_PROJECT_ID environment variable');
}

let serviceAccount: Record<string, unknown>;
try {
  serviceAccount = JSON.parse(serviceAccountRaw);
} catch (err) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON');
}

// Initialize app only once (important for dev hot reload)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId,
  });
}

// Export a guaranteed Firestore instance
export const db: Firestore = admin.firestore();
export default db;