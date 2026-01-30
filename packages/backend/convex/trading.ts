import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Buy stock shares
 * Validates wallet balance, deducts amount, creates/updates holding, creates transaction
 */
export const buyStock = mutation({
  args: {
    userId: v.id("users"),
    stockId: v.id("stocks"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    // Validate quantity
    if (args.quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    // Get stock details
    const stock = await ctx.db.get(args.stockId);
    if (!stock) {
      throw new Error("Stock not found");
    }

    if (!stock.currentPrice || stock.currentPrice <= 0) {
      throw new Error("Stock price not available");
    }

    // Calculate total cost
    const totalCost = args.quantity * stock.currentPrice;

    // Get user's wallet
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    // Validate sufficient balance
    if (wallet.balance < totalCost) {
      throw new Error(
        `Insufficient balance. Required: ₹${totalCost.toFixed(2)}, Available: ₹${wallet.balance.toFixed(2)}`
      );
    }

    const now = Date.now();
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore - totalCost;

    // Update wallet balance
    await ctx.db.patch(wallet._id, {
      balance: balanceAfter,
      totalSpent: wallet.totalSpent + totalCost,
      lastUpdatedAt: now,
    });

    // Check if user already has holdings for this stock
    const existingHolding = await ctx.db
      .query("userStockHoldings")
      .withIndex("by_userId_stockId", (q) =>
        q.eq("userId", args.userId).eq("stockId", args.stockId)
      )
      .first();

    let holding;
    if (existingHolding) {
      // Update existing holding - calculate new average buy price
      const newQuantity = existingHolding.quantity + args.quantity;
      const newTotalInvested = existingHolding.totalInvested + totalCost;
      const newAvgBuyPrice = newTotalInvested / newQuantity;

      await ctx.db.patch(existingHolding._id, {
        quantity: newQuantity,
        avgBuyPrice: newAvgBuyPrice,
        totalInvested: newTotalInvested,
        updatedAt: now,
      });

      holding = await ctx.db.get(existingHolding._id);
    } else {
      // Create new holding
      const holdingId = await ctx.db.insert("userStockHoldings", {
        userId: args.userId,
        stockId: args.stockId,
        quantity: args.quantity,
        avgBuyPrice: stock.currentPrice,
        totalInvested: totalCost,
        createdAt: now,
        updatedAt: now,
      });

      holding = await ctx.db.get(holdingId);
    }

    // Create transaction record
    await ctx.db.insert("transactions", {
      userId: args.userId,
      type: "buy_stock",
      amount: totalCost,
      description: `Bought ${args.quantity} shares of ${stock.companyName} (${stock.symbol}) @ ₹${stock.currentPrice.toFixed(2)}`,
      relatedAssetId: args.stockId,
      relatedAssetName: `${stock.companyName} (${stock.symbol})`,
      quantity: args.quantity,
      pricePerUnit: stock.currentPrice,
      balanceBefore,
      balanceAfter,
      createdAt: now,
    });

    return {
      success: true,
      newBalance: balanceAfter,
      holding,
      message: `Successfully purchased ${args.quantity} shares of ${stock.companyName}`,
    };
  },
});

/**
 * Sell stock shares
 * Validates ownership, adds proceeds to wallet, updates/removes holding, creates transaction
 */
export const sellStock = mutation({
  args: {
    userId: v.id("users"),
    holdingId: v.id("userStockHoldings"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    // Validate quantity
    if (args.quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    // Get holding
    const holding = await ctx.db.get(args.holdingId);
    if (!holding) {
      throw new Error("Holding not found");
    }

    // Verify ownership
    if (holding.userId !== args.userId) {
      throw new Error("Unauthorized: This holding does not belong to you");
    }

    // Validate sufficient quantity
    if (holding.quantity < args.quantity) {
      throw new Error(
        `Insufficient quantity. You own ${holding.quantity} shares, trying to sell ${args.quantity}`
      );
    }

    // Get stock details
    const stock = await ctx.db.get(holding.stockId);
    if (!stock) {
      throw new Error("Stock not found");
    }

    if (!stock.currentPrice || stock.currentPrice <= 0) {
      throw new Error("Stock price not available");
    }

    // Calculate proceeds
    const proceeds = args.quantity * stock.currentPrice;

    // Get user's wallet
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    const now = Date.now();
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + proceeds;

    // Update wallet balance
    await ctx.db.patch(wallet._id, {
      balance: balanceAfter,
      totalEarned: wallet.totalEarned + proceeds,
      lastUpdatedAt: now,
    });

    // Update or remove holding
    if (holding.quantity === args.quantity) {
      // Selling all shares - remove holding
      await ctx.db.delete(args.holdingId);
    } else {
      // Partial sale - update holding
      const newQuantity = holding.quantity - args.quantity;
      const soldInvestment = (holding.totalInvested / holding.quantity) * args.quantity;
      const newTotalInvested = holding.totalInvested - soldInvestment;

      await ctx.db.patch(args.holdingId, {
        quantity: newQuantity,
        totalInvested: newTotalInvested,
        updatedAt: now,
      });
    }

    // Create transaction record
    await ctx.db.insert("transactions", {
      userId: args.userId,
      type: "sell_stock",
      amount: proceeds,
      description: `Sold ${args.quantity} shares of ${stock.companyName} (${stock.symbol}) @ ₹${stock.currentPrice.toFixed(2)}`,
      relatedAssetId: holding.stockId,
      relatedAssetName: `${stock.companyName} (${stock.symbol})`,
      quantity: args.quantity,
      pricePerUnit: stock.currentPrice,
      balanceBefore,
      balanceAfter,
      createdAt: now,
    });

    return {
      success: true,
      newBalance: balanceAfter,
      proceeds,
      message: `Successfully sold ${args.quantity} shares of ${stock.companyName}`,
    };
  },
});

/**
 * Buy mutual fund units
 * Validates wallet balance, deducts amount, creates/updates holding, creates transaction
 */
export const buyMutualFund = mutation({
  args: {
    userId: v.id("users"),
    mutualFundId: v.id("mutualFunds"),
    units: v.number(),
  },
  handler: async (ctx, args) => {
    // Validate units
    if (args.units <= 0) {
      throw new Error("Units must be greater than 0");
    }

    // Get mutual fund details
    const mutualFund = await ctx.db.get(args.mutualFundId);
    if (!mutualFund) {
      throw new Error("Mutual fund not found");
    }

    if (!mutualFund.currentNav || mutualFund.currentNav <= 0) {
      throw new Error("Mutual fund NAV not available");
    }

    // Calculate total cost
    const totalCost = args.units * mutualFund.currentNav;

    // Get user's wallet
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    // Validate sufficient balance
    if (wallet.balance < totalCost) {
      throw new Error(
        `Insufficient balance. Required: ₹${totalCost.toFixed(2)}, Available: ₹${wallet.balance.toFixed(2)}`
      );
    }

    const now = Date.now();
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore - totalCost;

    // Update wallet balance
    await ctx.db.patch(wallet._id, {
      balance: balanceAfter,
      totalSpent: wallet.totalSpent + totalCost,
      lastUpdatedAt: now,
    });

    // Check if user already has holdings for this mutual fund
    const existingHolding = await ctx.db
      .query("userMutualFundHoldings")
      .withIndex("by_userId_mutualFundId", (q) =>
        q.eq("userId", args.userId).eq("mutualFundId", args.mutualFundId)
      )
      .first();

    let holding;
    if (existingHolding) {
      // Update existing holding - calculate new average NAV
      const newUnits = existingHolding.units + args.units;
      const newTotalInvested = existingHolding.totalInvested + totalCost;
      const newAvgNav = newTotalInvested / newUnits;

      await ctx.db.patch(existingHolding._id, {
        units: newUnits,
        avgNav: newAvgNav,
        totalInvested: newTotalInvested,
        updatedAt: now,
      });

      holding = await ctx.db.get(existingHolding._id);
    } else {
      // Create new holding
      const holdingId = await ctx.db.insert("userMutualFundHoldings", {
        userId: args.userId,
        mutualFundId: args.mutualFundId,
        units: args.units,
        avgNav: mutualFund.currentNav,
        totalInvested: totalCost,
        createdAt: now,
        updatedAt: now,
      });

      holding = await ctx.db.get(holdingId);
    }

    // Create transaction record
    await ctx.db.insert("transactions", {
      userId: args.userId,
      type: "buy_mf",
      amount: totalCost,
      description: `Bought ${args.units.toFixed(4)} units of ${mutualFund.schemeName} @ ₹${mutualFund.currentNav.toFixed(2)}`,
      relatedAssetId: args.mutualFundId,
      relatedAssetName: mutualFund.schemeName,
      quantity: args.units,
      pricePerUnit: mutualFund.currentNav,
      balanceBefore,
      balanceAfter,
      createdAt: now,
    });

    return {
      success: true,
      newBalance: balanceAfter,
      holding,
      message: `Successfully purchased ${args.units.toFixed(4)} units of ${mutualFund.schemeName}`,
    };
  },
});

/**
 * Sell mutual fund units
 * Validates ownership, adds proceeds to wallet, updates/removes holding, creates transaction
 */
export const sellMutualFund = mutation({
  args: {
    userId: v.id("users"),
    holdingId: v.id("userMutualFundHoldings"),
    units: v.number(),
  },
  handler: async (ctx, args) => {
    // Validate units
    if (args.units <= 0) {
      throw new Error("Units must be greater than 0");
    }

    // Get holding
    const holding = await ctx.db.get(args.holdingId);
    if (!holding) {
      throw new Error("Holding not found");
    }

    // Verify ownership
    if (holding.userId !== args.userId) {
      throw new Error("Unauthorized: This holding does not belong to you");
    }

    // Validate sufficient units
    if (holding.units < args.units) {
      throw new Error(
        `Insufficient units. You own ${holding.units.toFixed(4)} units, trying to sell ${args.units.toFixed(4)}`
      );
    }

    // Get mutual fund details
    const mutualFund = await ctx.db.get(holding.mutualFundId);
    if (!mutualFund) {
      throw new Error("Mutual fund not found");
    }

    if (!mutualFund.currentNav || mutualFund.currentNav <= 0) {
      throw new Error("Mutual fund NAV not available");
    }

    // Calculate proceeds
    const proceeds = args.units * mutualFund.currentNav;

    // Get user's wallet
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    const now = Date.now();
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + proceeds;

    // Update wallet balance
    await ctx.db.patch(wallet._id, {
      balance: balanceAfter,
      totalEarned: wallet.totalEarned + proceeds,
      lastUpdatedAt: now,
    });

    // Update or remove holding
    if (holding.units === args.units) {
      // Selling all units - remove holding
      await ctx.db.delete(args.holdingId);
    } else {
      // Partial sale - update holding
      const newUnits = holding.units - args.units;
      const soldInvestment = (holding.totalInvested / holding.units) * args.units;
      const newTotalInvested = holding.totalInvested - soldInvestment;

      await ctx.db.patch(args.holdingId, {
        units: newUnits,
        totalInvested: newTotalInvested,
        updatedAt: now,
      });
    }

    // Create transaction record
    await ctx.db.insert("transactions", {
      userId: args.userId,
      type: "sell_mf",
      amount: proceeds,
      description: `Sold ${args.units.toFixed(4)} units of ${mutualFund.schemeName} @ ₹${mutualFund.currentNav.toFixed(2)}`,
      relatedAssetId: holding.mutualFundId,
      relatedAssetName: mutualFund.schemeName,
      quantity: args.units,
      pricePerUnit: mutualFund.currentNav,
      balanceBefore,
      balanceAfter,
      createdAt: now,
    });

    return {
      success: true,
      newBalance: balanceAfter,
      proceeds,
      message: `Successfully sold ${args.units.toFixed(4)} units of ${mutualFund.schemeName}`,
    };
  },
});
