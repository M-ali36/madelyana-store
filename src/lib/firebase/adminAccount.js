import { auth } from "@/lib/firebaseClient";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

export async function changeAdminPassword(currentPassword, newPassword) {
  const user = auth.currentUser;

  if (!user) throw new Error("Not authenticated");

  // Reauthenticate admin
  const credential = EmailAuthProvider.credential(
    user.email,
    currentPassword
  );

  await reauthenticateWithCredential(user, credential);

  // Update password
  await updatePassword(user, newPassword);

  return true;
}
