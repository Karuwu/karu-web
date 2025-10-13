// File: lib/firebase.ts
import admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  // Get the service account key from environment variables
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set in .env.local');
  }

  // Initialize the app with credentials
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(serviceAccountKey)),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

// Export the initialized firestore database instance
const db = admin.firestore();
export { db };