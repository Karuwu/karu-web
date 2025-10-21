// lib/firebase.ts
import * as admin from 'firebase-admin';
import { cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

if (!serviceAccount || !serviceAccount.project_id || serviceAccount.project_id !== process.env.FIREBASE_PROJECT_ID) {
  console.error('FIREBASE_SERVICE_ACCOUNT_KEY is missing or invalid in .env:', {
    hasKey: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    parsedProjectId: serviceAccount?.project_id,
    expectedProjectId: process.env.FIREBASE_PROJECT_ID,
  });
  throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is missing or invalid in .env');
}

if (!process.env.FIREBASE_PROJECT_ID) {
  console.error('FIREBASE_PROJECT_ID is missing in .env');
  throw new Error('FIREBASE_PROJECT_ID is missing in .env');
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: cert(serviceAccount),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error: any) {
    console.error('Firebase Admin initialization failed:', {
      message: error.message || 'Unknown error',
      code: error.code || 'No code',
      stack: error.stack || 'No stack',
    });
    throw error;
  }
}

export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();