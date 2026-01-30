import React from "react";
import SearchInstruments from "../../components/SearchInstruments";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function AddInstrumentPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Link
          href="/dashboard/instruments"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Instruments
        </Link>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Add Instruments
        </h2>
        <p className="mt-2 text-lg text-gray-600">
          Search for stocks, ETFs, and mutual funds to add to your dashboard.
        </p>
      </div>

      <div className="bg-white px-6 py-8 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <SearchInstruments />
      </div>
    </div>
  );
}
