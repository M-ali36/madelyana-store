// /components/_Admin/Users/Tools/createUser.js

import { auth, db } from "@/lib/firebaseClient";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Creates a new user in Firebase Authentication
 * AND creates the Firestore user document.
 *
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.password
 * @param {string} params.name
 * @param {string} params.role - (e.g., customer, admin, manager) - You manage manually
 *
 * @returns {Object} { success: true, uid } or { success: false, error }
 */
export default async function createUser({ email, password, name, role }) {
  try {
    if (!email || !password) {
      return { success: false, error: "Email and password are required." };
    }

    // 1. Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    const uid = userCredential.user.uid;

    // 2. Create the Firestore document
    await setDoc(doc(db, "users", uid), {
      email,
      name: name || "",
      role: role || "customer",
      isBanned: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      totalOrders: 0,
      completedOrders: 0,
      totalSpent: 0,
      lastLogin: null,
      lastOrderDate: null,
    });

    return { success: true, uid };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}
