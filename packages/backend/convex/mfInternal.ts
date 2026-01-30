import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// Internal mutation to save historical NAV data
export const saveMfHistoricalData = internalMutation({
  args: {
    mutualFundId: v.id("mutualFunds"),
    mfapiSchemeCode: v.number(),
    dataPoints: v.array(
      v.object({
        date: v.string(),
        nav: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Update the mutual fund with the scheme code and flag
    await ctx.db.patch(args.mutualFundId, {
      mfapiSchemeCode: args.mfapiSchemeCode,
      hasHistoricalData: true,
    });

    // Insert all historical data points
    for (const point of args.dataPoints) {
      await ctx.db.insert("mutualFundHistoricalData", {
        mutualFundId: args.mutualFundId,
        date: point.date,
        nav: point.nav,
      });
    }

    return args.dataPoints.length;
  },
});

// Internal query to get mutual funds without historical data
export const getMfsWithoutHistory = internalQuery({
  args: {},
  handler: async (ctx) => {
    const mfs = await ctx.db.query("mutualFunds").collect();
    return mfs.filter((mf) => !mf.hasHistoricalData);
  },
});
