"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";

export default function TransactionsPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Get current admin user from Convex
  const convexUser = useQuery(
    api.users.getByClerkId,
    user?.id ? { clerkId: user.id } : "skip",
  );
  const adminId = convexUser?._id;

  // Pagination state
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch requests
  // usage: getAllRequests({ status: "pending", paginationOpts: { page, limit } })
  const requestsData = useQuery(api.addMoneyRequests.getAllRequests, {
    status: activeTab === "pending" ? "pending" : undefined,
    paginationOpts: { page, limit },
  });

  const approveRequest = useMutation(api.addMoneyRequests.approveRequest);
  const rejectRequest = useMutation(api.addMoneyRequests.rejectRequest);

  const handleApprove = async (requestId: Id<"addMoneyRequests">) => {
    if (!adminId) return;
    setProcessingId(requestId);
    try {
      await approveRequest({ requestId, adminId });
    } catch (error) {
      console.error("Failed to approve request:", error);
      alert("Failed to approve request");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: Id<"addMoneyRequests">) => {
    if (!adminId) return;
    if (!confirm("Are you sure you want to reject this request?")) return;

    setProcessingId(requestId);
    try {
      await rejectRequest({ requestId, adminId, reason: "Rejected by admin" });
    } catch (error) {
      console.error("Failed to reject request:", error);
      alert("Failed to reject request");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage add money requests and view transaction history
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-10 ${
                activeTab === "pending"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-900 hover:bg-gray-50"
              }`}
            >
              Pending
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`relative -ml-px inline-flex items-center rounded-r-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-10 ${
                activeTab === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-900 hover:bg-gray-50"
              }`}
            >
              All History
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {activeTab === "all" && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approver
                  </th>
                )}
                {activeTab === "pending" && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requestsData?.requests.map((request: any) => (
                <tr key={request._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {request.userName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {request.userEmail}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 font-semibold">
                      ₹{request.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {new Date(request.requestedAt).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        request.status === "pending"
                          ? "bg-yellow-50 text-yellow-800 ring-yellow-600/20"
                          : request.status === "approved"
                            ? "bg-green-50 text-green-700 ring-green-600/20"
                            : "bg-red-50 text-red-700 ring-red-600/20"
                      }`}
                    >
                      {request.status.charAt(0).toUpperCase() +
                        request.status.slice(1)}
                    </span>
                  </td>
                  {activeTab === "all" && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.approverName || "-"}
                    </td>
                  )}
                  {activeTab === "pending" && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {request.status === "pending" && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApprove(request._id)}
                            disabled={!!processingId || !adminId}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(request._id)}
                            disabled={!!processingId || !adminId}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {requestsData?.requests.length === 0 && (
                <tr>
                  <td
                    colSpan={activeTab === "pending" ? 5 : 5}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No {activeTab} requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
