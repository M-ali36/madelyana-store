// /components/_Admin/Users/Tools/banUser.js

import { db } from "@/lib/firebaseClient";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

/**
 * Ban or unban a user.
 *
 * @param {string} uid - User ID
 * @param {boolean} banStatus - true = ban, false = unban
 */
export default async function banUser(uid, banStatus) {
  try {
    if (!uid) return { success: false, error: "User ID missing" };

    await updateDoc(doc(db, "users", uid), {
      isBanned: banStatus,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error banning user:", error);
    return { success: false, error: error.message };
  }
}
