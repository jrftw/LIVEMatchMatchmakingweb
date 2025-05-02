import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const messaging = getMessaging(app);
const analytics = getAnalytics(app);

// Set persistence to LOCAL to keep users logged in
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error('Error setting persistence:', error);
  });

// Collections
export const collections = {
  users: 'users',
  events: 'events',
  matches: 'matches',
  tournaments: 'tournaments',
  achievements: 'achievements',
  news: 'news',
  supportTickets: 'support_tickets',
  chats: 'chats',
  messages: 'messages',
  creatorNetworks: 'creator_networks',
};

// Default user data structure
export const defaultUserData = {
  displayName: '',
  username: '',
  email: '',
  photoURL: '',
  bio: '',
  tags: [],
  platformUsernames: {},
  creatorNetwork: '',
  links: [],
  points: 0,
  level: 1,
  matchesWon: 0,
  tournamentsWon: 0,
  achievements: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

export { auth, db, storage, messaging, analytics };
export default app; 