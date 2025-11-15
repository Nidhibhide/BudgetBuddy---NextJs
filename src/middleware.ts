import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { getToken } from 'next-auth/jwt';

const intlMiddleware = createMiddleware({
  locales: ['en', 'hi', 'mr'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
});

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Handle locale root redirects first (e.g., /en -> /)
  if (pathname.match(/^\/(en|hi|mr)$/)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Run intl middleware to handle locale routing
  const intlResponse = intlMiddleware(request);
  if (intlResponse) return intlResponse;

  // Then check authentication for protected routes
  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
