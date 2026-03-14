"use client";

import { useState } from "react";
import Sidebar from "@/app/pages/dashboard/components/Sidebar";
import { IoMenu } from "react-icons/io5";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="h-screen w-full flex flex-col xl:flex-row overflow-hidden">
      {/* Header for small screens */}
      <div className="xl:hidden h-16 flex items-center px-4 sticky top-0 z-10 bg-background">
        <button onClick={() => setShowSidebar(true)}>
          <IoMenu size={24} className="text-foreground" />
        </button>
      </div>
      {/* Sidebar for large screens */}
      <div className="hidden xl:block fixed top-0 left-0 z-10 h-screen">
        <Sidebar />
      </div>
      {showSidebar && (
        <div className="fixed inset-0 z-50 flex">
          {/* Sidebar slides in from the left */}
          <div className="w-96 h-full">
            <Sidebar onClose={() => setShowSidebar(false)} />
          </div>

          {/* Transparent overlay to close sidebar when clicked outside */}
          <div
            className="flex-1 bg-opacity-40"
            onClick={() => setShowSidebar(false)}
          />
        </div>
      )}
      <div className="flex-1 overflow-y-auto xl:ml-96">{children}</div>
    </div>
  );
}