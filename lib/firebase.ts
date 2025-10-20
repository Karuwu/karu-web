// lib/firebase.ts
import * as admin from 'firebase-admin';
import { cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  });
}

const db = getFirestore();
if (process.env.NEXT_PUBLIC_FIREBASE_EMULATOR === 'true') {
  db.settings({
    host: 'localhost:8080',
    ssl: false,
  });
}

const auth = getAuth();

export { db, auth };