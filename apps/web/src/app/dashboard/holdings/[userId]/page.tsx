"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function UserHoldingsPage() {
  const params = useParams();
  const userId = params.userId as Id<"users">;

  const [mounted, setMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState<"stock" | "mf" | null>(null);
  const [editingStock, setEditingStock] = useState<any>(null);
  const [editingMF, setEditingMF] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const users = useQuery(api.users.list);
  const user = users?.find((u) => u._id === userId);
  const portfolio = useQuery(api.holdings.getUserPortfolio, { userId });
  const availableStocks = useQuery(api.stocks.list);
  const availableMFs = useQuery(api.mutualFunds.list);

  const addStockHolding = useMutation(api.holdings.addStockHolding);
  const updateStockHolding = useMutation(api.holdings.updateStockHolding);
  const removeStockHolding = useMutation(api.holdings.removeStockHolding);
  const addMFHolding = useMutation(api.holdings.addMutualFundHolding);
  const updateMFHolding = useMutation(api.holdings.updateMutualFundHolding);
  const removeMFHolding = useMutation(api.holdings.removeMutualFundHolding);

  // Form states
  const [formStock, setFormStock] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formQty, setFormQty] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formMF, setFormMF] = useState("");
  const [formMFDate, setFormMFDate] = useState("");
  const [formUnits, setFormUnits] = useState("");
  const [formNav, setFormNav] = useState("");

  // Fetch historical data for the selected stock
  const selectedStockHistoricalData = useQuery(
    api.stocks.getHistoricalData,
    formStock ? { stockId: formStock as Id<"stocks"> } : "skip",
  );

  // Fetch historical data for the selected mutual fund
  const selectedMFHistoricalData = useQuery(
    api.mutualFunds.getHistoricalData,
    formMF ? { mutualFundId: formMF as Id<"mutualFunds"> } : "skip",
  );

  // When date is selected for stock, auto-fill price
  const handleDateChange = (date: string) => {
    setFormDate(date);
    if (date && selectedStockHistoricalData?.data) {
      const point = selectedStockHistoricalData.data.find(
        (p) => p.date === date,
      );
      if (point) {
        setFormPrice(point.price.toFixed(2));
      }
    }
  };

  // When date is selected for MF, auto-fill NAV
  const handleMFDateChange = (date: string) => {
    setFormMFDate(date);
    if (date && selectedMFHistoricalData?.data) {
      const point = selectedMFHistoricalData.data.find((p) => p.date === date);
      if (point) {
        setFormNav(point.nav.toFixed(4));
      }
    }
  };

  // Reset form when stock changes
  const handleStockChange = (stockId: string) => {
    setFormStock(stockId);
    setFormDate("");
    setFormPrice("");
  };

  // Reset form when MF changes
  const handleMFChange = (mfId: string) => {
    setFormMF(mfId);
    setFormMFDate("");
    setFormNav("");
  };
  const handleAddStock = async () => {
    if (!formStock || !formQty || !formPrice) return;
    await addStockHolding({
      userId,
      stockId: formStock as Id<"stocks">,
      quantity: parseFloat(formQty),
      avgBuyPrice: parseFloat(formPrice),
    });
    setShowAddModal(null);
    setFormStock("");
    setFormQty("");
    setFormPrice("");
  };

  const handleUpdateStock = async () => {
    if (!editingStock || !formQty || !formPrice) return;
    await updateStockHolding({
      id: editingStock._id,
      quantity: parseFloat(formQty),
      avgBuyPrice: parseFloat(formPrice),
    });
    setEditingStock(null);
    setFormQty("");
    setFormPrice("");
  };

  const handleDeleteStock = async (id: Id<"userStockHoldings">) => {
    if (confirm("Remove this stock holding?")) {
      await removeStockHolding({ id });
    }
  };

  const handleAddMF = async () => {
    if (!formMF || !formUnits || !formNav) return;
    await addMFHolding({
      userId,
      mutualFundId: formMF as Id<"mutualFunds">,
      units: parseFloat(formUnits),
      avgNav: parseFloat(formNav),
    });
    setShowAddModal(null);
    setFormMF("");
    setFormUnits("");
    setFormNav("");
  };

  const handleUpdateMF = async () => {
    if (!editingMF || !formUnits || !formNav) return;
    await updateMFHolding({
      id: editingMF._id,
      units: parseFloat(formUnits),
      avgNav: parseFloat(formNav),
    });
    setEditingMF(null);
    setFormUnits("");
    setFormNav("");
  };

  const handleDeleteMF = async (id: Id<"userMutualFundHoldings">) => {
    if (confirm("Remove this mutual fund holding?")) {
      await removeMFHolding({ id });
    }
  };

  const totalStockValue =
    portfolio?.stocks.reduce((sum, h) => sum + h.totalInvested, 0) || 0;
  const totalMFValue =
    portfolio?.mutualFunds.reduce((sum, h) => sum + h.totalInvested, 0) || 0;

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/holdings"
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex items-center gap-4">
          {user?.imageUrl ? (
            <img
              className="h-12 w-12 rounded-full"
              src={user.imageUrl}
              alt=""
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 font-medium">
                {(
                  user?.firstName?.[0] ||
                  user?.email?.[0] ||
                  "?"
                ).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {user?.firstName || user?.lastName
                ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                : user?.email}
            </h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-500">Stocks Value</div>
          <div className="text-xl font-bold text-gray-900">
            ₹{totalStockValue.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">
            {portfolio?.stocks.length || 0} holdings
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-500">Mutual Funds Value</div>
          <div className="text-xl font-bold text-gray-900">
            ₹{totalMFValue.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">
            {portfolio?.mutualFunds.length || 0} holdings
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-500">Total Portfolio</div>
          <div className="text-xl font-bold text-blue-600">
            ₹{(totalStockValue + totalMFValue).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Stock Holdings */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-base font-semibold text-gray-900">
            Stock Holdings
          </h3>
          <button
            onClick={() => setShowAddModal("stock")}
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" /> Add Stock
          </button>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase sm:pl-6">
                Stock
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Qty
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Avg Price
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Invested
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {portfolio?.stocks.map((h) => (
              <tr key={h._id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                  <div className="font-medium text-gray-900">
                    {h.stock?.symbol}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {h.stock?.companyName}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                  {h.quantity}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                  ₹{h.avgBuyPrice.toFixed(2)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium text-gray-900">
                  ₹{h.totalInvested.toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                  <button
                    onClick={() => {
                      setEditingStock(h);
                      setFormQty(h.quantity.toString());
                      setFormPrice(h.avgBuyPrice.toString());
                    }}
                    className="text-blue-600 hover:text-blue-500 mr-3"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteStock(h._id)}
                    className="text-red-600 hover:text-red-500"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {(!portfolio?.stocks || portfolio.stocks.length === 0) && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  No stock holdings. Click "Add Stock" to add.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mutual Fund Holdings */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-base font-semibold text-gray-900">
            Mutual Fund Holdings
          </h3>
          <button
            onClick={() => setShowAddModal("mf")}
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" /> Add Mutual Fund
          </button>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase sm:pl-6">
                Scheme
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Units
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Avg NAV
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Invested
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {portfolio?.mutualFunds.map((h) => (
              <tr key={h._id} className="hover:bg-gray-50">
                <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                  <div className="font-medium text-gray-900 max-w-xs truncate">
                    {h.mutualFund?.schemeName}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                  {h.units.toFixed(3)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                  ₹{h.avgNav.toFixed(2)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium text-gray-900">
                  ₹{h.totalInvested.toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                  <button
                    onClick={() => {
                      setEditingMF(h);
                      setFormUnits(h.units.toString());
                      setFormNav(h.avgNav.toString());
                    }}
                    className="text-blue-600 hover:text-blue-500 mr-3"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMF(h._id)}
                    className="text-red-600 hover:text-red-500"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {(!portfolio?.mutualFunds ||
              portfolio.mutualFunds.length === 0) && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  No mutual fund holdings. Click "Add Mutual Fund" to add.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Stock Modal */}
      {showAddModal === "stock" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Stock Holding</h3>
              <button onClick={() => setShowAddModal(null)}>
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Stock
                </label>
                <select
                  value={formStock}
                  onChange={(e) => handleStockChange(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a stock...</option>
                  {availableStocks?.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.symbol} - {s.companyName}
                    </option>
                  ))}
                </select>
              </div>
              {formStock &&
                selectedStockHistoricalData &&
                selectedStockHistoricalData.total > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Purchase Date (optional)
                    </label>
                    <select
                      value={formDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full p-2.5 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">
                        Select date to auto-fill price...
                      </option>
                      {selectedStockHistoricalData.data.map((point) => (
                        <option key={point._id} value={point.date}>
                          {point.date} - ₹{point.price.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={formQty}
                  onChange={(e) => setFormQty(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter quantity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Average Buy Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formPrice}
                  readOnly
                  className="w-full p-2.5 rounded-md border border-gray-300 shadow-sm bg-gray-50 text-gray-700 cursor-not-allowed"
                  placeholder="Select date above to set price"
                />
              </div>
              <button
                onClick={handleAddStock}
                className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-500"
              >
                Add Holding
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add MF Modal */}
      {showAddModal === "mf" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Mutual Fund Holding</h3>
              <button onClick={() => setShowAddModal(null)}>
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Mutual Fund
                </label>
                <select
                  value={formMF}
                  onChange={(e) => handleMFChange(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a fund...</option>
                  {availableMFs?.map((mf) => (
                    <option key={mf._id} value={mf._id}>
                      {mf.schemeName}
                    </option>
                  ))}
                </select>
              </div>
              {formMF &&
                selectedMFHistoricalData &&
                selectedMFHistoricalData.total > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Purchase Date (optional)
                    </label>
                    <select
                      value={formMFDate}
                      onChange={(e) => handleMFDateChange(e.target.value)}
                      className="w-full p-2.5 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select date to auto-fill NAV...</option>
                      {selectedMFHistoricalData.data.map((point) => (
                        <option key={point._id} value={point.date}>
                          {point.date} - ₹{point.nav.toFixed(4)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Units
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formUnits}
                  onChange={(e) => setFormUnits(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter units"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Average NAV (₹)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formNav}
                  readOnly
                  className="w-full p-2.5 rounded-md border border-gray-300 shadow-sm bg-gray-50 text-gray-700 cursor-not-allowed"
                  placeholder="Select date above to set NAV"
                />
              </div>
              <button
                onClick={handleAddMF}
                className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-500"
              >
                Add Holding
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Stock Modal */}
      {editingStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Edit {editingStock.stock?.symbol}
              </h3>
              <button onClick={() => setEditingStock(null)}>
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={formQty}
                  onChange={(e) => setFormQty(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Average Buy Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleUpdateStock}
                className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-500"
              >
                Update Holding
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit MF Modal */}
      {editingMF && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Mutual Fund</h3>
              <button onClick={() => setEditingMF(null)}>
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Units
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formUnits}
                  onChange={(e) => setFormUnits(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Average NAV (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formNav}
                  onChange={(e) => setFormNav(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleUpdateMF}
                className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-500"
              >
                Update Holding
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
