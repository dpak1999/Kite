"use client";

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import UserSync from "../components/UserSync";

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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
      <UserSync />
      <h1 className="text-4xl font-bold mb-4 text-gray-900">Welcome to Kite</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        Your premium financial dashboard for stocks and mutual funds.
      </p>

      {!isSignedIn ? (
        <div className="space-x-4">
          <SignInButton mode="modal">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
              Sign Up
            </button>
          </SignUpButton>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-sm w-full mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">Account</span>
              <UserButton />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-gray-900">
                Hello, {user?.firstName}
              </p>
              {wallet ? (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 uppercase tracking-wide font-bold">
                    Wallet Balance
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    ₹{wallet.balance.toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-400 mt-2">Loading wallet...</p>
              )}
            </div>
          </div>

          {/* Placeholder for future dashboard */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm">Portfolio</p>
              <p className="font-semibold">Coming Soon</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm">Watchlist</p>
              <p className="font-semibold">Coming Soon</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
