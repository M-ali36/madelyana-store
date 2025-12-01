import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req) {
  const { action, email, password, role } = await req.json();

  try {
    if (action === "register") {
      const userRecord = await adminAuth.createUser({
        email,
        password,
      });

      // Assign user roles using custom claims
      await adminAuth.setCustomUserClaims(userRecord.uid, {
        role: role || "user",
      });

      return NextResponse.json({ success: true, uid: userRecord.uid });
    }

    if (action === "getClaims") {
      const token = await req.headers.get("Authorization")?.replace("Bearer ", "");
      const decoded = await adminAuth.verifyIdToken(token);
      return NextResponse.json({ role: decoded.role || "user" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
