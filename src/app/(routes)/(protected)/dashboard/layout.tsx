"use client";

import { useState } from "react";
import Sidebar from "@/app/pages/dashboard/components/Sidebar";
import { IoMenu } from "react-icons/io5";
import { signOut } from "next-auth/react";
import { Confirmation } from "@/app/features/dialogs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleConfirmLogout = async () => {
    try {
      setLogoutLoading(true);
      await signOut({ callbackUrl: "/signin" });
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row overflow-hidden">
      {/* Header for small screens */}
      <div className="lg:hidden h-16 flex items-center px-4 sticky top-0 z-10 bg-background">
        <button
          type="button"
          aria-label="Open menu"
          className="min-h-11 min-w-11 flex items-center justify-center"
          onClick={() => setShowSidebar(true)}
        >
          <IoMenu size={24} className="text-foreground" />
        </button>
      </div>
      {/* Sidebar for large screens */}
      <div className="hidden lg:block fixed top-0 left-0 z-10 h-screen w-96">
        <Sidebar onLogout={() => setLogoutOpen(true)} />
      </div>
      {showSidebar && (
        <div className="fixed inset-0 z-50 flex overflow-x-hidden">
          {/* Sidebar slides in from the left */}
          <div className="w-full max-w-96 h-full shrink-0">
            <Sidebar
              onClose={() => setShowSidebar(false)}
              onLogout={() => setLogoutOpen(true)}
            />
          </div>

          {/* Transparent overlay to close sidebar when clicked outside */}
          <div
            className="flex-1 min-w-0 bg-black/40"
            onClick={() => setShowSidebar(false)}
          />
        </div>
      )}
      <div className="flex-1 overflow-y-auto overflow-x-hidden lg:ml-96">{children}</div>

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
