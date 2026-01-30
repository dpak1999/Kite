"use client";

import React, { useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export default function RefreshButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    // TODO: Implement when backend is available
    setIsLoading(true);
    console.log("Refresh prices - backend not connected");
    setTimeout(() => setIsLoading(false), 1000);
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
