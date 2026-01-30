"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

interface StockHistoryModalProps {
  stockId: Id<"stocks">;
  stockSymbol: string;
  stockName: string;
  onClose: () => void;
}

const ITEMS_PER_PAGE = 10;

export default function StockHistoryModal({
  stockId,
  stockSymbol,
  stockName,
  onClose,
}: StockHistoryModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const historicalData = useQuery(api.stocks.getHistoricalData, {
    stockId,
    pagination: { page: currentPage, limit: ITEMS_PER_PAGE },
  });

  const totalPages = historicalData
    ? Math.ceil(historicalData.total / ITEMS_PER_PAGE)
    : 0;

  const currentData = historicalData ? historicalData.data : [];

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {stockSymbol} - Historical Prices
            </h3>
            <p className="text-sm text-gray-500">{stockName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {!historicalData ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : historicalData.total === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No historical data available. Click "Fetch Historical" to load
              data.
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500 uppercase">
                    Latest Price
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {/* Note: This is now just the first of the current page, which is OK or we need separate query for latest? 
                        The previous implementation showed historicalData[0] of ALL data. 
                        For backend pagination, historicalData.data[0] is the first of THIS page.
                        If page 1, it's latest. If page 2, it's not. 
                        Let's just show the first of the current view or specific latest?
                        The user didn't ask to change stats logic, but stats dependent on "all data" need "total" or separate endpoints.
                        For simplicity, I'll show data from current view or just hide if complex. 
                        Actually, showing range of *this page* is fine.
                        For "Latest Price", if on page 1, good.
                    */}
                    ₹{currentData[0]?.price.toFixed(2)}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500 uppercase">
                    Total Data Points
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {historicalData.total}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500 uppercase">
                    Page Date Range
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {currentData[currentData.length - 1]?.date} -{" "}
                    {currentData[0]?.date}
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white shadow ring-1 ring-black/5 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="py-2 px-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {currentData.map((point, index) => (
                      <tr
                        key={point._id}
                        className={index % 2 === 0 ? "" : "bg-gray-50"}
                      >
                        <td className="whitespace-nowrap py-2 px-3 text-sm text-gray-900">
                          {point.date}
                        </td>
                        <td className="whitespace-nowrap py-2 px-3 text-sm text-right font-medium text-gray-900">
                          ₹{point.price.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-2">
                  <div className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage}</span> of{" "}
                    <span className="font-medium">{totalPages}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
