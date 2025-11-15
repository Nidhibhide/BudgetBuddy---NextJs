"use client";
import React, { useState } from "react";
import { GetStartedLink } from "@/app/features/common/index";
import { useTranslations } from 'next-intl'; // Import for internationalization

const Home = () => {
  const [loading, setLoading] = useState(false);

  // Get translation function for the 'home' namespace
  // This provides access to all home page translations
  const t = useTranslations('home');

  const handleGetStartedClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000); // Adjust delay as needed
  };

  return (
    <div className=" min-h-screen w-full py-28 text-foreground">
      <div className="flex xl:flex-row flex-col gap-12 xl:gap-2 px-4 md:px-20 justify-center">
        <div className="flex flex-col xl:gap-8 gap-6 items-center justify-center">
          <div className="xl:text-6xl md:text-5xl text-4xl font-bold text-center max-w-6xl">
            {t('heroTitle').split('control')[0]}<span className="text-indigo-500">control</span>{t('heroTitle').split('control')[1]}
          </div>

          <div className="text-center xl:text-xl text-lg">
            {t('heroSubtitle')}
          </div>
          <div className="flex gap-4 items-center">
            <GetStartedLink href="/signin" width="w-[150px]" onClick={handleGetStartedClick} loading={loading}>{t('getStarted')}</GetStartedLink>
            <a
              href="#features"
              className=" bg-btn-background text-white hover:bg-btn-hover py-2.5 px-4 text-center text-base font-medium  rounded-xl   hover:shadow-md transition duration-500 w-[150px]"
            >
              {t('readMore')}
            </a>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-center mt-28 px-4" id="features">
        <div className="flex flex-col justify-center items-center max-w-6xl">
          <h1 className="md:text-5xl text-center font-bold text-4xl">
            {t('features')}
          </h1>
          <p className="text-lg text-center mt-4">
            {t('featuresDescription')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mt-12 w-full justify-items-center">
            <div className=" rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col items-center gap-4 hover:shadow-xl transition-shadow duration-300 bg-background">
              <div className="w-16 h-16  bg-indigo-100 rounded-full flex items-center justify-center text-2xl">
                💡
              </div>
              <h2 className="text-xl font-semibold text-center">
                {t('powerfulDashboard')}
              </h2>
              <p className="text-center">
                {t('powerfulDashboardDesc')}
              </p>
            </div>

            <div className="rounded-2xl bg-background shadow-lg p-4 sm:p-6 flex flex-col items-center gap-4 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16  bg-indigo-100  rounded-full flex items-center justify-center text-2xl">
                ⚙️
              </div>
              <h2 className="text-xl font-semibold text-center">
                {t('customCategories')}
              </h2>
              <p className="text-center">
                {t('customCategoriesDesc')}
              </p>
            </div>

            <div className=" rounded-2xl bg-background shadow-lg p-4 sm:p-6 flex flex-col items-center gap-4 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-indigo-100  rounded-full flex items-center justify-center text-2xl">
                📅
              </div>
              <h2 className="text-xl font-semibold text-center">
                {t('monthlyReports')}
              </h2>
              <p className="text-center">
                {t('monthlyReportsDesc')}
              </p>
            </div>

            <div className=" rounded-2xl bg-background shadow-lg p-4 sm:p-6 flex flex-col items-center gap-4 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">
                🔔
              </div>
              <h2 className="text-xl font-semibold text-center">
                {t('smartAlerts')}
              </h2>
              <p className="text-center">
                {t('smartAlertsDesc')}
              </p>
            </div>
            <div className=" rounded-2xl bg-background shadow-lg p-4 sm:p-6 flex flex-col items-center gap-3 sm:gap-4 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-2xl sm:text-3xl">
                🌍
              </div>
              <h2 className="text-xl font-semibold text-center">
                {t('multiCurrency')}
              </h2>
              <p className="text-center">
                {t('multiCurrencyDesc')}
              </p>
            </div>

            <div className=" rounded-2xl bg-background shadow-lg p-4 sm:p-6 flex flex-col items-center gap-3 sm:gap-4 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-indigo-100  rounded-full flex items-center justify-center text-2xl sm:text-3xl">
                🌓
              </div>
              <h2 className="text-xl font-semibold text-center ">
                {t('themeSupport')}
              </h2>
              <p className="text-center ">
                {t('themeSupportDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
      <footer className=" mt-28 p-3">
        <div className="text-center">
          <h2 className="text-2xl font-bold">{t('footerTitle')}</h2>
          <p className="text-sm mt-2 ">
            {t('footerSubtitle')}
          </p>
          <p className="text-xs mt-4">
            {t('footerCopyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;