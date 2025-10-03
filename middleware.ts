import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Optional: Add custom logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Check if token exists
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"], // Protect all /dashboard/* routes
};