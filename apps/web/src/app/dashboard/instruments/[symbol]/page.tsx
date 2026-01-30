"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useAction } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { ArrowLeftIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function InstrumentDetailPage() {
  const params = useParams();
  const symbol = params.symbol as string;

  const [historyRange, setHistoryRange] = useState("1mo");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // We need to find the instrument ID first?
  // Ideally backend provides getBySymbol. If not, we list all and find.
  // Let's assume we can get prices by symbol or list instruments.
  // Prompt says: prices.getHistoryBySymbol({ symbol: string, limit?: number })

  const instruments = useQuery(api.instruments.list, {});
  const prices = useQuery(api.prices.getAllPrices);
  const history = useQuery(api.prices.getHistoryBySymbol, {
    symbol,
    limit: 100,
  });
  const refreshPrice = useAction(api.fetchMarketData.refreshPrice);
  const fetchHistory = useAction(api.fetchMarketData.fetchHistory);

  const instrument = instruments?.find((i) => i.symbol === symbol);
  const currentPrice = prices?.find((p) => p.symbol === symbol);

  const handleRefreshPrice = async () => {
    try {
      await refreshPrice({ symbol });
    } catch (e) {
      console.error(e);
    }
  };

  const handleFetchHistory = async () => {
    try {
      setIsLoadingHistory(true);
      await fetchHistory({ symbol, range: historyRange as any });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  if (!instrument && !instruments)
    return <div className="p-8">Loading instrument...</div>;
  if (!instrument && instruments)
    return <div className="p-8">Instrument not found</div>;

  const isPositive = (currentPrice?.change || 0) >= 0;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/instruments"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Instruments
        </Link>

        <div className="flex md:items-center justify-between flex-col md:flex-row gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {instrument?.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-semibold text-gray-700">
                {symbol}
              </span>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 uppercase">
                {instrument?.type}
              </span>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                {instrument?.exchange}
              </span>
            </div>
          </div>

          <div className="text-right">
            {currentPrice ? (
              <>
                <div className="text-4xl font-bold text-gray-900">
                  {currentPrice.price.toFixed(2)}
                </div>
                <div
                  className={`text-lg font-medium ${isPositive ? "text-green-600" : "text-red-500"}`}
                >
                  {isPositive ? "+" : ""}
                  {currentPrice.change?.toFixed(2)} (
                  {currentPrice.changePercent?.toFixed(2)}%)
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Updated:{" "}
                  {new Date(currentPrice.updatedAt).toLocaleTimeString()}
                </div>
              </>
            ) : (
              <span className="text-gray-500">Price unavailable</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 border-b border-gray-200 pb-4">
        <button
          onClick={handleRefreshPrice}
          className="inline-flex items-center rounded bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Refresh Price
        </button>
        <div className="flex items-center gap-2">
          <select
            value={historyRange}
            onChange={(e) => setHistoryRange(e.target.value)}
            className="block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          >
            <option value="1mo">1 Month</option>
            <option value="3mo">3 Months</option>
            <option value="6mo">6 Months</option>
            <option value="1y">1 Year</option>
          </select>
          <button
            onClick={handleFetchHistory}
            disabled={isLoadingHistory}
            className="inline-flex items-center rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-70"
          >
            {isLoadingHistory ? "Fetching..." : "Fetch History"}
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white shadow ring-1 ring-black ring-opacity-5 rounded-lg overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            Price History
          </h3>
        </div>
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
              >
                Open
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
              >
                High
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
              >
                Low
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
              >
                Close
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
              >
                Volume
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {history?.map((record: any, idx: number) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {new Date(record.date).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500">
                  {record.open.toFixed(2)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500">
                  {record.high.toFixed(2)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500">
                  {record.low.toFixed(2)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 font-medium">
                  {record.close.toFixed(2)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500">
                  {record.volume?.toLocaleString()}
                </td>
              </tr>
            ))}
            {(!history || history.length === 0) && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-500">
                  No history data available. Click "Fetch History" to load data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
