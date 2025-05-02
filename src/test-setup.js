import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQpki3reN6IQJgixTxK6nWnuv9BZ4sDeU",
  authDomain: "live-match---matchmaking.firebaseapp.com",
  databaseURL: "https://live-match---matchmaking-default-rtdb.firebaseio.com",
  projectId: "live-match---matchmaking",
  storageBucket: "live-match---matchmaking.firebasestorage.app",
  messagingSenderId: "615425120469",
  appId: "1:615425120469:web:0f82d0b4aa3f362caaea5c",
  measurementId: "G-9RE1CS3MCZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// PayPal configuration
const paypalConfig = {
  clientId: "ATduo7VboepSzJ_qdJm2CgxPt71jAM0AoKl7DyG7QUJnmx8qUxydCIdSlFsztKBaSzUuM6r7b-fk5cY5",
  currency: "USD",
  intent: "capture"
};

export { app, auth, db, paypalConfig }; 