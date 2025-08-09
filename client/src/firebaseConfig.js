import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// IMPORTANT: Use environment variables to hide these keys in production!
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB5u6lJbNCT_nBZNM1GRDsmuAvfDGcOMgM",
  authDomain: "sitebuilder-7c509.firebaseapp.com",
  projectId: "sitebuilder-7c509",
  storageBucket: "sitebuilder-7c509.firebasestorage.app",
  messagingSenderId: "281206894740",
  appId: "1:281206894740:web:746302365e48dc466a8481",
  measurementId: "G-04VWCS165E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);