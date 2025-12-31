import { NextResponse } from "next/server";

const SUPPORTED_LOCALES = ["en", "ar"];

// Detect locale from pathname
function getLocale(pathname) {
  const segment = pathname.split("/")[1];
  return SUPPORTED_LOCALES.includes(segment) ? segment : "en";
}

export function middleware(request) {
  const token = request.cookies.get("firebase_id_token")?.value || null;
  const role = request.cookies.get("auth_role")?.value || null;

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // 1️⃣ Detect locale
  const locale = getLocale(pathname);

  // Remove existing locale prefix to get clean path
  const pathWithoutLocale = SUPPORTED_LOCALES.includes(pathname.split("/")[1])
    ? pathname.replace(/^\/(en|ar)/, "")
    : pathname;

  const isAdmin = pathWithoutLocale.startsWith("/admin");
  const isCustomer = pathWithoutLocale.startsWith("/customer");

  // 2️⃣ Rewrite URLs missing the locale prefix
  //    /admin      → /en/admin
  //    /customer   → /en/customer
  //    /           → /en
  if (!pathname.startsWith(`/${locale}`)) {
    url.pathname = `/${locale}${pathWithoutLocale}`;
    return NextResponse.rewrite(url);
  }

  // 3️⃣ AUTH REQUIRED (admin & customer sections)
  if (!token) {
    if (isAdmin || isCustomer) {
      url.pathname = `/${locale}/login`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 4️⃣ Restrict "user" from accessing admin
  if (role === "user" && isAdmin) {
    url.pathname = `/${locale}/customer`;
    return NextResponse.redirect(url);
  }

  // 5️⃣ Restrict "admin" from accessing customer
  if (role === "admin" && isCustomer) {
    url.pathname = `/${locale}/admin`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Ensure middleware applies to ALL pages except static assets/API
export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
