import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { ratelimit } from "@/app/backend/utils/rateLimit";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limit all routes; skip Vercel cron
  if (!pathname.startsWith("/api/cron")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "anonymous";

    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many requests. Please try again later.",
        },
        { status: 429 }
      );
    }
  }

  // Auth check for dashboard routes
  if (pathname.includes("/dashboard")) {
    const token = await getToken({ req: request });
    if (!token) {
      const signinUrl = new URL("/signin", request.url);
      return NextResponse.redirect(signinUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
