import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBQpki3reN6IQJgixTxK6nWnuv9BZ4sDeU",
  authDomain: "live-match---matchmaking.firebaseapp.com",
  databaseURL: "https://live-match---matchmaking-default-rtdb.firebaseio.com",
  projectId: "live-match---matchmaking",
  storageBucket: "live-match---matchmaking.firebasestorage.app",
  messagingSenderId: "615425120469",
  appId: "1:615425120469:web:47d48776be50bac7aaea5c",
  measurementId: "G-V1B9CVF398"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app; 