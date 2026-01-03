import { db } from "../firebaseClient";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function addContactMessage(data) {
  return await addDoc(collection(db, "contactMessages"), {
    ...data,
    createdAt: serverTimestamp()
  });
}
