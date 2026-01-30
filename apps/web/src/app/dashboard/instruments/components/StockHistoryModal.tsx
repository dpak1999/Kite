"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface StockHistoryModalProps {
  stockId: Id<"stocks">;
  stockSymbol: string;
  stockName: string;
  onClose: () => void;
}

export default function StockHistoryModal({
  stockId,
  stockSymbol,
  stockName,
  onClose,
}: StockHistoryModalProps) {
  const historicalData = useQuery(api.stocks.getHistoricalData, { stockId });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {stockSymbol} - Historical Data
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
          ) : historicalData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No historical data available. Click "Fetch Historical" to load
              data.
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500 uppercase">
                    Latest Price
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    ₹{historicalData[0]?.price.toFixed(2)}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500 uppercase">
                    Data Points
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {historicalData.length}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500 uppercase">50 DMA</div>
                  <div className="text-lg font-semibold text-gray-900">
                    ₹{historicalData[0]?.dma50?.toFixed(2) || "-"}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500 uppercase">200 DMA</div>
                  <div className="text-lg font-semibold text-gray-900">
                    ₹{historicalData[0]?.dma200?.toFixed(2) || "-"}
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="py-2 px-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Price
                    </th>
                    <th className="py-2 px-3 text-right text-xs font-medium text-gray-500 uppercase">
                      50 DMA
                    </th>
                    <th className="py-2 px-3 text-right text-xs font-medium text-gray-500 uppercase">
                      200 DMA
                    </th>
                    <th className="py-2 px-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Volume
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {historicalData.map((point, index) => (
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
                      <td className="whitespace-nowrap py-2 px-3 text-sm text-right text-gray-500">
                        {point.dma50 ? `₹${point.dma50.toFixed(2)}` : "-"}
                      </td>
                      <td className="whitespace-nowrap py-2 px-3 text-sm text-right text-gray-500">
                        {point.dma200 ? `₹${point.dma200.toFixed(2)}` : "-"}
                      </td>
                      <td className="whitespace-nowrap py-2 px-3 text-sm text-right text-gray-500">
                        {point.volume ? point.volume.toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
