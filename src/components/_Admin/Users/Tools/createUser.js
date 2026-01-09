import { auth, db } from "@/lib/firebaseClient";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Creates a new user in Firebase Authentication
 * and creates the Firestore user document.
 *
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.password
 * @param {string} params.name
 * @param {string} params.role
 */
export default async function createUser({ email, password, name, role }) {
  if (!email || !password) {
    return {
      success: false,
      messageKey: "admin.users.errors.missingCredentials",
    };
  }

  try {
    // 1. Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const uid = userCredential.user.uid;

    // 2. Create Firestore document
    await setDoc(doc(db, "users", uid), {
      email,
      name: name || "",
      role: role || "customer",
      isBanned: false,

      // analytics / meta
      totalOrders: 0,
      completedOrders: 0,
      totalSpent: 0,
      lastLogin: null,
      lastOrderDate: null,

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      uid,
      messageKey: "admin.users.success.userCreated",
    };
  } catch (error) {
    console.error("Error creating user:", error);

    // Firebase common errors mapping (optional but professional)
    if (error?.code === "auth/email-already-in-use") {
      return {
        success: false,
        messageKey: "admin.users.errors.emailInUse",
      };
    }

    if (error?.code === "auth/weak-password") {
      return {
        success: false,
        messageKey: "admin.users.errors.weakPassword",
      };
    }

    return {
      success: false,
      messageKey: "admin.users.errors.createFailed",
    };
  }
}
