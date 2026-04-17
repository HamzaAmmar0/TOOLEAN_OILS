import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json'; // adjust path to root

// Only initialize if we have a config
const app = getApps().length === 0 ? initializeApp(firebaseConfig as any) : getApps()[0];

export const auth = app ? getAuth(app) : null;
// Use the exact databaseId from the config per instructions
export const db = app ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId) : null;

// Helper to authenticate
export const loginWithGoogle = async () => {
  if (!auth) throw new Error("Firebase not initialized");
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const logoutUser = () => {
  if (!auth) return;
  return signOut(auth);
};

// Validate connection
export async function testConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

if (db) testConnection();
