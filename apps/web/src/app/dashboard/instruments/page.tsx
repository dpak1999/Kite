"use client";

import React, { useState, useEffect } from "react";
import {
  TrashIcon,
  ArrowPathIcon,
  ClockIcon,
  ChartBarIcon,
} from "@heroicons/react/20/solid";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import StockSearch from "./components/StockSearch";
import MutualFundSearch from "./components/MutualFundSearch";
import StockHistoryModal from "./components/StockHistoryModal";
import MfHistoryModal from "./components/MfHistoryModal";

type TabType = "all" | "stocks" | "mutualFunds";

export default function InstrumentsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [fetchingHistorical, setFetchingHistorical] = useState(false);
  const [fetchingMfHistorical, setFetchingMfHistorical] = useState(false);
  const [fetchResult, setFetchResult] = useState<{
    total: number;
    success: number;
  } | null>(null);
  const [fetchMfResult, setFetchMfResult] = useState<{
    total: number;
    success: number;
  } | null>(null);
  const [selectedStockForHistory, setSelectedStockForHistory] = useState<{
    id: Id<"stocks">;
    symbol: string;
    name: string;
  } | null>(null);
  const [selectedMfForHistory, setSelectedMfForHistory] = useState<{
    id: Id<"mutualFunds">;
    schemeName: string;
  } | null>(null);

  // Ensure we only render dynamic content after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Queries
  const stocks = useQuery(api.stocks.list);
  const mutualFunds = useQuery(api.mutualFunds.list);

  // Mutations
  const removeStock = useMutation(api.stocks.remove);
  const removeMutualFund = useMutation(api.mutualFunds.remove);

  // Actions
  const fetchAllHistorical = useAction(api.stockApi.fetchAllHistoricalData);
  const fetchAllMfHistorical = useAction(api.mfApi.fetchAllMfHistoricalData);

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  const handleDeleteStock = async (id: any) => {
    if (confirm("Are you sure you want to remove this stock?")) {
      await removeStock({ id });
    }
  };

  const handleDeleteMutualFund = async (id: any) => {
    if (confirm("Are you sure you want to remove this mutual fund?")) {
      await removeMutualFund({ id });
    }
  };

  const handleFetchHistoricalData = async () => {
    setFetchingHistorical(true);
    setFetchResult(null);
    try {
      const result = await fetchAllHistorical();
      const successCount = result.results.filter((r) => r.success).length;
      setFetchResult({ total: result.total, success: successCount });
    } catch (error) {
      console.error("Failed to fetch historical data:", error);
    } finally {
      setFetchingHistorical(false);
    }
  };

  const handleFetchMfHistoricalData = async () => {
    setFetchingMfHistorical(true);
    setFetchMfResult(null);
    try {
      const result = await fetchAllMfHistorical();
      const successCount = result.results.filter((r) => r.success).length;
      setFetchMfResult({ total: result.total, success: successCount });
    } catch (error) {
      console.error("Failed to fetch MF historical data:", error);
    } finally {
      setFetchingMfHistorical(false);
    }
  };

  // Use 0 for counts during SSR to prevent hydration mismatch
  const stockCount = mounted ? stocks?.length || 0 : 0;
  const mfCount = mounted ? mutualFunds?.length || 0 : 0;
  const totalCount = stockCount + mfCount;

  // Count stocks without historical data
  const stocksWithoutHistory = mounted
    ? stocks?.filter((s) => !s.hasHistoricalData).length || 0
    : 0;

  // Count MFs without historical data
  const mfsWithoutHistory = mounted
    ? mutualFunds?.filter((mf) => !mf.hasHistoricalData).length || 0
    : 0;

  const tabs = [
    { id: "all" as TabType, name: "All", count: totalCount },
    { id: "stocks" as TabType, name: "Stocks", count: stockCount },
    { id: "mutualFunds" as TabType, name: "Mutual Funds", count: mfCount },
  ];

  const showStocks = activeTab === "all" || activeTab === "stocks";
  const showMutualFunds = activeTab === "all" || activeTab === "mutualFunds";

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Instruments
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Search and add stocks or mutual funds to your watchlist
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 md:ml-4 md:mt-0">
          {fetchResult && (
            <span className="text-sm text-green-600 self-center">
              Stocks: {fetchResult.success}/{fetchResult.total}
            </span>
          )}
          <button
            onClick={handleFetchHistoricalData}
            disabled={fetchingHistorical || stocksWithoutHistory === 0}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold shadow-sm ${
              fetchingHistorical || stocksWithoutHistory === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-500"
            }`}
          >
            {fetchingHistorical ? (
              <>
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <ClockIcon className="h-4 w-4" />
                Stocks ({stocksWithoutHistory})
              </>
            )}
          </button>
          {fetchMfResult && (
            <span className="text-sm text-green-600 self-center">
              MFs: {fetchMfResult.success}/{fetchMfResult.total}
            </span>
          )}
          <button
            onClick={handleFetchMfHistoricalData}
            disabled={fetchingMfHistorical || mfsWithoutHistory === 0}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold shadow-sm ${
              fetchingMfHistorical || mfsWithoutHistory === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-purple-600 text-white hover:bg-purple-500"
            }`}
          >
            {fetchingMfHistorical ? (
              <>
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <ClockIcon className="h-4 w-4" />
                MFs ({mfsWithoutHistory})
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2
                ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }
              `}
            >
              {tab.name}
              {tab.count > 0 && (
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    activeTab === tab.id
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Search Section - Show both when on All tab */}
      {activeTab === "all" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Search Stocks
            </h3>
            <StockSearch
              key={`stock-${refreshKey}`}
              onStockAdded={handleRefresh}
            />
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Search Mutual Funds
            </h3>
            <MutualFundSearch
              key={`mf-${refreshKey}`}
              onFundAdded={handleRefresh}
            />
          </div>
        </div>
      )}

      {activeTab === "stocks" && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Search Stocks
          </h3>
          <StockSearch
            key={`stock-${refreshKey}`}
            onStockAdded={handleRefresh}
          />
        </div>
      )}

      {activeTab === "mutualFunds" && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Search Mutual Funds
          </h3>
          <MutualFundSearch
            key={`mf-${refreshKey}`}
            onFundAdded={handleRefresh}
          />
        </div>
      )}

      {/* Stocks Table */}
      {showStocks && (
        <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">
              Your Stocks
            </h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:pl-6">
                  Symbol
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Industry
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change
                </th>
                <th className="relative py-3 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {stocks?.map((stock) => (
                <tr key={stock._id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-bold text-gray-900 sm:pl-6">
                    {stock.symbol}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {stock.companyName}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {stock.industry || "-"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium text-gray-900">
                    {stock.currentPrice
                      ? `₹${stock.currentPrice.toFixed(2)}`
                      : "-"}
                  </td>
                  <td
                    className={`whitespace-nowrap px-3 py-4 text-sm text-right font-medium ${(stock.percentChange || 0) >= 0 ? "text-green-600" : "text-red-500"}`}
                  >
                    {stock.percentChange !== undefined
                      ? `${stock.percentChange >= 0 ? "+" : ""}${stock.percentChange.toFixed(2)}%`
                      : "-"}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-2">
                    {stock.hasHistoricalData && (
                      <button
                        onClick={() =>
                          setSelectedStockForHistory({
                            id: stock._id,
                            symbol: stock.symbol,
                            name: stock.companyName,
                          })
                        }
                        className="text-blue-600 hover:text-blue-900"
                        title="View Historical Data"
                      >
                        <ChartBarIcon className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteStock(stock._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {(!stocks || stocks.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500">
                    No stocks added yet. Search and add stocks above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Mutual Funds Table */}
      {showMutualFunds && (
        <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">
              Your Mutual Funds
            </h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:pl-6">
                  Scheme Name
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NAV
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fund Size (Cr)
                </th>
                <th className="relative py-3 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {mutualFunds?.map((fund) => (
                <tr key={fund._id} className="hover:bg-gray-50">
                  <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="font-medium text-gray-900">
                      {fund.schemeName}
                    </div>
                    {fund.category && (
                      <div className="text-xs text-gray-500">
                        {fund.category}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {fund.schemeType || "-"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium text-gray-900">
                    {fund.currentNav ? `₹${fund.currentNav.toFixed(2)}` : "-"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500">
                    {fund.fundSize ? fund.fundSize.toLocaleString() : "-"}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button
                      onClick={() => handleDeleteMutualFund(fund._id)}
                      className="text-red-600 hover:text-red-900 ml-4"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                    {fund.hasHistoricalData ? (
                      <button
                        onClick={() =>
                          setSelectedMfForHistory({
                            id: fund._id,
                            schemeName: fund.schemeName,
                          })
                        }
                        className="text-blue-600 hover:text-blue-900 ml-4"
                        title="View Historical NAV"
                      >
                        <ChartBarIcon className="h-5 w-5" />
                      </button>
                    ) : (
                      <span
                        className="text-gray-300 ml-4"
                        title="No historical data"
                      >
                        <ChartBarIcon className="h-5 w-5" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {(!mutualFunds || mutualFunds.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">
                    No mutual funds added yet. Search and add funds above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Stock History Modal */}
      {selectedStockForHistory && (
        <StockHistoryModal
          stockId={selectedStockForHistory.id}
          stockSymbol={selectedStockForHistory.symbol}
          stockName={selectedStockForHistory.name}
          onClose={() => setSelectedStockForHistory(null)}
        />
      )}

      {/* MF History Modal */}
      {selectedMfForHistory && (
        <MfHistoryModal
          mutualFundId={selectedMfForHistory.id}
          schemeName={selectedMfForHistory.schemeName}
          onClose={() => setSelectedMfForHistory(null)}
        />
      )}
    </div>
  );
}
