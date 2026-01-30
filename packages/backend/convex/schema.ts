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

  // Stocks table - available stock instruments (admin-added)
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

  // Mutual Funds table - available mutual funds (admin-added)
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

  // User's stock holdings - tracks what stocks each user owns
  userStockHoldings: defineTable({
    userId: v.id("users"),
    stockId: v.id("stocks"),
    quantity: v.number(),
    avgBuyPrice: v.number(),
    totalInvested: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_stockId", ["stockId"])
    .index("by_userId_stockId", ["userId", "stockId"]),

  // User's mutual fund holdings - tracks what MFs each user owns
  userMutualFundHoldings: defineTable({
    userId: v.id("users"),
    mutualFundId: v.id("mutualFunds"),
    units: v.number(),
    avgNav: v.number(),
    totalInvested: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_mutualFundId", ["mutualFundId"])
    .index("by_userId_mutualFundId", ["userId", "mutualFundId"]),
});
