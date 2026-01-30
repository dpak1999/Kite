import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Add a new instrument to track
export const add = mutation({
  args: {
    symbol: v.string(),
    name: v.string(),
    type: v.union(v.literal("stock"), v.literal("etf"), v.literal("mutualfund")),
    exchange: v.optional(v.string()),
    sector: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if already exists
    const existing = await ctx.db
      .query("instruments")
      .withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("instruments", {
      ...args,
      isActive: true,
    });
  },
});

// Add multiple instruments at once
export const addBulk = mutation({
  args: {
    instruments: v.array(
      v.object({
        symbol: v.string(),
        name: v.string(),
        type: v.union(v.literal("stock"), v.literal("etf"), v.literal("mutualfund")),
        exchange: v.optional(v.string()),
        sector: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results = [];
    for (const instrument of args.instruments) {
      const existing = await ctx.db
        .query("instruments")
        .withIndex("by_symbol", (q) => q.eq("symbol", instrument.symbol))
        .first();

      if (existing) {
        results.push(existing._id);
      } else {
        const id = await ctx.db.insert("instruments", {
          ...instrument,
          isActive: true,
        });
        results.push(id);
      }
    }
    return results;
  },
});

// Get all instruments
export const list = query({
  args: {
    type: v.optional(v.union(v.literal("stock"), v.literal("etf"), v.literal("mutualfund"))),
  },
  handler: async (ctx, args) => {
    if (args.type) {
      return await ctx.db
        .query("instruments")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    }
    return await ctx.db
      .query("instruments")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Get instrument by symbol
export const getBySymbol = query({
  args: { symbol: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("instruments")
      .withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
      .first();
  },
});

// Remove instrument (soft delete)
export const remove = mutation({
  args: { id: v.id("instruments") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isActive: false });
  },
});

// Add instruments from Yahoo Finance search results
// Maps Yahoo types (equity, etf, mutualfund) to our types
export const addFromSearch = mutation({
  args: {
    instruments: v.array(
      v.object({
        symbol: v.string(),
        name: v.string(),
        type: v.string(), // Yahoo returns "equity", "etf", "mutualfund", etc.
        exchange: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results = [];

    for (const item of args.instruments) {
      // Map Yahoo Finance types to our types
      let mappedType: "stock" | "etf" | "mutualfund" = "stock";
      const yahooType = item.type.toLowerCase();

      if (yahooType === "etf") {
        mappedType = "etf";
      } else if (yahooType === "mutualfund" || yahooType === "mutual fund") {
        mappedType = "mutualfund";
      }
      // equity, index, future, option, etc. -> stock

      const existing = await ctx.db
        .query("instruments")
        .withIndex("by_symbol", (q) => q.eq("symbol", item.symbol))
        .first();

      if (existing) {
        results.push({ id: existing._id, symbol: item.symbol, added: false });
      } else {
        const id = await ctx.db.insert("instruments", {
          symbol: item.symbol,
          name: item.name,
          type: mappedType,
          exchange: item.exchange,
          isActive: true,
        });
        results.push({ id, symbol: item.symbol, added: true });
      }
    }

    return results;
  },
});

// Hard delete instrument and its data
export const hardDelete = mutation({
  args: { id: v.id("instruments") },
  handler: async (ctx, args) => {
    // Delete price history
    const history = await ctx.db
      .query("priceHistory")
      .withIndex("by_instrument", (q) => q.eq("instrumentId", args.id))
      .collect();
    for (const h of history) {
      await ctx.db.delete(h._id);
    }

    // Delete current price
    const price = await ctx.db
      .query("prices")
      .withIndex("by_instrument", (q) => q.eq("instrumentId", args.id))
      .first();
    if (price) {
      await ctx.db.delete(price._id);
    }

    // Delete instrument
    await ctx.db.delete(args.id);
  },
});
