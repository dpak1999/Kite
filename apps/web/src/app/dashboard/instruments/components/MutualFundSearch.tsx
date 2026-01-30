"use client";

import React, { useState, useEffect } from "react";
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/20/solid";
import { useAction, useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";

interface MutualFundSearchProps {
  onFundAdded?: () => void;
}

export default function MutualFundSearch({
  onFundAdded,
}: MutualFundSearchProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchMutualFunds = useAction(api.stockApi.searchMutualFunds);
  const getMutualFundDetails = useAction(api.stockApi.getMutualFundDetails);
  const addMutualFund = useMutation(api.mutualFunds.add);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  // Perform search when debounced query changes
  useEffect(() => {
    async function performSearch() {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const data = await searchMutualFunds({ query: debouncedQuery });
        setResults(data || []);
      } catch (err) {
        console.error("Search failed:", err);
        setError("Search failed. Please try again.");
      } finally {
        setIsSearching(false);
      }
    }

    performSearch();
  }, [debouncedQuery, searchMutualFunds]);

  const handleAdd = async (fund: any) => {
    setAddingId(fund.schemeId);
    setError(null);

    try {
      // Try to get detailed info first
      let details = null;
      try {
        details = await getMutualFundDetails({ name: fund.schemeName });
      } catch (e) {
        console.log("Could not fetch details, using basic info");
      }

      await addMutualFund({
        schemeId: fund.schemeId,
        schemeName: fund.schemeName,
        isin: fund.isin || undefined,
        schemeType: fund.schemeType || undefined,
        categoryId: fund.categoryId || undefined,
        currentNav: details?.currentNav || undefined,
        fundSize: details?.fundSize || undefined,
        riskLevel: details?.riskLevel || undefined,
        category: details?.category || undefined,
        fundManager: details?.fundManager || undefined,
      });

      // Remove from results after adding
      setResults(results.filter((r) => r.schemeId !== fund.schemeId));
      onFundAdded?.();
    } catch (err) {
      console.error("Failed to add fund:", err);
      setError("Failed to add fund. Please try again.");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </div>
        <input
          type="text"
          className="block w-full rounded-md border-0 py-2.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          placeholder="Search for mutual funds (e.g., Parag Parikh, Axis)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">
              {results.length} fund{results.length !== 1 ? "s" : ""} found
            </span>
          </div>
          <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {results.map((fund) => (
              <li
                key={fund.schemeId}
                className="px-4 py-3 hover:bg-gray-50 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fund.schemeName}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {fund.schemeType}
                    </span>
                    {fund.isin && (
                      <span className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                        {fund.isin}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleAdd(fund)}
                  disabled={addingId === fund.schemeId}
                  className="inline-flex items-center rounded-md bg-green-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50 shrink-0"
                >
                  <PlusIcon className="h-3.5 w-3.5 mr-0.5" />
                  {addingId === fund.schemeId ? "Adding..." : "Add"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {debouncedQuery.length >= 2 && results.length === 0 && !isSearching && (
        <div className="text-center py-8 text-gray-500">
          No mutual funds found for "{debouncedQuery}"
        </div>
      )}
    </div>
  );
}
