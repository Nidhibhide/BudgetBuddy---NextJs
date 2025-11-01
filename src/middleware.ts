import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export const runtime = 'nodejs';

export default withAuth(
  function middleware() {
    // Additional middleware logic can be added here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"], // Protect all /dashboard/* routes
};