import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get user's wallet with balance
 */
export const getUserWallet = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    return wallet;
  },
});

/**
 * Get wallet statistics for a user
 */
export const getWalletStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!wallet) {
      return null;
    }

    return {
      currentBalance: wallet.balance,
      totalAdded: wallet.totalAdded,
      totalSpent: wallet.totalSpent,
      totalEarned: wallet.totalEarned,
      netInvested: wallet.totalSpent - wallet.totalEarned,
      lastUpdatedAt: wallet.lastUpdatedAt,
    };
  },
});

/**
 * Initialize wallet for a new user
 * Called automatically when user signs up
 */
export const initializeWallet = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Check if wallet already exists
    const existingWallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existingWallet) {
      return existingWallet;
    }

    // Create new wallet with zero balance
    const now = Date.now();
    const walletId = await ctx.db.insert("wallets", {
      userId: args.userId,
      balance: 0,
      totalAdded: 0,
      totalSpent: 0,
      totalEarned: 0,
      lastUpdatedAt: now,
      createdAt: now,
    });

    return await ctx.db.get(walletId);
  },
});

/**
 * Internal function to update wallet balance
 * Used by transaction modules (addMoneyRequests, trading)
 */
export const updateBalance = mutation({
  args: {
    userId: v.id("users"),
    newBalance: v.number(),
    addedAmount: v.optional(v.number()),
    spentAmount: v.optional(v.number()),
    earnedAmount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    const updates: any = {
      balance: args.newBalance,
      lastUpdatedAt: Date.now(),
    };

    if (args.addedAmount !== undefined) {
      updates.totalAdded = wallet.totalAdded + args.addedAmount;
    }

    if (args.spentAmount !== undefined) {
      updates.totalSpent = wallet.totalSpent + args.spentAmount;
    }

    if (args.earnedAmount !== undefined) {
      updates.totalEarned = wallet.totalEarned + args.earnedAmount;
    }

    await ctx.db.patch(wallet._id, updates);

    return await ctx.db.get(wallet._id);
  },
});
