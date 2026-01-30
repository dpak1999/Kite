import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get user's transactions with optional filtering and pagination
 */
export const getUserTransactions = query({
  args: {
    userId: v.id("users"),
    filters: v.optional(
      v.object({
        type: v.optional(
          v.union(
            v.literal("add_money"),
            v.literal("buy_stock"),
            v.literal("sell_stock"),
            v.literal("buy_mf"),
            v.literal("sell_mf")
          )
        ),
      })
    ),
    paginationOpts: v.object({
      page: v.number(),
      limit: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const { page, limit } = args.paginationOpts;
    const skip = (page - 1) * limit;

    let query = ctx.db
      .query("transactions")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", args.userId))
      .order("desc");

    let transactions = await query.collect();

    // Apply type filter if provided
    if (args.filters?.type) {
      transactions = transactions.filter((t) => t.type === args.filters!.type);
    }

    const total = transactions.length;
    const paginatedTransactions = transactions.slice(skip, skip + limit);

    return {
      transactions: paginatedTransactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },
});

/**
 * Get recent transactions for dashboard display
 */
export const getRecentTransactions = query({
  args: {
    userId: v.id("users"),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit);

    return transactions;
  },
});

/**
 * Get transaction statistics for a user
 */
export const getTransactionStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", args.userId))
      .collect();

    const stats = {
      totalTransactions: transactions.length,
      totalAdded: 0,
      totalSpent: 0,
      totalEarned: 0,
      stockPurchases: 0,
      stockSales: 0,
      mfPurchases: 0,
      mfSales: 0,
    };

    transactions.forEach((txn) => {
      switch (txn.type) {
        case "add_money":
          stats.totalAdded += txn.amount;
          break;
        case "buy_stock":
          stats.totalSpent += txn.amount;
          stats.stockPurchases++;
          break;
        case "sell_stock":
          stats.totalEarned += txn.amount;
          stats.stockSales++;
          break;
        case "buy_mf":
          stats.totalSpent += txn.amount;
          stats.mfPurchases++;
          break;
        case "sell_mf":
          stats.totalEarned += txn.amount;
          stats.mfSales++;
          break;
      }
    });

    return stats;
  },
});

/**
 * Get transactions grouped by type
 */
export const getTransactionsByType = query({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("add_money"),
      v.literal("buy_stock"),
      v.literal("sell_stock"),
      v.literal("buy_mf"),
      v.literal("sell_mf")
    ),
    paginationOpts: v.object({
      page: v.number(),
      limit: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const { page, limit } = args.paginationOpts;
    const skip = (page - 1) * limit;

    const allTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    const filteredTransactions = allTransactions.filter(
      (t) => t.type === args.type
    );

    const total = filteredTransactions.length;
    const paginatedTransactions = filteredTransactions.slice(skip, skip + limit);

    return {
      transactions: paginatedTransactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },
});

/**
 * Get a single transaction by ID
 */
export const getTransaction = query({
  args: { transactionId: v.id("transactions") },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.transactionId);
    return transaction;
  },
});

/**
 * Internal function to create a transaction
 * Used by other modules (addMoneyRequests, trading)
 */
export const createTransaction = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("add_money"),
      v.literal("buy_stock"),
      v.literal("sell_stock"),
      v.literal("buy_mf"),
      v.literal("sell_mf")
    ),
    amount: v.number(),
    description: v.string(),
    relatedAssetId: v.optional(v.string()),
    relatedAssetName: v.optional(v.string()),
    quantity: v.optional(v.number()),
    pricePerUnit: v.optional(v.number()),
    balanceBefore: v.number(),
    balanceAfter: v.number(),
  },
  handler: async (ctx, args) => {
    const transactionId = await ctx.db.insert("transactions", {
      userId: args.userId,
      type: args.type,
      amount: args.amount,
      description: args.description,
      relatedAssetId: args.relatedAssetId,
      relatedAssetName: args.relatedAssetName,
      quantity: args.quantity,
      pricePerUnit: args.pricePerUnit,
      balanceBefore: args.balanceBefore,
      balanceAfter: args.balanceAfter,
      createdAt: Date.now(),
    });

    return await ctx.db.get(transactionId);
  },
});
