import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDq4XhtWX9rtt7xcv54CviS35Fln_w2M7o",
  authDomain: "ha-design-d1622.firebaseapp.com",
  projectId: "ha-design-d1622",
  storageBucket: "ha-design-d1622.firebasestorage.app",
  messagingSenderId: "237301912296",
  appId: "1:237301912296:web:ce0d13b89f81a66597ef5d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
