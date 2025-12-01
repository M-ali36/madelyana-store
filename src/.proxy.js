export const runtime = "edge";

import { NextResponse } from "next/server";

export default function proxy(request) {
  const token = request.cookies.get("firebase_id_token")?.value;
  const role = request.cookies.get("auth_role")?.value; // you MUST set this cookie at login

  const { pathname } = request.nextUrl;

  // No login → block access to protected areas
  if (!token) {
    if (pathname.startsWith("/admin") || pathname.startsWith("/customer")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // ────────────────────────────────────────────
  // ROLE-BASED ROUTING CONTROL
  // ────────────────────────────────────────────

  // If USER tries to access admin pages → redirect to /customer
  if (role === "user" && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/customer", request.url));
  }

  // If ADMIN tries to access customer pages → redirect to /admin
  if (role === "admin" && pathname.startsWith("/customer")) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Allow access if rules are met
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/customer/:path*"],
};
