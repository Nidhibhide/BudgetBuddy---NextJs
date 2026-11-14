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
  showThemeToggle = true,
}: {
  onClose?: () => void;
  onLogout?: () => void;
  showThemeToggle?: boolean;
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
    <div className="w-full h-full flex flex-col bg-shell text-shell-foreground border-r border-white/10 overflow-x-hidden">
      <div className="flex items-center py-5 px-4 mb-2 border-b border-white/10 gap-2">
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <MdAccountBalance
            size={28}
            className="text-shell-foreground shrink-0"
          />
          <h2 className="text-xl font-bold text-shell-foreground whitespace-nowrap">
            BudgetBuddy
          </h2>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {showThemeToggle && <ThemeToggle size="icon" />}
          {onClose && (
            <Button
              size="icon"
              variant="ghost"
              className="cursor-pointer text-shell-foreground hover:bg-shell-hover hover:text-shell-foreground"
              onClick={onClose}
            >
              <X className="size-5" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 px-2">
        <ul className="flex flex-col gap-1 font-medium">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-base transition-colors ${
                    isActive
                      ? "bg-shell-selected text-shell-foreground border-l-4 border-white"
                      : "text-shell-foreground/90 hover:bg-shell-hover border-l-4 border-transparent"
                  }`}
                >
                  <link.icon size={22} className="text-shell-foreground" />
                  {link.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-base text-shell-foreground/90 hover:bg-shell-hover border-l-4 border-transparent transition-colors cursor-pointer"
            >
              <MdLogout size={22} className="text-shell-foreground" />
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
