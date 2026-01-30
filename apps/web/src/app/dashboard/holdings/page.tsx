"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import Link from "next/link";
import {
  ChartBarIcon,
  CurrencyRupeeIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

export default function HoldingsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"stocks" | "mutualFunds">(
    "stocks",
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const summary = useQuery(api.holdings.getHoldingsSummary);
  const stockHoldings = useQuery(api.holdings.listStockHoldings, {});
  const mfHoldings = useQuery(api.holdings.listMutualFundHoldings, {});
  const users = useQuery(api.users.list);

  const stats = [
    {
      name: "Users with Holdings",
      value: mounted ? summary?.usersWithHoldings || 0 : 0,
      icon: UsersIcon,
    },
    {
      name: "Total Stock Holdings",
      value: mounted ? summary?.totalStockHoldings || 0 : 0,
      icon: ChartBarIcon,
    },
    {
      name: "Total MF Holdings",
      value: mounted ? summary?.totalMFHoldings || 0 : 0,
      icon: ChartBarIcon,
    },
    {
      name: "Total Invested",
      value: mounted
        ? `₹${((summary?.totalInvested || 0) / 100000).toFixed(2)}L`
        : "₹0",
      icon: CurrencyRupeeIcon,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            User Holdings
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View and manage user portfolios
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg border border-gray-200"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Users with Holdings */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">
            Users Portfolio
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {users?.map((user) => {
            const userStocks =
              stockHoldings?.filter((h) => h.userId === user._id) || [];
            const userMFs =
              mfHoldings?.filter((h) => h.userId === user._id) || [];
            const totalStockValue = userStocks.reduce(
              (sum, h) => sum + h.totalInvested,
              0,
            );
            const totalMFValue = userMFs.reduce(
              (sum, h) => sum + h.totalInvested,
              0,
            );
            const totalValue = totalStockValue + totalMFValue;

            return (
              <Link
                key={user._id}
                href={`/dashboard/holdings/${user._id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  {user.imageUrl ? (
                    <img
                      className="h-10 w-10 rounded-full"
                      src={user.imageUrl}
                      alt=""
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 font-medium text-sm">
                        {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="ml-4">
                    <div className="font-medium text-gray-900">
                      {user.firstName || user.lastName
                        ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                        : user.email}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {userStocks.length} Stocks • {userMFs.length} MFs
                  </div>
                  <div className="text-sm text-gray-500">
                    ₹{totalValue.toLocaleString()}
                  </div>
                </div>
              </Link>
            );
          })}
          {(!users || users.length === 0) && (
            <div className="p-8 text-center text-gray-500">
              No users yet. Users will appear here once they sign in.
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("stocks")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === "stocks"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Stock Holdings ({stockHoldings?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("mutualFunds")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === "mutualFunds"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            MF Holdings ({mfHoldings?.length || 0})
          </button>
        </nav>
      </div>

      {/* Holdings Tables */}
      {activeTab === "stocks" && (
        <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase sm:pl-6">
                  User
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stock
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Qty
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Avg Price
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Invested
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {stockHoldings?.map((holding) => (
                <tr key={holding._id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="flex items-center">
                      {holding.user?.imageUrl ? (
                        <img
                          className="h-8 w-8 rounded-full"
                          src={holding.user.imageUrl}
                          alt=""
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                          {holding.user?.firstName?.[0] ||
                            holding.user?.email?.[0] ||
                            "?"}
                        </div>
                      )}
                      <span className="ml-2 text-gray-900">
                        {holding.user?.firstName || holding.user?.email}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="font-medium text-gray-900">
                      {holding.stock?.symbol}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {holding.stock?.companyName}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                    {holding.quantity}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                    ₹{holding.avgBuyPrice?.toFixed(2) || 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium text-gray-900">
                    ₹{holding.totalInvested?.toLocaleString() || 'N/A'}
                  </td>
                </tr>
              ))}
              {(!stockHoldings || stockHoldings.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">
                    No stock holdings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "mutualFunds" && (
        <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase sm:pl-6">
                  User
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Mutual Fund
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Units
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Avg NAV
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Invested
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {mfHoldings?.map((holding) => (
                <tr key={holding._id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="flex items-center">
                      {holding.user?.imageUrl ? (
                        <img
                          className="h-8 w-8 rounded-full"
                          src={holding.user.imageUrl}
                          alt=""
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                          {holding.user?.firstName?.[0] ||
                            holding.user?.email?.[0] ||
                            "?"}
                        </div>
                      )}
                      <span className="ml-2 text-gray-900">
                        {holding.user?.firstName || holding.user?.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm">
                    <div className="font-medium text-gray-900 max-w-xs truncate">
                      {holding.mutualFund?.schemeName}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                    {holding.units?.toFixed(3) || 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                    ₹{holding.avgNav?.toFixed(2) || 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium text-gray-900">
                    ₹{holding.totalInvested?.toLocaleString() || 'N/A'}
                  </td>
                </tr>
              ))}
              {(!mfHoldings || mfHoldings.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">
                    No mutual fund holdings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
