"use client";

import React, { useState } from "react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  CheckCircleIcon,
} from "@heroicons/react/20/solid";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";

interface StockSearchProps {
  onStockAdded?: () => void;
}

export default function StockSearch({ onStockAdded }: StockSearchProps) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromConvex, setIsFromConvex] = useState(false);

  // Get all saved stocks to check against
  const savedStocks = useQuery(api.stocks.list);

  const searchStocks = useAction(api.stockApi.searchStocks);
  const addStock = useMutation(api.stocks.add);

  const handleSearch = async () => {
    if (query.length < 2) return;

    setIsSearching(true);
    setError(null);
    setResult(null);
    setIsFromConvex(false);

    try {
      // First, check if stock exists in Convex (case-insensitive search)
      const normalizedQuery = query.toUpperCase().trim();
      const existingStock = savedStocks?.find(
        (stock) =>
          stock.symbol.toUpperCase() === normalizedQuery ||
          stock.companyName.toUpperCase().includes(normalizedQuery),
      );

      if (existingStock) {
        // Found in Convex - use cached data
        setResult({
          symbol: existingStock.symbol,
          companyName: existingStock.companyName,
          industry: existingStock.industry,
          exchange: existingStock.exchange,
          currentPrice: existingStock.currentPrice,
          percentChange: existingStock.percentChange,
          yearHigh: existingStock.yearHigh,
          yearLow: existingStock.yearLow,
          _id: existingStock._id, // Include ID to identify it's already saved
        });
        setIsFromConvex(true);
      } else {
        // Not in Convex - fetch from API
        const data = await searchStocks({ query });
        if (data) {
          setResult(data);
        } else {
          setError("No stock found with that name");
        }
      }
    } catch (err) {
      console.error("Search failed:", err);
      setError("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdd = async () => {
    if (!result) return;

    setIsAdding(true);
    try {
      await addStock({
        symbol: result.symbol,
        companyName: result.companyName,
        industry: result.industry || undefined,
        exchange: result.exchange,
        currentPrice: result.currentPrice || undefined,
        percentChange: result.percentChange || undefined,
        yearHigh: result.yearHigh || undefined,
        yearLow: result.yearLow || undefined,
      });
      setQuery("");
      setResult(null);
      onStockAdded?.();
    } catch (err) {
      console.error("Failed to add stock:", err);
      setError("Failed to add stock. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-2.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            placeholder="Search for stocks (e.g., Tata Steel, Reliance)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching || query.length < 2}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSearching ? "Searching..." : "Search"}
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {result.companyName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-gray-700">
                    {result.symbol}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {result.exchange}
                  </span>
                  {result.industry && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {result.industry}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                {result.currentPrice && (
                  <>
                    <div className="text-2xl font-bold text-gray-900">
                      ₹{result.currentPrice.toFixed(2)}
                    </div>
                    {result.percentChange !== null && (
                      <div
                        className={`text-sm font-medium ${result.percentChange >= 0 ? "text-green-600" : "text-red-500"}`}
                      >
                        {result.percentChange >= 0 ? "+" : ""}
                        {result.percentChange.toFixed(2)}%
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {(result.yearHigh || result.yearLow) && (
              <div className="mt-3 flex gap-4 text-sm text-gray-500">
                {result.yearHigh && <span>52W High: ₹{result.yearHigh}</span>}
                {result.yearLow && <span>52W Low: ₹{result.yearLow}</span>}
              </div>
            )}

            <div className="mt-4 flex items-center gap-3">
              {isFromConvex ? (
                <span className="inline-flex items-center rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                  Already in Watchlist
                </span>
              ) : (
                <button
                  onClick={handleAdd}
                  disabled={isAdding}
                  className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  {isAdding ? "Adding..." : "Add to Watchlist"}
                </button>
              )}
              {isFromConvex && (
                <span className="text-xs text-gray-500">
                  (Loaded from your watchlist)
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
