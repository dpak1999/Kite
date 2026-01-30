import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Yahoo Finance API endpoints
const YAHOO_QUOTE_URL = "https://query1.finance.yahoo.com/v8/finance/chart/";
const YAHOO_SEARCH_URL = "https://query1.finance.yahoo.com/v1/finance/search";

interface YahooQuoteResult {
  price: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  change: number;
  changePercent: number;
}

interface YahooHistoryItem {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Fetch quote from Yahoo Finance
async function fetchYahooQuote(symbol: string): Promise<YahooQuoteResult | null> {
  try {
    const url = `${YAHOO_QUOTE_URL}${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) {
      console.error(`Yahoo Finance error for ${symbol}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];

    if (!result) {
      console.error(`No data for ${symbol}`);
      return null;
    }

    const meta = result.meta;
    const quote = result.indicators?.quote?.[0];

    return {
      price: meta.regularMarketPrice || 0,
      previousClose: meta.previousClose || meta.chartPreviousClose || 0,
      open: quote?.open?.[0] || meta.regularMarketPrice || 0,
      high: quote?.high?.[0] || meta.regularMarketPrice || 0,
      low: quote?.low?.[0] || meta.regularMarketPrice || 0,
      volume: quote?.volume?.[0] || 0,
      change: (meta.regularMarketPrice || 0) - (meta.previousClose || 0),
      changePercent:
        meta.previousClose > 0
          ? (((meta.regularMarketPrice || 0) - meta.previousClose) /
              meta.previousClose) *
            100
          : 0,
    };
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return null;
  }
}

// Fetch historical data from Yahoo Finance
async function fetchYahooHistory(
  symbol: string,
  range: string = "1mo"
): Promise<YahooHistoryItem[]> {
  try {
    const url = `${YAHOO_QUOTE_URL}${encodeURIComponent(symbol)}?interval=1d&range=${range}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) {
      console.error(`Yahoo Finance history error for ${symbol}: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];

    if (!result) {
      return [];
    }

    const timestamps = result.timestamp || [];
    const quote = result.indicators?.quote?.[0] || {};

    const history: YahooHistoryItem[] = [];

    for (let i = 0; i < timestamps.length; i++) {
      const date = new Date(timestamps[i] * 1000).toISOString().split("T")[0];

      if (quote.open?.[i] != null && quote.close?.[i] != null) {
        history.push({
          date,
          open: quote.open[i],
          high: quote.high?.[i] || quote.open[i],
          low: quote.low?.[i] || quote.open[i],
          close: quote.close[i],
          volume: quote.volume?.[i] || 0,
        });
      }
    }

    return history;
  } catch (error) {
    console.error(`Error fetching history for ${symbol}:`, error);
    return [];
  }
}

// Refresh current prices for all instruments
export const refreshAllPrices = action({
  args: {},
  handler: async (ctx) => {
    // Get all active instruments
    const instruments = await ctx.runQuery(
      internal.instrumentsInternal.listAll
    );

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const instrument of instruments) {
      const quote = await fetchYahooQuote(instrument.symbol);

      if (quote) {
        await ctx.runMutation(internal.prices.updatePrice, {
          instrumentId: instrument._id,
          symbol: instrument.symbol,
          price: quote.price,
          previousClose: quote.previousClose,
          open: quote.open,
          high: quote.high,
          low: quote.low,
          volume: quote.volume,
          change: quote.change,
          changePercent: quote.changePercent,
        });

        // Update lastUpdated on instrument
        await ctx.runMutation(internal.instrumentsInternal.updateLastUpdated, {
          id: instrument._id,
        });

        results.success++;
      } else {
        results.failed++;
        results.errors.push(instrument.symbol);
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return results;
  },
});

// Refresh price for a single instrument
export const refreshPrice = action({
  args: { symbol: v.string() },
  handler: async (ctx, args) => {
    const instrument = await ctx.runQuery(
      internal.instrumentsInternal.getBySymbol,
      { symbol: args.symbol }
    );

    if (!instrument) {
      throw new Error(`Instrument not found: ${args.symbol}`);
    }

    const quote = await fetchYahooQuote(args.symbol);

    if (!quote) {
      throw new Error(`Failed to fetch quote for ${args.symbol}`);
    }

    await ctx.runMutation(internal.prices.updatePrice, {
      instrumentId: instrument._id,
      symbol: args.symbol,
      price: quote.price,
      previousClose: quote.previousClose,
      open: quote.open,
      high: quote.high,
      low: quote.low,
      volume: quote.volume,
      change: quote.change,
      changePercent: quote.changePercent,
    });

    await ctx.runMutation(internal.instrumentsInternal.updateLastUpdated, {
      id: instrument._id,
    });

    return quote;
  },
});

// Fetch and store historical data for an instrument
export const fetchHistory = action({
  args: {
    symbol: v.string(),
    range: v.optional(v.string()), // "1mo", "3mo", "6mo", "1y", "2y", "5y"
  },
  handler: async (ctx, args) => {
    const instrument = await ctx.runQuery(
      internal.instrumentsInternal.getBySymbol,
      { symbol: args.symbol }
    );

    if (!instrument) {
      throw new Error(`Instrument not found: ${args.symbol}`);
    }

    const history = await fetchYahooHistory(args.symbol, args.range || "1mo");

    if (history.length === 0) {
      throw new Error(`No history data for ${args.symbol}`);
    }

    // Store each history item
    for (const item of history) {
      await ctx.runMutation(internal.prices.addHistoricalPrice, {
        instrumentId: instrument._id,
        symbol: args.symbol,
        date: item.date,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
      });
    }

    return { count: history.length };
  },
});

// Fetch history for all instruments
export const fetchAllHistory = action({
  args: {
    range: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const instruments = await ctx.runQuery(
      internal.instrumentsInternal.listAll
    );

    const results = {
      success: 0,
      failed: 0,
      totalRecords: 0,
    };

    for (const instrument of instruments) {
      try {
        const history = await fetchYahooHistory(
          instrument.symbol,
          args.range || "1mo"
        );

        for (const item of history) {
          await ctx.runMutation(internal.prices.addHistoricalPrice, {
            instrumentId: instrument._id,
            symbol: instrument.symbol,
            date: item.date,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            volume: item.volume,
          });
        }

        results.success++;
        results.totalRecords += history.length;
      } catch (error) {
        results.failed++;
      }

      // Delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return results;
  },
});

// Search for instruments on Yahoo Finance
export const searchInstruments = action({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    try {
      const url = `${YAHOO_SEARCH_URL}?q=${encodeURIComponent(args.query)}&quotesCount=10&newsCount=0`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      const quotes = data.quotes || [];

      return quotes.map((q: any) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        type: q.quoteType?.toLowerCase() || "stock",
        exchange: q.exchange,
      }));
    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  },
});
