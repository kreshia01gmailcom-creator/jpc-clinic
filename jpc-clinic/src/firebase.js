
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCGMg_JTH7KOmEzxMOQ6jXwNxFh1entsFg",
  authDomain: "jpc-clinic.firebaseapp.com",
  projectId: "jpc-clinic",
  storageBucket: "jpc-clinic.firebasestorage.app",
  messagingSenderId: "459953076084",
  appId: "1:459953076084:web:7d23f7758f375107ec1e21",
  measurementId: "G-S0XH4RBJKN"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);