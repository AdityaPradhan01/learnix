import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const PROTECTED_PREFIXES = [
  "/onboarding",
  "/home",
  "/explore",
  "/course",
  "/progress",
  "/saved",
  "/updates",
  "/settings",
  "/compare",
  "/path",
];
const AUTH_PAGES = ["/login", "/signup"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => nextUrl.pathname === p || nextUrl.pathname.startsWith(`${p}/`),
  );
  const isAuthPage = AUTH_PAGES.includes(nextUrl.pathname);

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/home", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
