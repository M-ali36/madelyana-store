import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, email, password, role } = body || {};

    // --------------------------------------
    // REGISTER USER
    // --------------------------------------
    if (action === "register") {
      if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password are required" },
          { status: 400 }
        );
      }

      const userRecord = await adminAuth.createUser({
        email,
        password,
      });

      await adminAuth.setCustomUserClaims(userRecord.uid, {
        role: role || "user",
      });

      return NextResponse.json({
        success: true,
        uid: userRecord.uid,
      });
    }

    // --------------------------------------
    // GET USER CLAIMS
    // --------------------------------------
    if (action === "getClaims") {
      const authHeader = req.headers.get("Authorization");

      if (!authHeader) {
        return NextResponse.json(
          { error: "Missing Authorization header" },
          { status: 401 }
        );
      }

      const token = authHeader.startsWith("Bearer ")
        ? authHeader.replace("Bearer ", "")
        : null;

      if (!token) {
        return NextResponse.json(
          { error: "Invalid authorization token" },
          { status: 401 }
        );
      }

      const decoded = await adminAuth.verifyIdToken(token);

      return NextResponse.json({
        role: decoded?.role || "user",
      });
    }

    // --------------------------------------
    // INVALID ACTION
    // --------------------------------------
    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Auth API error:", error);

    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
