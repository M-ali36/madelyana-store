import { auth } from "@/lib/firebaseClient";

export async function getUserRole() {
  const token = await auth.currentUser?.getIdToken();

  const res = await fetch("/api/auth/proxy", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "getClaims" }),
  });

  const data = await res.json();
  return data.role;
}
