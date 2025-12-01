import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("firebase_id_token")?.value;
  const role = request.cookies.get("auth_role")?.value;
  const { pathname } = request.nextUrl;

  // Block admin/customer if no login
  if (!token) {
    if (pathname.startsWith("/admin") || pathname.startsWith("/customer")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // USER trying to access admin → redirect
  if (role === "user" && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/customer", request.url));
  }

  // ADMIN trying to access customer → redirect
  if (role === "admin" && pathname.startsWith("/customer")) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/customer/:path*"],
};
