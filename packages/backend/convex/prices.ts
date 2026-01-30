import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Update current price for an instrument
export const updatePrice = internalMutation({
  args: {
    instrumentId: v.id("instruments"),
    symbol: v.string(),
    price: v.number(),
    previousClose: v.optional(v.number()),
    open: v.optional(v.number()),
    high: v.optional(v.number()),
    low: v.optional(v.number()),
    volume: v.optional(v.number()),
    change: v.optional(v.number()),
    changePercent: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("prices")
      .withIndex("by_instrument", (q) => q.eq("instrumentId", args.instrumentId))
      .first();

    const priceData = {
      instrumentId: args.instrumentId,
      symbol: args.symbol,
      price: args.price,
      previousClose: args.previousClose,
      open: args.open,
      high: args.high,
      low: args.low,
      volume: args.volume,
      change: args.change,
      changePercent: args.changePercent,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, priceData);
      return existing._id;
    } else {
      return await ctx.db.insert("prices", priceData);
    }
  },
});

// Add historical price data
export const addHistoricalPrice = internalMutation({
  args: {
    instrumentId: v.id("instruments"),
    symbol: v.string(),
    date: v.string(),
    open: v.number(),
    high: v.number(),
    low: v.number(),
    close: v.number(),
    volume: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if already exists
    const existing = await ctx.db
      .query("priceHistory")
      .withIndex("by_symbol_date", (q) =>
        q.eq("symbol", args.symbol).eq("date", args.date)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }

    return await ctx.db.insert("priceHistory", args);
  },
});

// Get current price for an instrument
export const getPrice = query({
  args: { instrumentId: v.id("instruments") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("prices")
      .withIndex("by_instrument", (q) => q.eq("instrumentId", args.instrumentId))
      .first();
  },
});

// Get all current prices (for dashboard)
export const getAllPrices = query({
  args: {},
  handler: async (ctx) => {
    const prices = await ctx.db.query("prices").collect();
    const instruments = await ctx.db.query("instruments").collect();

    // Join prices with instrument details
    return prices.map((price) => {
      const instrument = instruments.find((i) => i._id === price.instrumentId);
      return {
        ...price,
        instrument,
      };
    });
  },
});

// Get prices for specific instruments
export const getPricesForInstruments = query({
  args: { instrumentIds: v.array(v.id("instruments")) },
  handler: async (ctx, args) => {
    const results = [];
    for (const id of args.instrumentIds) {
      const price = await ctx.db
        .query("prices")
        .withIndex("by_instrument", (q) => q.eq("instrumentId", id))
        .first();
      if (price) {
        const instrument = await ctx.db.get(id);
        results.push({ ...price, instrument });
      }
    }
    return results;
  },
});

// Get historical prices for an instrument
export const getHistory = query({
  args: {
    instrumentId: v.id("instruments"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("priceHistory")
      .withIndex("by_instrument", (q) => q.eq("instrumentId", args.instrumentId))
      .order("desc");

    if (args.limit) {
      return await query.take(args.limit);
    }
    return await query.collect();
  },
});

// Get historical prices by symbol
export const getHistoryBySymbol = query({
  args: {
    symbol: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("priceHistory")
      .withIndex("by_symbol_date", (q) => q.eq("symbol", args.symbol))
      .order("desc")
      .collect();

    if (args.limit) {
      return results.slice(0, args.limit);
    }
    return results;
  },
});
