"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  HomeIcon,
  BanknotesIcon,
  ShoppingBagIcon,
  ChartPieIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

const navigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Orders", href: "/orders", icon: ShoppingBagIcon },
  { name: "Holdings", href: "/holdings", icon: ChartPieIcon },
  { name: "Funds", href: "/funds", icon: BanknotesIcon },
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo / Brand */}
      <div className="flex items-center h-16 border-b border-gray-200 px-6">
        <div className="flex items-center gap-3">
          {/* Kite Logo Replica (Triangle) Small */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 50 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M25 5L45 40H5L25 5Z" fill="#ff5722" />
          </svg>
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            Kite
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-[#fff1ec] text-[#ff5722]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <item.icon
                  className={clsx(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive
                      ? "text-[#ff5722]"
                      : "text-gray-400 group-hover:text-gray-500",
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3 px-2">
          <UserButton afterSignOutUrl="/" />
          <div className="text-sm">
            <p className="font-medium text-gray-700">My Account</p>
          </div>
        </div>
      </div>
    </div>
  );
}
