import { createTranslator } from 'next-intl';
import { cookies } from 'next/headers';
import { determineLocale } from '@/app/features/common/helpers/i18nUtils';

import enCommon from '@/messages/en/common.json';
import enIndex from '@/messages/en/index.json';

const messages = Object.assign(enCommon, enIndex);

export async function getT() {
  const cookieStore = await cookies();
  const locale = determineLocale(cookieStore.get('NEXT_LOCALE')?.value);
  return createTranslator({ locale, messages }) as (key: string) => string;
}