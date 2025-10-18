// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBuPBxw09eM3bHOdWyWQIKLGDofVyP41wI",
  authDomain: "karu-web.firebaseapp.com",
  projectId: "karu-web",
  storageBucket: "karu-web.firebasestorage.app",
  messagingSenderId: "801444200145",
  appId: "1:801444200145:web:ccf331df2aaf233efd8ff0"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };