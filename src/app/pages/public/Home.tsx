"use client";
import React, { useState } from "react";
import { GetStartedLink } from "@/app/features/common/index";
import { useTranslations } from "next-intl";

const Home = () => {
  const [loading, setLoading] = useState(false);
  const t = useTranslations();

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
            {t("pages.public.home.heroTitle")}
          </div>

          <div className="text-center xl:text-xl text-lg">
            {t("pages.public.home.heroSubtitle")}
          </div>
          <div className="flex gap-4 items-center">
            <GetStartedLink href="/signin" width="w-[150px]" onClick={handleGetStartedClick} loading={loading}>{t("pages.public.home.getStarted")}</GetStartedLink>
            <a
              href="#features"
              className=" bg-btn-background text-white hover:bg-btn-hover py-2.5 px-4 text-center text-base font-medium  rounded-xl   hover:shadow-md transition duration-500 w-[150px]"
            >
              {t("pages.public.home.readMore")}
            </a>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-center mt-28 px-4" id="features">
        <div className="flex flex-col justify-center items-center max-w-6xl">
          <h1 className="md:text-5xl text-center font-bold text-4xl">
            {t("pages.public.home.featuresTitle")}
          </h1>
          <p className="text-lg text-center mt-4">
            {t("pages.public.home.featuresSubtitle")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mt-12 w-full justify-items-center">
            <div className=" rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col items-center gap-4 hover:shadow-xl transition-shadow duration-300 bg-background">
              <div className="w-16 h-16  bg-indigo-100 rounded-full flex items-center justify-center text-2xl">
                💡
              </div>
              <h2 className="text-xl font-semibold text-center">
                {t("pages.public.home.features.powerfulDashboard.title")}
              </h2>
              <p className="text-center">
                {t("pages.public.home.features.powerfulDashboard.description")}
              </p>
            </div>

            <div className="rounded-2xl bg-background shadow-lg p-4 sm:p-6 flex flex-col items-center gap-4 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16  bg-indigo-100  rounded-full flex items-center justify-center text-2xl">
                ⚙️
              </div>
              <h2 className="text-xl font-semibold text-center">
                {t("pages.public.home.features.customCategories.title")}
              </h2>
              <p className="text-center">
                {t("pages.public.home.features.customCategories.description")}
              </p>
            </div>

            <div className=" rounded-2xl bg-background shadow-lg p-4 sm:p-6 flex flex-col items-center gap-4 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-indigo-100  rounded-full flex items-center justify-center text-2xl">
                📅
              </div>
              <h2 className="text-xl font-semibold text-center">
                {t("pages.public.home.features.monthlyReports.title")}
              </h2>
              <p className="text-center">
                {t("pages.public.home.features.monthlyReports.description")}
              </p>
            </div>

            <div className=" rounded-2xl bg-background shadow-lg p-4 sm:p-6 flex flex-col items-center gap-4 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">
                🔔
              </div>
              <h2 className="text-xl font-semibold text-center">
                {t("pages.public.home.features.smartAlerts.title")}
              </h2>
              <p className="text-center">
                {t("pages.public.home.features.smartAlerts.description")}
              </p>
            </div>
            <div className=" rounded-2xl bg-background shadow-lg p-4 sm:p-6 flex flex-col items-center gap-3 sm:gap-4 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-2xl sm:text-3xl">
                🌍
              </div>
              <h2 className="text-xl font-semibold text-center">
                {t("pages.public.home.features.multiCurrency.title")}
              </h2>
              <p className="text-center">
                {t("pages.public.home.features.multiCurrency.description")}
              </p>
            </div>

            <div className=" rounded-2xl bg-background shadow-lg p-4 sm:p-6 flex flex-col items-center gap-3 sm:gap-4 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-indigo-100  rounded-full flex items-center justify-center text-2xl sm:text-3xl">
                🌓
              </div>
              <h2 className="text-xl font-semibold text-center ">
                {t("pages.public.home.features.themeSupport.title")}
              </h2>
              <p className="text-center ">
                {t("pages.public.home.features.themeSupport.description")}
              </p>
            </div>
          </div>
        </div>
      </div>
      <footer className=" mt-28 p-3">
        <div className="text-center">
          <h2 className="text-2xl font-bold">BudgetBuddy</h2>
          <p className="text-sm mt-2 ">
            {t("pages.public.home.footer.tagline")}
          </p>
          <p className="text-xs mt-4">
            {t("pages.public.home.footer.copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;