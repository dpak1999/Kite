import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ==================== STOCK HOLDINGS ====================

// List all stock holdings with user and stock details
export const listStockHoldings = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let holdings;
    if (args.userId) {
      holdings = await ctx.db
        .query("userStockHoldings")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId!))
        .collect();
    } else {
      holdings = await ctx.db.query("userStockHoldings").collect();
    }

    // Enrich with user and stock details
    const enriched = await Promise.all(
      holdings.map(async (h) => {
        const user = await ctx.db.get(h.userId);
        const stock = await ctx.db.get(h.stockId);
        return {
          ...h,
          user: user
            ? {
              _id: user._id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              imageUrl: user.imageUrl,
            }
            : null,
          stock: stock
            ? {
              _id: stock._id,
              symbol: stock.symbol,
              companyName: stock.companyName,
              currentPrice: stock.currentPrice,
            }
            : null,
        };
      })
    );
    return enriched;
  },
});

// Get user's complete portfolio with P&L calculations
export const getUserPortfolio = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const stockHoldings = await ctx.db
      .query("userStockHoldings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const mfHoldings = await ctx.db
      .query("userMutualFundHoldings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Enrich stock holdings with P&L calculations
    const enrichedStocks = await Promise.all(
      stockHoldings.map(async (h) => {
        const stock = await ctx.db.get(h.stockId);

        // Calculate current value and P&L
        const currentPrice = stock?.currentPrice || 0;
        const currentValue = h.quantity * currentPrice;
        const gainLoss = currentValue - h.totalInvested;
        const gainLossPercent = h.totalInvested > 0
          ? (gainLoss / h.totalInvested) * 100
          : 0;

        return {
          holding: h,
          stock,
          currentValue,
          gainLoss,
          gainLossPercent,
        };
      })
    );

    // Enrich MF holdings with P&L calculations
    const enrichedMFs = await Promise.all(
      mfHoldings.map(async (h) => {
        const mf = await ctx.db.get(h.mutualFundId);

        // Calculate current value and P&L
        const currentNav = mf?.currentNav || 0;
        const currentValue = h.units * currentNav;
        const gainLoss = currentValue - h.totalInvested;
        const gainLossPercent = h.totalInvested > 0
          ? (gainLoss / h.totalInvested) * 100
          : 0;

        return {
          holding: h,
          mutualFund: mf,
          currentValue,
          gainLoss,
          gainLossPercent,
        };
      })
    );

    // Calculate combined portfolio statistics
    const totalStockInvested = stockHoldings.reduce(
      (sum, h) => sum + h.totalInvested,
      0
    );
    const totalMFInvested = mfHoldings.reduce(
      (sum, h) => sum + h.totalInvested,
      0
    );
    const totalInvested = totalStockInvested + totalMFInvested;

    const totalStockCurrentValue = enrichedStocks.reduce(
      (sum, s) => sum + s.currentValue,
      0
    );
    const totalMFCurrentValue = enrichedMFs.reduce(
      (sum, m) => sum + m.currentValue,
      0
    );
    const totalCurrentValue = totalStockCurrentValue + totalMFCurrentValue;

    const totalGainLoss = totalCurrentValue - totalInvested;
    const totalGainLossPercent = totalInvested > 0
      ? (totalGainLoss / totalInvested) * 100
      : 0;

    return {
      stocks: enrichedStocks,
      mutualFunds: enrichedMFs,
      combined: {
        totalInvested,
        totalCurrentValue,
        totalGainLoss,
        totalGainLossPercent,
        stocksInvested: totalStockInvested,
        stocksCurrentValue: totalStockCurrentValue,
        mfsInvested: totalMFInvested,
        mfsCurrentValue: totalMFCurrentValue,
      },
    };
  },
});

// Add or update stock holding for a user
export const addStockHolding = mutation({
  args: {
    userId: v.id("users"),
    stockId: v.id("stocks"),
    quantity: v.number(),
    avgBuyPrice: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if holding already exists
    const existing = await ctx.db
      .query("userStockHoldings")
      .withIndex("by_userId_stockId", (q) =>
        q.eq("userId", args.userId).eq("stockId", args.stockId)
      )
      .first();

    const totalInvested = args.quantity * args.avgBuyPrice;

    if (existing) {
      // Update existing holding
      return await ctx.db.patch(existing._id, {
        quantity: args.quantity,
        avgBuyPrice: args.avgBuyPrice,
        totalInvested,
        updatedAt: Date.now(),
      });
    }

    // Create new holding
    return await ctx.db.insert("userStockHoldings", {
      userId: args.userId,
      stockId: args.stockId,
      quantity: args.quantity,
      avgBuyPrice: args.avgBuyPrice,
      totalInvested,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update stock holding
export const updateStockHolding = mutation({
  args: {
    id: v.id("userStockHoldings"),
    quantity: v.number(),
    avgBuyPrice: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      quantity: args.quantity,
      avgBuyPrice: args.avgBuyPrice,
      totalInvested: args.quantity * args.avgBuyPrice,
      updatedAt: Date.now(),
    });
  },
});

// Remove stock holding
export const removeStockHolding = mutation({
  args: { id: v.id("userStockHoldings") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// ==================== MUTUAL FUND HOLDINGS ====================

// List all MF holdings with user and fund details
export const listMutualFundHoldings = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let holdings;
    if (args.userId) {
      holdings = await ctx.db
        .query("userMutualFundHoldings")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId!))
        .collect();
    } else {
      holdings = await ctx.db.query("userMutualFundHoldings").collect();
    }

    // Enrich with user and MF details
    const enriched = await Promise.all(
      holdings.map(async (h) => {
        const user = await ctx.db.get(h.userId);
        const mf = await ctx.db.get(h.mutualFundId);
        return {
          ...h,
          user: user
            ? {
              _id: user._id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              imageUrl: user.imageUrl,
            }
            : null,
          mutualFund: mf
            ? {
              _id: mf._id,
              schemeName: mf.schemeName,
              currentNav: mf.currentNav,
            }
            : null,
        };
      })
    );
    return enriched;
  },
});

// Add or update MF holding for a user
export const addMutualFundHolding = mutation({
  args: {
    userId: v.id("users"),
    mutualFundId: v.id("mutualFunds"),
    units: v.number(),
    avgNav: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if holding already exists
    const existing = await ctx.db
      .query("userMutualFundHoldings")
      .withIndex("by_userId_mutualFundId", (q) =>
        q.eq("userId", args.userId).eq("mutualFundId", args.mutualFundId)
      )
      .first();

    const totalInvested = args.units * args.avgNav;

    if (existing) {
      return await ctx.db.patch(existing._id, {
        units: args.units,
        avgNav: args.avgNav,
        totalInvested,
        updatedAt: Date.now(),
      });
    }

    return await ctx.db.insert("userMutualFundHoldings", {
      userId: args.userId,
      mutualFundId: args.mutualFundId,
      units: args.units,
      avgNav: args.avgNav,
      totalInvested,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update MF holding
export const updateMutualFundHolding = mutation({
  args: {
    id: v.id("userMutualFundHoldings"),
    units: v.number(),
    avgNav: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      units: args.units,
      avgNav: args.avgNav,
      totalInvested: args.units * args.avgNav,
      updatedAt: Date.now(),
    });
  },
});

// Remove MF holding
export const removeMutualFundHolding = mutation({
  args: { id: v.id("userMutualFundHoldings") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Get a single stock holding with P&L
export const getStockHoldingById = query({
  args: { holdingId: v.id("userStockHoldings") },
  handler: async (ctx, args) => {
    const holding = await ctx.db.get(args.holdingId);
    if (!holding) {
      return null;
    }

    const stock = await ctx.db.get(holding.stockId);
    const currentPrice = stock?.currentPrice || 0;
    const currentValue = holding.quantity * currentPrice;
    const gainLoss = currentValue - holding.totalInvested;
    const gainLossPercent = holding.totalInvested > 0
      ? (gainLoss / holding.totalInvested) * 100
      : 0;

    return {
      holding,
      stock,
      currentValue,
      gainLoss,
      gainLossPercent,
    };
  },
});

// Get a single MF holding with P&L
export const getMutualFundHoldingById = query({
  args: { holdingId: v.id("userMutualFundHoldings") },
  handler: async (ctx, args) => {
    const holding = await ctx.db.get(args.holdingId);
    if (!holding) {
      return null;
    }

    const mf = await ctx.db.get(holding.mutualFundId);
    const currentNav = mf?.currentNav || 0;
    const currentValue = holding.units * currentNav;
    const gainLoss = currentValue - holding.totalInvested;
    const gainLossPercent = holding.totalInvested > 0
      ? (gainLoss / holding.totalInvested) * 100
      : 0;

    return {
      holding,
      mutualFund: mf,
      currentValue,
      gainLoss,
      gainLossPercent,
    };
  },
});

// Get portfolio summary (just the stats, no holdings list)
export const getPortfolioSummary = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const stockHoldings = await ctx.db
      .query("userStockHoldings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const mfHoldings = await ctx.db
      .query("userMutualFundHoldings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Calculate stock totals
    let totalStockInvested = 0;
    let totalStockCurrentValue = 0;
    for (const h of stockHoldings) {
      const stock = await ctx.db.get(h.stockId);
      const currentPrice = stock?.currentPrice || 0;
      totalStockInvested += h.totalInvested;
      totalStockCurrentValue += h.quantity * currentPrice;
    }

    // Calculate MF totals
    let totalMFInvested = 0;
    let totalMFCurrentValue = 0;
    for (const h of mfHoldings) {
      const mf = await ctx.db.get(h.mutualFundId);
      const currentNav = mf?.currentNav || 0;
      totalMFInvested += h.totalInvested;
      totalMFCurrentValue += h.units * currentNav;
    }

    const totalInvested = totalStockInvested + totalMFInvested;
    const totalCurrentValue = totalStockCurrentValue + totalMFCurrentValue;
    const totalGainLoss = totalCurrentValue - totalInvested;
    const totalGainLossPercent = totalInvested > 0
      ? (totalGainLoss / totalInvested) * 100
      : 0;

    return {
      totalInvested,
      totalCurrentValue,
      totalGainLoss,
      totalGainLossPercent,
      stocksCount: stockHoldings.length,
      stocksInvested: totalStockInvested,
      stocksCurrentValue: totalStockCurrentValue,
      mfsCount: mfHoldings.length,
      mfsInvested: totalMFInvested,
      mfsCurrentValue: totalMFCurrentValue,
    };
  },
});

// ==================== SUMMARY STATS ====================

// Get holdings summary stats
export const getHoldingsSummary = query({
  args: {},
  handler: async (ctx) => {
    const stockHoldings = await ctx.db.query("userStockHoldings").collect();
    const mfHoldings = await ctx.db.query("userMutualFundHoldings").collect();

    const uniqueUsersWithStocks = new Set(stockHoldings.map((h) => h.userId));
    const uniqueUsersWithMFs = new Set(mfHoldings.map((h) => h.userId));
    const allUsersWithHoldings = new Set([
      ...Array.from(uniqueUsersWithStocks),
      ...Array.from(uniqueUsersWithMFs),
    ]);

    const totalStockInvested = stockHoldings.reduce(
      (sum, h) => sum + h.totalInvested,
      0
    );
    const totalMFInvested = mfHoldings.reduce(
      (sum, h) => sum + h.totalInvested,
      0
    );

    return {
      usersWithHoldings: allUsersWithHoldings.size,
      totalStockHoldings: stockHoldings.length,
      totalMFHoldings: mfHoldings.length,
      totalStockInvested,
      totalMFInvested,
      totalInvested: totalStockInvested + totalMFInvested,
    };
  },
});
