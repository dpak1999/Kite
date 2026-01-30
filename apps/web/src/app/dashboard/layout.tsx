import React from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import {
  HomeIcon,
  ChartBarIcon,
  Squares2X2Icon,
  Cog6ToothIcon,
  BookOpenIcon,
  UsersIcon,
  WalletIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import DashboardClientWrapper from "./DashboardClientWrapper";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Users", href: "/dashboard/users", icon: UsersIcon },
  { name: "Holdings", href: "/dashboard/holdings", icon: WalletIcon },
  {
    name: "Transactions",
    href: "/dashboard/transactions",
    icon: BanknotesIcon,
  },
  { name: "Instruments", href: "/dashboard/instruments", icon: ChartBarIcon },
  { name: "Apps", href: "/dashboard/apps", icon: Squares2X2Icon },
  { name: "API Reference", href: "/dashboard/api", icon: BookOpenIcon },
  { name: "Settings", href: "/dashboard/settings", icon: Cog6ToothIcon },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="flex items-center justify-center h-16 border-b border-gray-200 px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#ff5722] flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="text-xl font-bold text-gray-900">Stocker</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <UserButton />
            <div className="text-sm">
              <p className="font-medium text-gray-700">Account</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
          <DashboardClientWrapper>{children}</DashboardClientWrapper>
        </main>
      </div>
    </div>
  );
}
