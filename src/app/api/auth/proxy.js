import { adminDb } from "@/lib/firebaseAdmin"; // admin SDK

export async function POST(req) {
  const { action, email, password, role, uid } = await req.json();

  if (action === "register") {
    await adminDb.collection("roles").doc(uid).set({
      role: role || "user",
    });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
