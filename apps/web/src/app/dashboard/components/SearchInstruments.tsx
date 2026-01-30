"use client";

import React, { useState, useEffect } from "react";
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/20/solid";
import { useAction, useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";

export default function SearchInstruments() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const searchInstruments = useAction(api.fetchMarketData.searchInstruments);
  const addInstruments = useMutation(api.instruments.addFromSearch);

  // Manual debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // Perform search when debounced query changes
  useEffect(() => {
    async function performSearch() {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const data = await searchInstruments({ query: debouncedQuery });
        setResults(data || []);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }

    performSearch();
  }, [debouncedQuery, searchInstruments]);

  const toggleSelection = (symbol: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(symbol)) {
      newSelected.delete(symbol);
    } else {
      newSelected.add(symbol);
    }
    setSelected(newSelected);
  };

  const handleAdd = async () => {
    const instrumentsToAdd = results.filter((r) => selected.has(r.symbol));
    if (instrumentsToAdd.length === 0) return;

    try {
      await addInstruments({ instruments: instrumentsToAdd });
      setQuery("");
      setResults([]);
      setSelected(new Set());
      alert(`Added ${instrumentsToAdd.length} instruments`);
    } catch (error) {
      console.error("Failed to add instruments:", error);
      alert("Failed to add instruments");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative rounded-md shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </div>
        <input
          type="text"
          className="block w-full rounded-md border-0 py-3 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          placeholder="Search for stocks, ETFs (e.g. AAPL, Reliance)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="mt-4 bg-white shadow rounded-md border border-gray-200 overflow-hidden">
          <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              {results.length} results found
            </span>
            {selected.size > 0 && (
              <button
                onClick={handleAdd}
                className="inline-flex items-center rounded bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add {selected.size} Selected
              </button>
            )}
          </div>
          <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {results.map((item) => (
              <li
                key={item.symbol}
                className="px-4 py-3 hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                onClick={() => toggleSelection(item.symbol)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selected.has(item.symbol)}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 pointer-events-none"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {item.symbol}
                    </p>
                    <p className="text-sm text-gray-500">{item.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                    {item.exchange}
                  </span>
                  <span className="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                    {item.type}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
