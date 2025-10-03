"use client"; // make it a client component because it uses hooks and interactivity

import React from "react";
import { useRouter } from "next/navigation";
// import {
//   Chart as ChartJS,
//   ArcElement,
//   Tooltip as ChartTip,
//   Legend,
//   BarElement,
//   CategoryScale,
//   LinearScale,
// } from "chart.js";
import { IoAddSharp } from "react-icons/io5";
// import {
//   Button,
//   Tooltip,
//   Cards,
//   Piechart,
//   Bargraph,
//   SmartTips,
//   ProgressBar,
//   LatestTransaction,
// } from "@/app/components"; // adjust path based on your folder structure

// Register chart.js components
// ChartJS.register(ArcElement, ChartTip, Legend);
// ChartJS.register(BarElement, CategoryScale, LinearScale, ChartTip, Legend);

const MainPage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col m-4">
  
   <h1 className="bg-red-500 text-3xl font-semibold">This is main page </h1>
    </div>
  );
};

export default MainPage;
