import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const INDIAN_STOCK_API_URL = "https://stock.indianapi.in";

// Helper to fetch from Indian Stock API
async function fetchFromApi(endpoint: string, params: Record<string, string>) {
  const url = new URL(`${INDIAN_STOCK_API_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const apiKey = process.env.INDIAN_STOCK_API_KEY;
  if (!apiKey) {
    throw new Error("INDIAN_STOCK_API_KEY is not configured");
  }

  const response = await fetch(url.toString(), {
    headers: {
      "x-api-key": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Search for stocks by name
export const searchStocks = action({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    try {
      const data = await fetchFromApi("/stock", { name: args.query });

      if (!data) return null;

      // Return normalized stock data
      return {
        symbol: data.companyProfile?.exchangeCodeNse || data.companyProfile?.exchangeCodeBse || args.query.toUpperCase(),
        companyName: data.companyName || args.query,
        industry: data.industry || null,
        exchange: data.companyProfile?.exchangeCodeNse ? "NSE" : "BSE",
        currentPrice: data.currentPrice?.NSE ? parseFloat(data.currentPrice.NSE) :
          data.currentPrice?.BSE ? parseFloat(data.currentPrice.BSE) : null,
        percentChange: data.percentChange ? parseFloat(data.percentChange) : null,
        yearHigh: data.yearHigh ? parseFloat(data.yearHigh) : null,
        yearLow: data.yearLow ? parseFloat(data.yearLow) : null,
        raw: data, // Include raw data for additional details
      };
    } catch (error) {
      console.error("Stock search error:", error);
      return null;
    }
  },
});

// Search for mutual funds
export const searchMutualFunds = action({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    try {
      const data = await fetchFromApi("/mutual_fund_search", { query: args.query });

      if (!data || !Array.isArray(data)) return [];

      // Return array of mutual fund search results
      return data.map((fund: any) => ({
        schemeId: fund.id,
        schemeName: fund.schemeName,
        isin: fund.isin,
        schemeType: fund.schemeType,
        categoryId: fund.categoryId,
      }));
    } catch (error) {
      console.error("Mutual fund search error:", error);
      return [];
    }
  },
});

// Get detailed mutual fund information
export const getMutualFundDetails = action({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    try {
      const data = await fetchFromApi("/mutual_funds_details", { stock_name: args.name });

      if (!data) return null;

      return {
        fundName: data.basic_info?.fund_name,
        category: data.basic_info?.category,
        riskLevel: data.basic_info?.risk_level,
        planType: data.basic_info?.plan_type,
        schemeType: data.basic_info?.scheme_type,
        inceptionDate: data.basic_info?.inception_date,
        benchmark: data.basic_info?.benchmark,
        fundSize: data.basic_info?.fund_size,
        fundManager: data.basic_info?.fund_manager,
        currentNav: data.nav_info?.current_nav,
        navDate: data.nav_info?.nav_date,
        returns: data.returns,
        expenseRatio: data.expense_ratio?.current,
        raw: data,
      };
    } catch (error) {
      console.error("Mutual fund details error:", error);
      return null;
    }
  },
});

// Internal mutation to save historical data
export const saveHistoricalData = internalMutation({
  args: {
    stockId: v.id("stocks"),
    dataPoints: v.array(
      v.object({
        date: v.string(),
        price: v.number(),
        dma50: v.optional(v.number()),
        dma200: v.optional(v.number()),
        volume: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Insert all data points
    for (const point of args.dataPoints) {
      await ctx.db.insert("stockHistoricalData", {
        stockId: args.stockId,
        ...point,
      });
    }

    // Mark stock as having historical data
    await ctx.db.patch(args.stockId, { hasHistoricalData: true });

    return args.dataPoints.length;
  },
});

// Fetch historical data for a stock (can be called from frontend for individual stock)
export const fetchStockHistoricalData = action({
  args: { stockId: v.id("stocks"), stockName: v.string() },
  handler: async (ctx, args): Promise<{ success: boolean; count?: number; error?: string }> => {
    try {
      const data = await fetchFromApi("/historical_data", {
        stock_name: args.stockName,
        period: "5yr",
        filter: "price",
      });

      if (!data || !data.datasets) {
        return { success: false, error: "No data returned" };
      }

      // Find the price dataset
      const priceDataset = data.datasets.find((d: any) => d.metric === "Price");

      if (!priceDataset?.values) {
        return { success: false, error: "No price data found" };
      }

      // Build data points array (only price data with filter=price)
      const dataPoints: {
        date: string;
        price: number;
      }[] = [];

      for (const [date, priceStr] of priceDataset.values) {
        const price = parseFloat(priceStr);
        if (isNaN(price)) continue;

        dataPoints.push({
          date,
          price,
        });
      }

      // Save to database using internal mutation
      const count = await ctx.runMutation(internal.stockApi.saveHistoricalData, {
        stockId: args.stockId,
        dataPoints,
      });

      return { success: true, count };
    } catch (error) {
      console.error("Historical data fetch error:", error);
      return { success: false, error: String(error) };
    }
  },
});

// Internal query to get stocks without historical data
import { internalQuery } from "./_generated/server";

export const getStocksWithoutHistory = internalQuery({
  args: {},
  handler: async (ctx) => {
    const stocks = await ctx.db.query("stocks").collect();
    return stocks.filter((s) => !s.hasHistoricalData);
  },
});

// Fetch historical data for all stocks that don't have it yet
export const fetchAllHistoricalData = action({
  args: {},
  handler: async (ctx): Promise<{
    total: number;
    results: { symbol: string; success: boolean; count?: number; error?: string }[];
  }> => {
    // Get all stocks without historical data
    const stocks = await ctx.runQuery(internal.stockApi.getStocksWithoutHistory);

    const results: { symbol: string; success: boolean; count?: number; error?: string }[] = [];

    for (const stock of stocks) {
      try {
        // Fetch historical data for this stock (price only)
        const data = await fetchFromApi("/historical_data", {
          stock_name: stock.companyName,
          period: "5yr",
          filter: "price",
        });

        if (!data || !data.datasets) {
          results.push({ symbol: stock.symbol, success: false, error: "No data returned" });
          continue;
        }

        const priceDataset = data.datasets.find((d: any) => d.metric === "Price");

        if (!priceDataset?.values) {
          results.push({ symbol: stock.symbol, success: false, error: "No price data" });
          continue;
        }

        const dataPoints: {
          date: string;
          price: number;
        }[] = [];

        for (const [date, priceStr] of priceDataset.values) {
          const price = parseFloat(priceStr);
          if (isNaN(price)) continue;

          dataPoints.push({
            date,
            price,
          });
        }

        const count = await ctx.runMutation(internal.stockApi.saveHistoricalData, {
          stockId: stock._id,
          dataPoints,
        });

        results.push({ symbol: stock.symbol, success: true, count });
      } catch (error) {
        results.push({ symbol: stock.symbol, success: false, error: String(error) });
      }
    }

    return { total: stocks.length, results };
  },
});
