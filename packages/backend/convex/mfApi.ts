"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const MFAPI_BASE_URL = "https://api.mfapi.in";

// Helper to fetch from MFAPI
async function fetchFromMfapi(endpoint: string): Promise<any> {
  const url = `${MFAPI_BASE_URL}${endpoint}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`MFAPI error: ${response.status}`);
  }
  return response.json();
}

// Search for a mutual fund scheme by name
export const searchScheme = action({
  args: { query: v.string() },
  handler: async (_ctx, args): Promise<{ schemeCode: number; schemeName: string }[]> => {
    const results = await fetchFromMfapi(`/mf/search?q=${encodeURIComponent(args.query)}`);
    return results || [];
  },
});

// Find the best matching scheme code (prefer Regular Plan Growth)
function findBestScheme(
  schemes: { schemeCode: number; schemeName: string }[],
  targetName: string
): { schemeCode: number; schemeName: string } | null {
  if (schemes.length === 0) return null;
  if (schemes.length === 1) return schemes[0];

  // Try to find Regular Plan Growth first
  let bestMatch = schemes.find((s) => {
    const name = s.schemeName.toLowerCase();
    return name.includes("regular") && name.includes("growth") && !name.includes("direct");
  });

  if (bestMatch) return bestMatch;

  // If no Regular Growth, try just Regular
  bestMatch = schemes.find((s) => {
    const name = s.schemeName.toLowerCase();
    return name.includes("regular") && !name.includes("direct");
  });

  if (bestMatch) return bestMatch;

  // If no Regular, try Growth
  bestMatch = schemes.find((s) => {
    const name = s.schemeName.toLowerCase();
    return name.includes("growth");
  });

  if (bestMatch) return bestMatch;

  // Otherwise return the first result
  return schemes[0];
}

// Fetch historical data for a mutual fund
export const fetchMfHistoricalData = action({
  args: { mutualFundId: v.id("mutualFunds"), schemeName: v.string() },
  handler: async (ctx, args): Promise<{ success: boolean; count?: number; error?: string }> => {
    try {
      // Search for the scheme on MFAPI
      const searchResults = await fetchFromMfapi(`/mf/search?q=${encodeURIComponent(args.schemeName)}`);

      if (!searchResults || searchResults.length === 0) {
        return { success: false, error: "No matching scheme found on MFAPI" };
      }

      // Find the best matching scheme (Regular Plan Growth preferred)
      const bestScheme = findBestScheme(searchResults, args.schemeName);
      if (!bestScheme) {
        return { success: false, error: "Could not find a suitable scheme" };
      }

      // Fetch historical NAV data
      const navData = await fetchFromMfapi(`/mf/${bestScheme.schemeCode}`);

      if (!navData || navData.status !== "SUCCESS" || !navData.data) {
        return { success: false, error: "Failed to fetch NAV history" };
      }

      // Parse the NAV data - MFAPI uses DD-MM-YYYY format
      const dataPoints: { date: string; nav: number }[] = [];
      for (const item of navData.data) {
        const nav = parseFloat(item.nav);
        if (isNaN(nav)) continue;

        // Convert DD-MM-YYYY to YYYY-MM-DD for consistency
        const [day, month, year] = item.date.split("-");
        const isoDate = `${year}-${month}-${day}`;

        dataPoints.push({
          date: isoDate,
          nav,
        });
      }

      // Save to database
      const count = await ctx.runMutation(internal.mfInternal.saveMfHistoricalData, {
        mutualFundId: args.mutualFundId,
        mfapiSchemeCode: bestScheme.schemeCode,
        dataPoints,
      });

      return { success: true, count };
    } catch (error) {
      console.error("MF historical data fetch error:", error);
      return { success: false, error: String(error) };
    }
  },
});

// Fetch historical data for all mutual funds that don't have it
export const fetchAllMfHistoricalData = action({
  args: {},
  handler: async (ctx): Promise<{
    total: number;
    results: { schemeName: string; success: boolean; count?: number; error?: string }[];
  }> => {
    // Get all MFs without historical data
    const mfs = await ctx.runQuery(internal.mfInternal.getMfsWithoutHistory);

    const results: { schemeName: string; success: boolean; count?: number; error?: string }[] = [];

    for (const mf of mfs) {
      try {
        // Search for the scheme on MFAPI
        const searchResults = await fetchFromMfapi(`/mf/search?q=${encodeURIComponent(mf.schemeName)}`);

        if (!searchResults || searchResults.length === 0) {
          results.push({ schemeName: mf.schemeName, success: false, error: "No match found" });
          continue;
        }

        // Find the best matching scheme
        const bestScheme = findBestScheme(searchResults, mf.schemeName);
        if (!bestScheme) {
          results.push({ schemeName: mf.schemeName, success: false, error: "No suitable scheme" });
          continue;
        }

        // Fetch historical NAV data
        const navData = await fetchFromMfapi(`/mf/${bestScheme.schemeCode}`);

        if (!navData || navData.status !== "SUCCESS" || !navData.data) {
          results.push({ schemeName: mf.schemeName, success: false, error: "Failed to fetch NAV" });
          continue;
        }

        // Parse the NAV data
        const dataPoints: { date: string; nav: number }[] = [];
        for (const item of navData.data) {
          const nav = parseFloat(item.nav);
          if (isNaN(nav)) continue;

          const [day, month, year] = item.date.split("-");
          const isoDate = `${year}-${month}-${day}`;

          dataPoints.push({
            date: isoDate,
            nav,
          });
        }

        // Save to database
        const count = await ctx.runMutation(internal.mfInternal.saveMfHistoricalData, {
          mutualFundId: mf._id,
          mfapiSchemeCode: bestScheme.schemeCode,
          dataPoints,
        });

        results.push({ schemeName: mf.schemeName, success: true, count });
      } catch (error) {
        results.push({ schemeName: mf.schemeName, success: false, error: String(error) });
      }
    }

    return { total: mfs.length, results };
  },
});
