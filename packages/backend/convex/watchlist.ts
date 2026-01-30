import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Get user's watchlist with enriched instrument data
 */
export const getUserWatchlist = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const watchlistItems = await ctx.db
      .query("watchlist")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    // Enrich with instrument details
    const enrichedItems = await Promise.all(
      watchlistItems.map(async (item) => {
        if (item.instrumentType === "stock") {
          const stock = await ctx.db.get(item.instrumentId as Id<"stocks">);
          return {
            ...item,
            instrument: stock
              ? {
                  id: stock._id,
                  type: "stock" as const,
                  name: stock.companyName,
                  symbol: stock.symbol,
                  currentPrice: stock.currentPrice,
                  percentChange: stock.percentChange,
                  exchange: stock.exchange,
                }
              : null,
          };
        } else {
          const mutualFund = await ctx.db.get(
            item.instrumentId as Id<"mutualFunds">
          );
          return {
            ...item,
            instrument: mutualFund
              ? {
                  id: mutualFund._id,
                  type: "mutualFund" as const,
                  name: mutualFund.schemeName,
                  symbol: mutualFund.schemeId,
                  currentPrice: mutualFund.currentNav,
                  category: mutualFund.category,
                  schemeType: mutualFund.schemeType,
                }
              : null,
          };
        }
      })
    );

    // Filter out items where instrument no longer exists
    return enrichedItems.filter((item) => item.instrument !== null);
  },
});

/**
 * Get watchlist items grouped by type
 */
export const getWatchlistByType = query({
  args: {
    userId: v.id("users"),
    instrumentType: v.union(v.literal("stock"), v.literal("mutualFund")),
  },
  handler: async (ctx, args) => {
    const watchlistItems = await ctx.db
      .query("watchlist")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("instrumentType"), args.instrumentType))
      .order("desc")
      .collect();

    // Enrich with instrument details
    const enrichedItems = await Promise.all(
      watchlistItems.map(async (item) => {
        if (item.instrumentType === "stock") {
          const stock = await ctx.db.get(item.instrumentId as Id<"stocks">);
          return {
            ...item,
            instrument: stock
              ? {
                  id: stock._id,
                  type: "stock" as const,
                  name: stock.companyName,
                  symbol: stock.symbol,
                  currentPrice: stock.currentPrice,
                  percentChange: stock.percentChange,
                  exchange: stock.exchange,
                }
              : null,
          };
        } else {
          const mutualFund = await ctx.db.get(
            item.instrumentId as Id<"mutualFunds">
          );
          return {
            ...item,
            instrument: mutualFund
              ? {
                  id: mutualFund._id,
                  type: "mutualFund" as const,
                  name: mutualFund.schemeName,
                  symbol: mutualFund.schemeId,
                  currentPrice: mutualFund.currentNav,
                  category: mutualFund.category,
                  schemeType: mutualFund.schemeType,
                }
              : null,
          };
        }
      })
    );

    return enrichedItems.filter((item) => item.instrument !== null);
  },
});

/**
 * Check if an instrument is in user's watchlist
 */
export const isInWatchlist = query({
  args: {
    userId: v.id("users"),
    instrumentType: v.union(v.literal("stock"), v.literal("mutualFund")),
    instrumentId: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("watchlist")
      .withIndex("by_userId_instrumentId", (q) =>
        q.eq("userId", args.userId).eq("instrumentId", args.instrumentId)
      )
      .first();

    return !!item;
  },
});

/**
 * Add instrument to watchlist
 */
export const addToWatchlist = mutation({
  args: {
    userId: v.id("users"),
    instrumentType: v.union(v.literal("stock"), v.literal("mutualFund")),
    instrumentId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if already in watchlist
    const existing = await ctx.db
      .query("watchlist")
      .withIndex("by_userId_instrumentId", (q) =>
        q.eq("userId", args.userId).eq("instrumentId", args.instrumentId)
      )
      .first();

    if (existing) {
      throw new Error("Instrument already in watchlist");
    }

    // Verify instrument exists
    if (args.instrumentType === "stock") {
      const stock = await ctx.db.get(args.instrumentId as Id<"stocks">);
      if (!stock) {
        throw new Error("Stock not found");
      }
    } else {
      const mutualFund = await ctx.db.get(
        args.instrumentId as Id<"mutualFunds">
      );
      if (!mutualFund) {
        throw new Error("Mutual fund not found");
      }
    }

    // Add to watchlist
    const watchlistId = await ctx.db.insert("watchlist", {
      userId: args.userId,
      instrumentType: args.instrumentType,
      instrumentId: args.instrumentId,
      addedAt: Date.now(),
    });

    return await ctx.db.get(watchlistId);
  },
});

/**
 * Remove instrument from watchlist
 */
export const removeFromWatchlist = mutation({
  args: {
    userId: v.id("users"),
    instrumentType: v.union(v.literal("stock"), v.literal("mutualFund")),
    instrumentId: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("watchlist")
      .withIndex("by_userId_instrumentId", (q) =>
        q.eq("userId", args.userId).eq("instrumentId", args.instrumentId)
      )
      .first();

    if (!item) {
      throw new Error("Instrument not in watchlist");
    }

    await ctx.db.delete(item._id);

    return { success: true, message: "Removed from watchlist" };
  },
});

/**
 * Toggle instrument in watchlist (add if not present, remove if present)
 */
export const toggleWatchlist = mutation({
  args: {
    userId: v.id("users"),
    instrumentType: v.union(v.literal("stock"), v.literal("mutualFund")),
    instrumentId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("watchlist")
      .withIndex("by_userId_instrumentId", (q) =>
        q.eq("userId", args.userId).eq("instrumentId", args.instrumentId)
      )
      .first();

    if (existing) {
      // Remove from watchlist
      await ctx.db.delete(existing._id);
      return { success: true, action: "removed", message: "Removed from watchlist" };
    } else {
      // Verify instrument exists
      if (args.instrumentType === "stock") {
        const stock = await ctx.db.get(args.instrumentId as Id<"stocks">);
        if (!stock) {
          throw new Error("Stock not found");
        }
      } else {
        const mutualFund = await ctx.db.get(
          args.instrumentId as Id<"mutualFunds">
        );
        if (!mutualFund) {
          throw new Error("Mutual fund not found");
        }
      }

      // Add to watchlist
      const watchlistId = await ctx.db.insert("watchlist", {
        userId: args.userId,
        instrumentType: args.instrumentType,
        instrumentId: args.instrumentId,
        addedAt: Date.now(),
      });

      const item = await ctx.db.get(watchlistId);
      return { success: true, action: "added", item, message: "Added to watchlist" };
    }
  },
});

/**
 * Get watchlist count
 */
export const getWatchlistCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("watchlist")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return {
      total: items.length,
      stocks: items.filter((i) => i.instrumentType === "stock").length,
      mutualFunds: items.filter((i) => i.instrumentType === "mutualFund").length,
    };
  },
});
