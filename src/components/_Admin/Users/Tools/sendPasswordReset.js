// /components/_Admin/Users/Tools/sendPasswordReset.js

import { auth } from "@/lib/firebaseClient";
import { sendPasswordResetEmail } from "firebase/auth";

/**
 * Sends a password reset email to the user.
 *
 * @param {string} email - User email
 */
export default async function sendPasswordReset(email) {
  try {
    if (!email) return { success: false, error: "Missing email address" };

    await sendPasswordResetEmail(auth, email);

    return { success: true };
  } catch (error) {
    console.error("Password reset error:", error);
    return {
      success: false,
      error: error.message || "Failed to send password reset email",
    };
  }
}
