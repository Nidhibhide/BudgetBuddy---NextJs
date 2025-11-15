"use client";

import { Globe } from "lucide-react";
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Formik } from 'formik';
import { SelectBox } from '@/app/features/common/Elements';
import { LanguageSelectorProps } from "@/app/types/appTypes";

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className }) => {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const languages = [
    { code: 'en', display: 'English' },
    { code: 'hi', display: 'हिन्दी' },
    { code: 'mr', display: 'मराठी' },
  ];
  const currentValue = languages.find(l => l.code === locale)?.display || 'English';
  const handleLanguageChange = (selected: string) => {
    const lang = languages.find(l => l.display === selected);
    if (lang) {
      document.cookie = `NEXT_LOCALE=${lang.code}; path=/; max-age=31536000`;
      window.location.reload();
    }
  };
  return (
    <Formik initialValues={{ language: currentValue }} onSubmit={() => {}}>
      <SelectBox
        name="language"
        options={languages.map(l => l.display)}
        onChange={handleLanguageChange}
        value={currentValue}
        label=""
        className={className}
        icon={<Globe className="size-5" />}
      />
    </Formik>
  );
};

export default LanguageSelector;