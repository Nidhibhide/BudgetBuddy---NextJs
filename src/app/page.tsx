import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { determineLocale } from './features/common/helpers/i18nUtils';

export default async function RootPage() {
  // Check NEXT_LOCALE cookie
  const cookieStore = await cookies();
  const localeFromCookie = cookieStore.get('NEXT_LOCALE')?.value;

  // Determine locale
  const locale = determineLocale(localeFromCookie);

  // Redirect to the locale-specific homepage
  redirect(`/${locale}`);
}