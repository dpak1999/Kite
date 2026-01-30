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
    hasHistoricalData: v.optional(v.boolean()),
  })
    .index("by_symbol", ["symbol"])
    .index("by_addedAt", ["addedAt"]),

  // Stock Historical Data - daily price data
  stockHistoricalData: defineTable({
    stockId: v.id("stocks"),
    date: v.string(),
    price: v.number(),
    dma50: v.optional(v.number()),
    dma200: v.optional(v.number()),
    volume: v.optional(v.number()),
  })
    .index("by_stockId", ["stockId"])
    .index("by_stockId_date", ["stockId", "date"]),

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
    mfapiSchemeCode: v.optional(v.number()),
    hasHistoricalData: v.optional(v.boolean()),
  })
    .index("by_schemeId", ["schemeId"])
    .index("by_addedAt", ["addedAt"]),

  // Mutual Fund Historical Data - daily NAV data
  mutualFundHistoricalData: defineTable({
    mutualFundId: v.id("mutualFunds"),
    date: v.string(),
    nav: v.number(),
  })
    .index("by_mutualFundId", ["mutualFundId"])
    .index("by_mutualFundId_date", ["mutualFundId", "date"]),

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

  // Wallets - User's virtual account balance for trading
  wallets: defineTable({
    userId: v.id("users"),
    balance: v.number(), // Current balance in rupees
    totalAdded: v.number(), // Lifetime added amount
    totalSpent: v.number(), // Lifetime spent amount
    totalEarned: v.number(), // Lifetime earned from sells
    lastUpdatedAt: v.number(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Add Money Requests - User requests for adding money to wallet
  addMoneyRequests: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    requestedAt: v.number(),
    approvedAt: v.optional(v.number()),
    approvedBy: v.optional(v.id("users")),
    rejectionReason: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_requestedAt", ["requestedAt"]),

  // Transactions - Complete audit trail of all money movements
  transactions: defineTable({
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
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_type", ["type"])
    .index("by_userId_createdAt", ["userId", "createdAt"]),

  // Watchlist - User's tracked instruments
  watchlist: defineTable({
    userId: v.id("users"),
    instrumentType: v.union(v.literal("stock"), v.literal("mutualFund")),
    instrumentId: v.string(),
    addedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_instrumentId", ["userId", "instrumentId"]),
});
