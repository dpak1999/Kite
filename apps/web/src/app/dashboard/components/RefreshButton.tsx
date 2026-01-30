"use client";

import React, { useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useAction } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";

export default function RefreshButton() {
  const refreshAll = useAction(api.fetchMarketData.refreshAllPrices);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      await refreshAll();
    } catch (error) {
      console.error("Failed to refresh prices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isLoading}
      className={`
        inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50
        ${isLoading ? "opacity-70 cursor-not-allowed" : ""}
      `}
    >
      <ArrowPathIcon
        className={`-ml-0.5 h-5 w-5 text-gray-400 ${isLoading ? "animate-spin" : ""}`}
        aria-hidden="true"
      />
      {isLoading ? "Refreshing..." : "Refresh Prices"}
    </button>
  );
}
