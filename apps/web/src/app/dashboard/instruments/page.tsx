"use client";

import React, { useState } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

export default function InstrumentsPage() {
  const [filter, setFilter] = useState<"all" | "stock" | "etf" | "mutualfund">(
    "all",
  );

  // TODO: Replace with actual data fetching once backend is restored
  const instruments: any[] = [];
  const prices: any[] = [];

  const handleDelete = async (id: any) => {
    if (confirm("Are you sure you want to remove this instrument?")) {
      // TODO: Implement delete when backend is available
      console.log("Delete instrument:", id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Instruments
          </h2>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0 gap-3">
          {/* RefreshButton removed - backend not available */}
          <Link
            href="/dashboard/instruments/add"
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
            Add Instruments
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {["all", "stock", "etf", "mutualfund"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab as any)}
              className={`
                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium capitalize
                ${
                  filter === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }
              `}
            >
              {tab === "mutualfund"
                ? "Mutual Funds"
                : tab === "etf"
                  ? "ETFs"
                  : tab === "all"
                    ? "All Instruments"
                    : "Stocks"}
            </button>
          ))}
        </nav>
      </div>

      {/* Custom Table with Delete Action */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              >
                Symbol
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Type
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
              >
                Price
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {instruments.map((instrument) => {
              const price = prices?.find(
                (p) => p.instrumentId === instrument._id,
              );
              return (
                <tr key={instrument._id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    <Link
                      href={`/dashboard/instruments/${instrument.symbol}`}
                      className="text-blue-600 hover:text-blue-900 font-bold"
                    >
                      {instrument.symbol}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {instrument.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">
                    {instrument.type}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 font-medium">
                    {price ? price.price.toFixed(2) : "-"}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button
                      onClick={() => handleDelete(instrument._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {instruments.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-500">
                  No instruments found. Backend not connected.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
