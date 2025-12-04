"use client";
import React, { useState } from "react";
import { GetStartedLink } from "@/app/features/common/index";

const Home = () => {
  const [loading, setLoading] = useState(false);

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
            Hey there! Ready to take <span className="text-indigo-500">control</span> of your money?
          </div>

          <div className="text-center xl:text-xl text-lg">
            From daily spends to monthly insights — all in one clean view. Simple. Smart. Stress-free.
          </div>
          <div className="flex gap-4 items-center">
            <GetStartedLink href="/signin" width="w-[150px]" onClick={handleGetStartedClick} loading={loading}>Get Started</GetStartedLink>
            <a
              href="#features"
              className=" bg-btn-background text-white hover:bg-btn-hover py-2.5 px-4 text-center text-base font-medium  rounded-xl   hover:shadow-md transition duration-500 w-[150px]"
            >
              Read more
            </a>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-center mt-28 px-4" id="features">
        <div className="flex flex-col justify-center items-center max-w-6xl">
          <h1 className="md:text-5xl text-center font-bold text-4xl">
            Features
          </h1>
          <p className="text-lg text-center mt-4">
            Explore our powerful tools designed to help you manage your finances effortlessly.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mt-12 w-full justify-items-center">
            <div className=" rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col items-center gap-4 hover:shadow-xl transition-shadow duration-300 bg-background">
              <div className="w-16 h-16  bg-indigo-100 rounded-full flex items-center justify-center text-2xl">
                💡
              </div>
              <h2 className="text-xl font-semibold text-center">
                Powerful Dashboard
              </h2>
              <p className="text-center">
                Get an instant overview of your financial health with clean charts and data.
              </p>
            </div>

            <div className="rounded-2xl bg-background shadow-lg p-4 sm:p-6 flex flex-col items-center gap-4 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16  bg-indigo-100  rounded-full flex items-center justify-center text-2xl">
                ⚙️
              </div>
              <h2 className="text-xl font-semibold text-center">
                Custom Categories
              </h2>
              <p className="text-center">
                Create and manage categories that match your lifestyle and habits.
              </p>
            </div>

            <div className=" rounded-2xl bg-background shadow-lg p-4 sm:p-6 flex flex-col items-center gap-4 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-indigo-100  rounded-full flex items-center justify-center text-2xl">
                📅
              </div>
              <h2 className="text-xl font-semibold text-center">
                Monthly Reports
              </h2>
              <p className="text-center">
                Get detailed monthly summaries to stay on track with your budget goals.
              </p>
            </div>

            <div className=" rounded-2xl bg-background shadow-lg p-4 sm:p-6 flex flex-col items-center gap-4 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">
                🔔
              </div>
              <h2 className="text-xl font-semibold text-center">
                Smart Alerts
              </h2>
              <p className="text-center">
                Get notified of overspending, due bills, and upcoming payments.
              </p>
            </div>
            <div className=" rounded-2xl bg-background shadow-lg p-4 sm:p-6 flex flex-col items-center gap-3 sm:gap-4 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-2xl sm:text-3xl">
                🌍
              </div>
              <h2 className="text-xl font-semibold text-center">
                Multi-Currency
              </h2>
              <p className="text-center">
                Track your income and expenses in various currencies with real-time exchange rates.
              </p>
            </div>

            <div className=" rounded-2xl bg-background shadow-lg p-4 sm:p-6 flex flex-col items-center gap-3 sm:gap-4 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-indigo-100  rounded-full flex items-center justify-center text-2xl sm:text-3xl">
                🌓
              </div>
              <h2 className="text-xl font-semibold text-center ">
                Theme Support
              </h2>
              <p className="text-center ">
                Enjoy a seamless light and dark mode experience to match your environment.
              </p>
            </div>
          </div>
        </div>
      </div>
      <footer className=" mt-28 p-3">
        <div className="text-center">
          <h2 className="text-2xl font-bold">BudgetBuddy</h2>
          <p className="text-sm mt-2 ">
            Simplify your spending. Master your money.
          </p>
          <p className="text-xs mt-4">
            © {new Date().getFullYear()} BudgetBuddy. Built with care for personal finance lovers.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;