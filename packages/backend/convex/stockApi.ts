import { action } from "./_generated/server";
import { v } from "convex/values";

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
