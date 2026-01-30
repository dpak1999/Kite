"use client";

import { UserButton, useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import Link from "next/link";

export default function Dashboard() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-bold text-primary">
                Kite Admin
              </Link>
              <div className="hidden md:flex gap-6">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-900"
                >
                  Dashboard
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.primaryEmailAddress?.emailAddress}
              </span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName || "Admin"}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Getting Started
            </h3>
            <p className="text-gray-600 text-sm">
              Your admin dashboard is ready. Add your Convex queries and
              mutations to start building features.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Authentication
            </h3>
            <p className="text-gray-600 text-sm">
              Clerk authentication is configured. Users can sign up with
              email/password.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Real-time Data
            </h3>
            <p className="text-gray-600 text-sm">
              Convex provides real-time data synchronization. Define your schema
              and queries in packages/backend/convex/.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
