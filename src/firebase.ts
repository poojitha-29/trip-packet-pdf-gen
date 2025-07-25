// firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyByLYOoKzOiUzv_nNlnDuvDwcHoRHJIBPc",
  authDomain: "trip-pdf-gen.firebaseapp.com",
  projectId: "trip-pdf-gen",
  storageBucket: "trip-pdf-gen.appspot.com",
  messagingSenderId: "271220066692",
  appId: "1:271220066692:web:4ed026d15badf0a960b5d1",
  measurementId: "G-8M7JTH1416"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
