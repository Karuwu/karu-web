import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBuPBxw09eM3bHOdWyWQIKLGDofVyP41wI',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'karu-web.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'karu-web',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'karu-web.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '801444200145',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:801444200145:web:ccf331df2aaf233efd8ff0',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

if (process.env.NEXT_PUBLIC_FIREBASE_EMULATOR === 'true') {
  console.log('Firebase Client: Connecting to Auth emulator at http://localhost:9099');
  console.log('Firebase Client: Connecting to Firestore emulator at localhost:8080');
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
}

export { app, auth, db };