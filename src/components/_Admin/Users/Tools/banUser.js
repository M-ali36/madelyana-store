import { db } from "@/lib/firebaseClient";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

/**
 * Ban or unban a user.
 *
 * @param {string} uid - User ID
 * @param {boolean} banStatus - true = ban, false = unban
 */
export default async function banUser(uid, banStatus) {
  if (!uid) {
    return {
      success: false,
      messageKey: "admin.users.errors.missingUserId",
    };
  }

  try {
    await updateDoc(doc(db, "users", uid), {
      isBanned: banStatus,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      messageKey: banStatus
        ? "admin.users.success.userBanned"
        : "admin.users.success.userUnbanned",
    };
  } catch (error) {
    console.error("Error banning user:", error);

    return {
      success: false,
      messageKey: "admin.users.errors.banFailed",
    };
  }
}
