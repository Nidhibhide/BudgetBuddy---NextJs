"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/app/pages/dashboard/components/Sidebar";
import { IoMenu } from "react-icons/io5";
import { signOut } from "next-auth/react";
import { Confirmation } from "@/app/features/dialogs";
import { ThemeToggle } from "@/app/features/common";

const pageTitles: Record<string, string> = {
  "/dashboard/home": "Dashboard",
  "/dashboard/category": "Category",
  "/dashboard/transaction": "Transaction",
  "/dashboard/bill-reminders": "Set Alerts",
  "/dashboard/setting": "Setting",
  "/dashboard/logout": "Logout",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showSidebar, setShowSidebar] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const pageTitle = pageTitles[pathname] || "BudgetBuddy";

  const handleConfirmLogout = async () => {
    try {
      setLogoutLoading(true);
      await signOut({ callbackUrl: "/signin" });
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-background text-foreground">
      <div className="lg:hidden h-16 flex items-center justify-between gap-3 px-4 sticky top-0 z-10 bg-shell text-shell-foreground border-b border-white/10">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            aria-label="Open menu"
            className="min-h-11 min-w-11 flex items-center justify-center shrink-0"
            onClick={() => setShowSidebar(true)}
          >
            <IoMenu size={24} className="text-shell-foreground" />
          </button>
          <span className="font-semibold text-lg truncate text-shell-foreground">
            {pageTitle}
          </span>
        </div>
        <ThemeToggle size="icon" />
      </div>

      <div className="hidden lg:block fixed top-0 left-0 z-10 h-screen w-64">
        <Sidebar onLogout={() => setLogoutOpen(true)} />
      </div>

      {showSidebar && (
        <div className="fixed inset-0 z-50 flex overflow-x-hidden">
          <div className="w-full max-w-64 h-full shrink-0 shadow-xl">
            <Sidebar
              onClose={() => setShowSidebar(false)}
              onLogout={() => setLogoutOpen(true)}
              showThemeToggle={false}
            />
          </div>
          <div
            className="flex-1 min-w-0 bg-black/40"
            onClick={() => setShowSidebar(false)}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto overflow-x-hidden lg:ml-64">
        {children}
      </div>

      <Confirmation
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        onConfirm={handleConfirmLogout}
        title="Logout"
        description="Are you sure you want to logout?"
        loading={logoutLoading}
        confirmLabel="Logout"
      />
    </div>
  );
}
