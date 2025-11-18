import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { getToken } from "next-auth/jwt";
import { cookies } from "next/headers";
import { languages, defaultLanguage } from "./i18n";
import { determineLocale } from "./app/features/common/helpers/i18nUtils";

const locales = languages;
const defaultLocale = defaultLanguage;

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect root to default locale
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }

  // Determine locale from pathname or cookie
  const pathnameParts = pathname.split("/");
  const pathnameLocale = pathnameParts[1] && locales.includes(pathnameParts[1] as (typeof locales)[number])
    ? pathnameParts[1]
    : undefined;
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const locale = determineLocale(cookieLocale, undefined, pathnameLocale);

  // Auth check for dashboard routes
  if (pathname.includes("/dashboard")) {
    const token = await getToken({ req: request });
    if (!token) {
      const signinUrl = new URL(`/${locale}/signin`, request.url);
      return NextResponse.redirect(signinUrl);
    }
  }

  // Run next-intl middleware
  const intlResponse = intlMiddleware(request);
  if (intlResponse) return intlResponse;

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
