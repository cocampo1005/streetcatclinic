import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyDI6BJ8QeiM3T3ona8Rt4vOOf4X1u7PvEA",
  authDomain: "streetcatclinic.firebaseapp.com",
  projectId: "streetcatclinic",
  storageBucket: "streetcatclinic.firebasestorage.app",
  messagingSenderId: "1090589337948",
  appId: "1:1090589337948:web:5785232a538e5819503999",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const functions = getFunctions(app, "us-central1");
