import { NextResponse, type NextRequest } from "next/server";

const ALLOWED_PREFIXES = [
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/chat",
  "/admin",
  "/about-us",
  "/feedback",
  "/privacy-policy",
];

const ALLOWED_EXACT = new Set(["/"]);

const LEGACY_REDIRECTS: Record<string, string> = {
  "/dashboard": "/chat",
  "/pricing": "/",
  "/subscribe": "/",
  "/contact": "/feedback",
  "/cookies-policy": "/privacy-policy",
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  for (const [legacy, target] of Object.entries(LEGACY_REDIRECTS)) {
    if (pathname === legacy || pathname.startsWith(`${legacy}/`)) {
      const url = req.nextUrl.clone();
      url.pathname = target;
      return NextResponse.redirect(url, 308);
    }
  }

  if (ALLOWED_EXACT.has(pathname)) {
    return NextResponse.next();
  }
  for (const prefix of ALLOWED_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return NextResponse.next();
    }
  }

  const url = req.nextUrl.clone();
  url.pathname = "/";
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
