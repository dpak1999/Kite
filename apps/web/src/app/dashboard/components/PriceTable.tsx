"use client";

import React from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

export type PriceData = {
  _id: string;
  instrumentId: string;
  symbol: string;
  price: number;
  change?: number;
  changePercent?: number;
  updatedAt: number;
  instrument?: {
    name: string;
    type: string;
  };
};

interface PriceTableProps {
  prices: PriceData[] | undefined;
}

export default function PriceTable({ prices }: PriceTableProps) {
  if (!prices) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded w-full"></div>
        ))}
      </div>
    );
  }

  if (prices.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No instruments found. Add some to get started.
      </div>
    );
  }

  return (
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
              className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
            >
              Price
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
            >
              Change
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
            >
              % Change
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {prices.map((price) => {
            const isPositive = (price.change || 0) >= 0;
            return (
              <tr
                key={price._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  <Link
                    href={`/dashboard/instruments/${price.symbol}`}
                    className="hover:text-blue-600"
                  >
                    <div className="font-bold text-gray-800">
                      {price.symbol}
                    </div>
                    <div className="text-xs text-gray-500 font-normal">
                      {price.instrument?.name || "Unknown"}
                    </div>
                  </Link>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 font-medium">
                  {price.price?.toFixed(2)}
                </td>
                <td
                  className={`whitespace-nowrap px-3 py-4 text-sm text-right font-medium ${isPositive ? "text-green-600" : "text-red-500"}`}
                >
                  {isPositive ? "+" : ""}
                  {price.change?.toFixed(2) || "0.00"}
                </td>
                <td
                  className={`whitespace-nowrap px-3 py-4 text-sm text-right font-medium ${isPositive ? "text-green-600" : "text-red-500"}`}
                >
                  <div className="flex items-center justify-end gap-1">
                    {isPositive ? (
                      <ArrowUpIcon className="h-3 w-3" />
                    ) : (
                      <ArrowDownIcon className="h-3 w-3" />
                    )}
                    {price.changePercent?.toFixed(2) || "0.00"}%
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
