// utils/firestore.ts
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const saveUserData = async (uid: string, data: any) => {
  try {
    await setDoc(doc(db, "users", uid), data, { merge: true });
    console.log("Data saved!");
  } catch (error) {
    console.error("Error saving data:", error);
  }
};

export const fetchUserData = async (uid: string) => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};
