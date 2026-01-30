import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Get user's add money requests with pagination
 */
export const getUserRequests = query({
  args: {
    userId: v.id("users"),
    paginationOpts: v.object({
      page: v.number(),
      limit: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const { page, limit } = args.paginationOpts;
    const skip = (page - 1) * limit;

    const requests = await ctx.db
      .query("addMoneyRequests")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    const total = requests.length;
    const paginatedRequests = requests.slice(skip, skip + limit);

    // Enrich with approver details if available
    const enrichedRequests = await Promise.all(
      paginatedRequests.map(async (request) => {
        if (request.approvedBy) {
          const approver = await ctx.db.get(request.approvedBy);
          return {
            ...request,
            approverName: approver
              ? `${approver.firstName || ""} ${approver.lastName || ""}`.trim()
              : "Admin",
          };
        }
        return request;
      })
    );

    return {
      requests: enrichedRequests,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },
});

/**
 * Get pending requests (for admin dashboard)
 */
export const getPendingRequests = query({
  args: {
    paginationOpts: v.object({
      page: v.number(),
      limit: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const { page, limit } = args.paginationOpts;
    const skip = (page - 1) * limit;

    const pendingRequests = await ctx.db
      .query("addMoneyRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();

    const total = pendingRequests.length;
    const paginatedRequests = pendingRequests.slice(skip, skip + limit);

    // Enrich with user details
    const enrichedRequests = await Promise.all(
      paginatedRequests.map(async (request) => {
        const user = await ctx.db.get(request.userId);
        return {
          ...request,
          userName: user
            ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
            : "Unknown User",
          userEmail: user?.email || "",
        };
      })
    );

    return {
      requests: enrichedRequests,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },
});

/**
 * Get all requests with status filter (for admin dashboard)
 */
export const getAllRequests = query({
  args: {
    status: v.optional(
      v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))
    ),
    paginationOpts: v.object({
      page: v.number(),
      limit: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const { page, limit } = args.paginationOpts;
    const skip = (page - 1) * limit;

    let requests;
    if (args.status) {
      requests = await ctx.db
        .query("addMoneyRequests")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else {
      requests = await ctx.db
        .query("addMoneyRequests")
        .withIndex("by_requestedAt")
        .order("desc")
        .collect();
    }

    const total = requests.length;
    const paginatedRequests = requests.slice(skip, skip + limit);

    // Enrich with user and approver details
    const enrichedRequests = await Promise.all(
      paginatedRequests.map(async (request) => {
        const user = await ctx.db.get(request.userId);
        let approverName = null;
        if (request.approvedBy) {
          const approver = await ctx.db.get(request.approvedBy);
          approverName = approver
            ? `${approver.firstName || ""} ${approver.lastName || ""}`.trim()
            : "Admin";
        }

        return {
          ...request,
          userName: user
            ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
            : "Unknown User",
          userEmail: user?.email || "",
          approverName,
        };
      })
    );

    return {
      requests: enrichedRequests,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },
});

/**
 * Create a new add money request
 */
export const createRequest = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    // Validate amount
    if (args.amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Optional: Add max limit validation
    const MAX_REQUEST_AMOUNT = 1000000; // 10 lakhs
    if (args.amount > MAX_REQUEST_AMOUNT) {
      throw new Error(
        `Amount cannot exceed ₹${MAX_REQUEST_AMOUNT.toLocaleString()}`
      );
    }

    // Check if user has any pending requests
    const pendingRequest = await ctx.db
      .query("addMoneyRequests")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (pendingRequest) {
      throw new Error(
        "You already have a pending request. Please wait for approval or cancel the existing request."
      );
    }

    // Create the request
    const requestId = await ctx.db.insert("addMoneyRequests", {
      userId: args.userId,
      amount: args.amount,
      status: "pending",
      requestedAt: Date.now(),
    });

    return await ctx.db.get(requestId);
  },
});

/**
 * Approve an add money request
 * Updates wallet balance and creates transaction
 */
export const approveRequest = mutation({
  args: {
    requestId: v.id("addMoneyRequests"),
    adminId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);

    if (!request) {
      throw new Error("Request not found");
    }

    if (request.status !== "pending") {
      throw new Error("Request has already been processed");
    }

    // Get user's wallet
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", request.userId))
      .first();

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    const now = Date.now();
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + request.amount;

    // Update wallet balance
    await ctx.db.patch(wallet._id, {
      balance: balanceAfter,
      totalAdded: wallet.totalAdded + request.amount,
      lastUpdatedAt: now,
    });

    // Create transaction record
    await ctx.db.insert("transactions", {
      userId: request.userId,
      type: "add_money",
      amount: request.amount,
      description: `Money added to wallet - Request approved`,
      balanceBefore,
      balanceAfter,
      createdAt: now,
    });

    // Update request status
    await ctx.db.patch(args.requestId, {
      status: "approved",
      approvedAt: now,
      approvedBy: args.adminId,
    });

    return await ctx.db.get(args.requestId);
  },
});

/**
 * Reject an add money request
 */
export const rejectRequest = mutation({
  args: {
    requestId: v.id("addMoneyRequests"),
    adminId: v.id("users"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);

    if (!request) {
      throw new Error("Request not found");
    }

    if (request.status !== "pending") {
      throw new Error("Request has already been processed");
    }

    // Update request status
    await ctx.db.patch(args.requestId, {
      status: "rejected",
      approvedAt: Date.now(),
      approvedBy: args.adminId,
      rejectionReason: args.reason || "Request rejected by admin",
    });

    return await ctx.db.get(args.requestId);
  },
});

/**
 * Cancel a pending request (by user)
 */
export const cancelRequest = mutation({
  args: {
    requestId: v.id("addMoneyRequests"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);

    if (!request) {
      throw new Error("Request not found");
    }

    // Verify the request belongs to the user
    if (request.userId !== args.userId) {
      throw new Error("Unauthorized: This request does not belong to you");
    }

    if (request.status !== "pending") {
      throw new Error("Only pending requests can be cancelled");
    }

    // Delete the request
    await ctx.db.delete(args.requestId);

    return { success: true, message: "Request cancelled successfully" };
  },
});
