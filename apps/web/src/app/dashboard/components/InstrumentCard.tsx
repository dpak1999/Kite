"use client";

import React from "react";

interface InstrumentCardProps {
  title: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export default function InstrumentCard({
  title,
  value,
  trend,
  trendValue,
}: InstrumentCardProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-gray-100">
      <dt className="truncate text-sm font-medium text-gray-500">{title}</dt>
      <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
        {value}
      </dd>
      {trend && trendValue && (
        <div
          className={`mt-2 flex items-baseline text-sm font-semibold ${
            trend === "up"
              ? "text-green-600"
              : trend === "down"
                ? "text-red-500"
                : "text-gray-500"
          }`}
        >
          {trend === "up" && "↑"}
          {trend === "down" && "↓"}
          <span className="ml-1">{trendValue}</span>
        </div>
      )}
    </div>
  );
}
