import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  browserPopupRedirectResolver,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "firebase/auth";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCnF8pj6U_WZOtHtpAQ9Re3iIrghjxLvoQ",
  authDomain: "rpg-dragons.firebaseapp.com",
  projectId: "rpg-dragons",
  storageBucket: "rpg-dragons.firebasestorage.app",
  messagingSenderId: "845426392745",
  appId: "1:845426392745:web:708d8878cb2b2f67ac73b8",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
auth.useDeviceLanguage();

auth.settings = {
  popupRedirectResolver: browserPopupRedirectResolver
};
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export {
  getRedirectResult,
browserPopupRedirectResolver,
  signInWithRedirect,
  getRedirectResult,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,

  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,

  doc,
  setDoc,
  getDoc,
  serverTimestamp
};
  