"use client";

import { useUser } from "@clerk/clerk-react";
import PriceTable from "./components/PriceTable";
import InstrumentCard from "./components/InstrumentCard";

export default function Dashboard() {
  const { user } = useUser();

  // TODO: Replace with actual data fetching once backend is restored
  const instruments: any[] = [];
  const prices: any[] = [];

  // Calculate Summary Stats
  const totalInstruments = instruments?.length || 0;

  let topGainer = { symbol: "-", changePercent: 0 };
  let topLoser = { symbol: "-", changePercent: 0 };

  if (prices && prices.length > 0) {
    const sortedByGain = [...prices].sort(
      (a, b) => (b.changePercent || 0) - (a.changePercent || 0),
    );
    if (sortedByGain.length > 0) {
      topGainer = {
        symbol: sortedByGain[0].symbol,
        changePercent: sortedByGain[0].changePercent || 0,
      };
      topLoser = {
        symbol: sortedByGain[sortedByGain.length - 1].symbol,
        changePercent: sortedByGain[sortedByGain.length - 1].changePercent || 0,
      };
    }
  }

  // Filter prices to only those in the instruments list (if valid)
  const instrumentIds = new Set(instruments?.map((i) => i._id));
  const displayedPrices = prices?.filter((p) =>
    instrumentIds.has(p.instrumentId),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Market Overview</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back, {user?.firstName}!
          </p>
        </div>
        <div className="flex items-center gap-4">
          {prices && prices.length > 0 && (
            <span className="text-xs text-gray-500">
              Last updated: {new Date(prices[0].updatedAt).toLocaleTimeString()}
            </span>
          )}
          {/* RefreshButton removed - backend not available */}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <InstrumentCard title="Total Instruments" value={totalInstruments} />
        <InstrumentCard
          title="Top Gainer"
          value={topGainer.symbol}
          trend={topGainer.changePercent > 0 ? "up" : "neutral"}
          trendValue={`${topGainer.changePercent.toFixed(2)}%`}
        />
        <InstrumentCard
          title="Top Loser"
          value={topLoser.symbol}
          trend={topLoser.changePercent < 0 ? "down" : "neutral"}
          trendValue={`${topLoser.changePercent.toFixed(2)}%`}
        />
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          Live Markets
        </h3>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <PriceTable prices={displayedPrices} />
        </div>
      </div>
    </div>
  );
}
