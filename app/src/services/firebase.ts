// Connects Halo to Firebase.
//  - auth: Firebase Authentication (sign up, log in, reset password)
//  - db:   Cloud Firestore (the database)
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import * as FirebaseAuth from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Reads your settings from the .env file.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Start Firebase only once, even when the app reloads.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Keeps people logged in after they close the app, by saving the
// session on the phone with AsyncStorage.
function createAuth(): FirebaseAuth.Auth {
  const getRNPersistence = (
    FirebaseAuth as unknown as {
      getReactNativePersistence?: (s: typeof AsyncStorage) => FirebaseAuth.Persistence;
    }
  ).getReactNativePersistence;
  try {
    if (getRNPersistence) {
      return FirebaseAuth.initializeAuth(app, { persistence: getRNPersistence(AsyncStorage) });
    }
  } catch {
    // Already started (happens when the app reloads), so use the existing one.
  }
  return FirebaseAuth.getAuth(app);
}

export const auth = createAuth();
export const db = getFirestore(app);