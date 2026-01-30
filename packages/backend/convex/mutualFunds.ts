import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List all saved mutual funds
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("mutualFunds")
      .withIndex("by_addedAt")
      .order("desc")
      .collect();
  },
});

// Get mutual fund by scheme ID
export const getBySchemeId = query({
  args: { schemeId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mutualFunds")
      .withIndex("by_schemeId", (q) => q.eq("schemeId", args.schemeId))
      .first();
  },
});

// Add a mutual fund from search result
export const add = mutation({
  args: {
    schemeId: v.string(),
    schemeName: v.string(),
    isin: v.optional(v.string()),
    schemeType: v.optional(v.string()),
    categoryId: v.optional(v.string()),
    currentNav: v.optional(v.number()),
    fundSize: v.optional(v.number()),
    riskLevel: v.optional(v.string()),
    category: v.optional(v.string()),
    fundManager: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if fund already exists
    const existing = await ctx.db
      .query("mutualFunds")
      .withIndex("by_schemeId", (q) => q.eq("schemeId", args.schemeId))
      .first();

    if (existing) {
      // Update existing fund
      return await ctx.db.patch(existing._id, {
        ...args,
        addedAt: Date.now(),
      });
    }

    // Add new fund
    return await ctx.db.insert("mutualFunds", {
      ...args,
      addedAt: Date.now(),
    });
  },
});

// Remove a mutual fund and its historical data
export const remove = mutation({
  args: { id: v.id("mutualFunds") },
  handler: async (ctx, args) => {
    // Delete all historical data for this MF first
    const historicalData = await ctx.db
      .query("mutualFundHistoricalData")
      .withIndex("by_mutualFundId", (q) => q.eq("mutualFundId", args.id))
      .collect();

    for (const record of historicalData) {
      await ctx.db.delete(record._id);
    }

    // Then delete the mutual fund itself
    await ctx.db.delete(args.id);
  },
});

// Update mutual fund NAV
export const updateNav = mutation({
  args: {
    id: v.id("mutualFunds"),
    currentNav: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Get historical data for a mutual fund with pagination
export const getHistoricalData = query({
  args: {
    mutualFundId: v.id("mutualFunds"),
    pagination: v.optional(
      v.object({
        page: v.number(),
        limit: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const allData = await ctx.db
      .query("mutualFundHistoricalData")
      .withIndex("by_mutualFundId", (q) => q.eq("mutualFundId", args.mutualFundId))
      .order("desc")
      .collect();

    if (!args.pagination) {
      return {
        data: allData,
        total: allData.length,
      };
    }

    const { page, limit } = args.pagination;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      data: allData.slice(startIndex, endIndex),
      total: allData.length,
    };
  },
});
