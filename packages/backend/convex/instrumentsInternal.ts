import { internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Internal query to get all active instruments
export const listAll = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("instruments")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Internal query to get instrument by symbol
export const getBySymbol = internalQuery({
  args: { symbol: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("instruments")
      .withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
      .first();
  },
});

// Internal mutation to update lastUpdated timestamp
export const updateLastUpdated = internalMutation({
  args: { id: v.id("instruments") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { lastUpdated: Date.now() });
  },
});
