import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - synced from Clerk
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    lastLoginAt: v.optional(v.number()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_createdAt", ["createdAt"]),

  // Stocks table - saved stock instruments
  stocks: defineTable({
    symbol: v.string(),
    companyName: v.string(),
    industry: v.optional(v.string()),
    exchange: v.string(),
    currentPrice: v.optional(v.number()),
    percentChange: v.optional(v.number()),
    yearHigh: v.optional(v.number()),
    yearLow: v.optional(v.number()),
    addedAt: v.number(),
  })
    .index("by_symbol", ["symbol"])
    .index("by_addedAt", ["addedAt"]),

  // Mutual Funds table - saved mutual fund instruments
  mutualFunds: defineTable({
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
    addedAt: v.number(),
  })
    .index("by_schemeId", ["schemeId"])
    .index("by_addedAt", ["addedAt"]),
});
