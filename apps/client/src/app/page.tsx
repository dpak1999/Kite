"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import UserSync from "../components/UserSync";
import LoginPage from "../components/LoginPage";
import Sidebar from "../components/Sidebar";

export default function Home() {
  const { isSignedIn, user } = useUser();

  const convexUser = useQuery(
    api.users.getByClerkId,
    user?.id ? { clerkId: user.id } : "skip",
  );
  const wallet = useQuery(
    api.wallets.getUserWallet,
    convexUser?._id ? { userId: convexUser._id } : "skip",
  );

  return (
    <>
      <UserSync />
      {!isSignedIn ? (
        <LoginPage />
      ) : (
        <div className="min-h-screen bg-gray-50">
          <Sidebar />
          <div className="pl-64">
            <main className="p-8">
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Dashboard
                    </h1>
                    <p className="text-gray-500">
                      Welcome back, {user?.firstName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Wallet Card */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-700">Funds</h3>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        Available
                      </span>
                    </div>
                    {wallet ? (
                      <div>
                        <p className="text-3xl font-bold text-gray-900">
                          ₹{wallet.balance.toLocaleString()}
                        </p>
                        <div className="mt-4 flex gap-2">
                          <button className="flex-1 bg-[#4caf50] text-white text-xs font-bold py-2 rounded hover:bg-[#43a047] transition">
                            ADD FUNDS
                          </button>
                          <button className="flex-1 bg-gray-100 text-gray-700 text-xs font-bold py-2 rounded hover:bg-gray-200 transition">
                            WITHDRAW
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="animate-pulse space-y-3">
                        <div className="h-8 bg-gray-100 rounded w-1/2"></div>
                        <div className="h-8 bg-gray-100 rounded w-full"></div>
                      </div>
                    )}
                  </div>

                  {/* Holdings Summary Placeholder */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-700 mb-4">
                      Holdings
                    </h3>
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                      <p>No holdings yet</p>
                    </div>
                  </div>

                  {/* Market Overview / Watchlist Placeholder */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-700 mb-4">
                      Market Overview
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">NIFTY 50</span>
                        <span className="font-mono font-medium text-[#4caf50]">
                          22,145.30
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">SENSEX</span>
                        <span className="font-mono font-medium text-[#f44336]">
                          72,831.50
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      )}
    </>
  );
}
