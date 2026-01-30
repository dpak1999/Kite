"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";

export default function UsersPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const users = useQuery(api.users.list);

  const userCount = mounted ? users?.length || 0 : 0;

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Users
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            All users who have signed up on your app
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <span className="inline-flex items-center rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
            {userCount} Total Users
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:pl-6">
                User
              </th>
              <th className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Signed Up
              </th>
              <th className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {users?.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                  <div className="flex items-center">
                    {user.imageUrl ? (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={user.imageUrl}
                        alt=""
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 font-medium text-sm">
                          {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">
                        {user.firstName || user.lastName
                          ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                          : "No name"}
                      </div>
                      <div className="text-gray-500 text-xs">
                        ID: {user.clerkId.slice(0, 12)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleString()
                    : "-"}
                </td>
              </tr>
            ))}
            {(!users || users.length === 0) && (
              <tr>
                <td colSpan={4} className="py-10 text-center text-gray-500">
                  No users yet. Users will appear here once they sign in.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
