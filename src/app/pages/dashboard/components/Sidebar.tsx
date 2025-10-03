"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";

import { MdLogout, MdDashboard, MdOutlineRestore } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";

const Sidebar = () => {
  const pathname = usePathname(); // Current path for active styling

  const sidebarLinks = [
    { href: "/dashboard/home", label: "Dashboard", icon: <MdDashboard size={28} /> },
    { href: "/dashboard/report", label: "Reports", icon: <MdOutlineRestore size={28} /> },
    { href: "/dashboard/setting", label: "Setting", icon: <IoMdSettings size={28} /> },
    { href: "/dashboard/logout", label: "Logout", icon: <MdLogout size={28} /> },
  ];

  return (
    <div className="w-80 h-full flex flex-col bg-secondary">
      
      

      {/* Sidebar Navigation */}
      <div className="h-full">
        <ul className="flex flex-col text-xl font-medium">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li
                key={link.href}
                className={`flex items-center gap-2 cursor-pointer md:py-3 py-2 justify-center ${
                  isActive
                    ? "bg-indigo-500 text-white"
                    : "hover:bg-[#e2e8f0]"
                }`}
              >
                <Link href={link.href} className="flex items-center gap-2 text-base md:text-lg">
                  {link.icon}
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
