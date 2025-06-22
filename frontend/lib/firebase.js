// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD6ZcMWE6D8mm4V0BDV4EvPPFTrWoplRHU",
  authDomain: "trialmatch-b476b.firebaseapp.com",
  projectId: "trialmatch-b476b",
  storageBucket: "trialmatch-b476b.firebasestorage.app",
  messagingSenderId: "69557673469",
  appId: "1:69557673469:web:d39ccb0465754bbacdcd94",
  measurementId: "G-P3QTBW8N02"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);

