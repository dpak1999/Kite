import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List all saved stocks
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("stocks")
      .withIndex("by_addedAt")
      .order("desc")
      .collect();
  },
});

// Get stock by symbol
export const getBySymbol = query({
  args: { symbol: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stocks")
      .withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
      .first();
  },
});

// Add a stock from search result
export const add = mutation({
  args: {
    symbol: v.string(),
    companyName: v.string(),
    industry: v.optional(v.string()),
    exchange: v.string(),
    currentPrice: v.optional(v.number()),
    percentChange: v.optional(v.number()),
    yearHigh: v.optional(v.number()),
    yearLow: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if stock already exists
    const existing = await ctx.db
      .query("stocks")
      .withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
      .first();

    if (existing) {
      // Update existing stock
      return await ctx.db.patch(existing._id, {
        ...args,
        addedAt: Date.now(),
      });
    }

    // Add new stock
    return await ctx.db.insert("stocks", {
      ...args,
      addedAt: Date.now(),
    });
  },
});

// Remove a stock and its historical data
export const remove = mutation({
  args: { id: v.id("stocks") },
  handler: async (ctx, args) => {
    // Delete all historical data for this stock first
    const historicalData = await ctx.db
      .query("stockHistoricalData")
      .withIndex("by_stockId", (q) => q.eq("stockId", args.id))
      .collect();

    for (const record of historicalData) {
      await ctx.db.delete(record._id);
    }

    // Then delete the stock itself
    await ctx.db.delete(args.id);
  },
});

// Update stock price
export const updatePrice = mutation({
  args: {
    id: v.id("stocks"),
    currentPrice: v.optional(v.number()),
    percentChange: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Get historical data for a stock with pagination
export const getHistoricalData = query({
  args: {
    stockId: v.id("stocks"),
    pagination: v.optional(
      v.object({
        page: v.number(),
        limit: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const allData = await ctx.db
      .query("stockHistoricalData")
      .withIndex("by_stockId", (q) => q.eq("stockId", args.stockId))
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
