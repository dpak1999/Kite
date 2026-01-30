import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Instruments: stocks, ETFs, mutual funds
  instruments: defineTable({
    symbol: v.string(), // e.g., "RELIANCE.NS", "NIFTYBEES.NS"
    name: v.string(),
    type: v.union(v.literal("stock"), v.literal("etf"), v.literal("mutualfund")),
    exchange: v.optional(v.string()), // NSE, BSE
    sector: v.optional(v.string()),
    isActive: v.boolean(),
    lastUpdated: v.optional(v.number()),
  })
    .index("by_symbol", ["symbol"])
    .index("by_type", ["type"]),

  // Current/Latest prices
  prices: defineTable({
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
    updatedAt: v.number(),
  })
    .index("by_instrument", ["instrumentId"])
    .index("by_symbol", ["symbol"]),

  // Historical price data (daily)
  priceHistory: defineTable({
    instrumentId: v.id("instruments"),
    symbol: v.string(),
    date: v.string(), // "2024-01-15"
    open: v.number(),
    high: v.number(),
    low: v.number(),
    close: v.number(),
    volume: v.optional(v.number()),
  })
    .index("by_instrument", ["instrumentId"])
    .index("by_symbol_date", ["symbol", "date"]),

  // Watchlists for users
  watchlists: defineTable({
    userId: v.string(), // Clerk user ID
    name: v.string(),
    instrumentIds: v.array(v.id("instruments")),
  }).index("by_user", ["userId"]),
});
