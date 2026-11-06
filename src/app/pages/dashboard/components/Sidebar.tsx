"use client";
import Link from "next/link";
import {
  MdCategory,
  MdLogout,
  MdDashboard,
  MdAccountBalance,
  MdPayment,
  MdNotifications,
} from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/app/features/common";
import { usePathname } from "next/navigation";

const Sidebar = ({
  onClose,
  onLogout,
}: {
  onClose?: () => void;
  onLogout?: () => void;
}) => {
  const pathname = usePathname();

  const handleLinkClick = () => {
    onClose?.();
  };

  const handleLogoutClick = () => {
    onClose?.();
    onLogout?.();
  };

  const sidebarLinks = [
    {
      href: "/dashboard/home",
      label: "Dashboard",
      icon: MdDashboard,
    },
    {
      href: "/dashboard/category",
      label: "Category",
      icon: MdCategory,
    },
    {
      href: "/dashboard/transaction",
      label: "Transaction",
      icon: MdPayment,
    },
    {
      href: "/dashboard/bill-reminders",
      label: "Set Alerts",
      icon: MdNotifications,
    },
    {
      href: "/dashboard/setting",
      label: "Setting",
      icon: IoMdSettings,
    },
  ];

  return (
    <div className="w-full max-w-96 h-full flex flex-col bg-background text-foreground overflow-x-hidden">
      {/* App Header */}
      <div className="flex items-center py-6 px-4 mb-4 border-b border-foreground">
        <div className="flex-1 flex items-center justify-center gap-1">
          <MdAccountBalance size={32} style={{ fill: "var(--foreground)" }} />
          <h2 className="text-2xl font-bold">BudgetBuddy</h2>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle size="icon-lg" />
          {onClose && (
            <Button
              size="icon"
              variant="ghost"
              className="cursor-pointer"
              onClick={onClose}
            >
              <X className="size-6" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          )}
        </div>
      </div>
      {/* Sidebar Navigation */}
      <div className="flex-1">
        <ul className="flex flex-col text-xl font-medium">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li
                key={link.href}
                className={`group flex items-center gap-2 cursor-pointer md:py-3 py-2 justify-center ${
                  isActive
                    ? "bg-foreground text-background"
                    : "hover:bg-sidebar-hover text-foreground"
                }`}
                onClick={handleLinkClick}
              >
                <Link
                  href={link.href}
                  className="flex items-center gap-2 text-base md:text-lg"
                >
                  <link.icon
                    size={28}
                    className={isActive ? "text-background" : "text-foreground"}
                  />
                  {link.label}
                </Link>
              </li>
            );
          })}
          <li
            className="group flex items-center gap-2 cursor-pointer md:py-3 py-2 justify-center hover:bg-sidebar-hover text-foreground"
            onClick={handleLogoutClick}
          >
            <button
              type="button"
              className="flex items-center gap-2 text-base md:text-lg"
            >
              <MdLogout size={28} className="text-foreground" />
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
