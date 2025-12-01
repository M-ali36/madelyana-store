// /components/_Admin/Users/Tools/deleteUser.js

import { db } from "@/lib/firebaseClient";
import { doc, deleteDoc } from "firebase/firestore";

/**
 * Deletes a Firestore user document.
 * 
 * NOTE: Firebase Auth user deletion cannot be done from client-side
 * unless the admin is deleting their *own* account.
 *
 * For true admin-level deletion, you must add:
 * - A Firebase Cloud Function
 * - A secure admin HTTPS endpoint
 * 
 * This file handles Firestore deletion only.
 *
 * @param {string} uid
 */

export default async function deleteUser(uid) {
  try {
    if (!uid) return { success: false, error: "User ID missing" };

    // Delete Firestore user document
    await deleteDoc(doc(db, "users", uid));

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: error.message };
  }
}
