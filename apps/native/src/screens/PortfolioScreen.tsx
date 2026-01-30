import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  useWindowDimensions,
  ScrollView,
  RefreshControl,
} from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useUser } from "@clerk/clerk-expo";
import { RFValue } from "react-native-responsive-fontsize";
import {
  useUserPortfolio,
  usePortfolioSummary,
} from "../hooks/useUserPortfolio";
import { PortfolioSummary } from "../components/PortfolioSummary";
import { HoldingCard } from "../components/HoldingCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import { BuyModal } from "./modals/BuyModal";
import { SellModal } from "./modals/SellModal";
import { useUserWallet } from "../hooks/useUserWallet";

export default function PortfolioScreen() {
  const { user } = useUser();
  const userId = user?.id;
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "stocks", title: "Stocks" },
    { key: "mfs", title: "Mutual Funds" },
    { key: "all", title: "Combined" },
  ]);

  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [buyModalVisible, setBuyModalVisible] = useState(false);
  const [sellModalVisible, setSellModalVisible] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState<any>(null);

  // Data
  // Data
  const portfolioData = useUserPortfolio(userId);
  const summaryData = usePortfolioSummary(userId);
  const wallet = useUserWallet(userId);

  const portfolio = portfolioData || {
    stocks: [],
    mutualFunds: [],
  };

  const summary = summaryData || {
    totalInvested: 0,
    totalCurrentValue: 0,
    totalGainLoss: 0,
    totalGainLossPercent: 0,
  };

  const isLoading = portfolioData === undefined || summaryData === undefined;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleBuy = (holding: any, type: "stock" | "mutualFund") => {
    // For buy modal: instrumentId, name, price needed.
    // Holding usually has stockId/mutualFundId and currentPrice
    setSelectedHolding({
      ...holding,
      type,
      // Ensure we pass the ID correctly based on type
      instrumentId: type === "stock" ? holding.stockId : holding.mutualFundId,
    });
    setBuyModalVisible(true);
  };

  const handleSell = (holding: any, type: "stock" | "mutualFund") => {
    setSelectedHolding({
      ...holding,
      type,
      // Ensure we pass the ID correctly
      instrumentId: type === "stock" ? holding.stockId : holding.mutualFundId,
    });
    setSellModalVisible(true);
  };

  const renderHoldingsList = (
    holdings: any[],
    type?: "stock" | "mutualFund",
  ) => {
    if (holdings.length === 0) {
      return (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <EmptyState
            message="No holdings found in this category"
            icon="pie-chart-outline"
          />
        </ScrollView>
      );
    }

    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {holdings.map((holding: any) => {
          // If combined view, we need to know the type from the item or pass it
          // Assuming combined list might need normalized data or check structure.
          // Since we separate them below, we know the type.
          // But for combined, we concat.
          const itemType = type || (holding.stockId ? "stock" : "mutualFund");

          return (
            <HoldingCard
              key={holding._id}
              name={
                holding.name ||
                holding.stockName ||
                holding.mutualFundName ||
                "Unknown"
              }
              symbol={
                holding.symbol || holding.stockSymbol || holding.category || ""
              }
              quantity={holding.quantity || holding.units}
              currentPrice={holding.currentPrice || holding.nav}
              profitAndLoss={holding.profitAndLoss || 0}
              profitAndLossPercentage={holding.profitAndLossPercentage || 0}
              type={itemType}
              onBuy={() => handleBuy(holding, itemType)}
              onSell={() => handleSell(holding, itemType)}
            />
          );
        })}
      </ScrollView>
    );
  };

  const StocksRoute = () => renderHoldingsList(portfolio.stocks, "stock");

  const MutualFundsRoute = () =>
    renderHoldingsList(portfolio.mutualFunds, "mutualFund");

  const AllRoute = () => {
    // Basic merge for combined view
    const allHoldings = [...portfolio.stocks, ...portfolio.mutualFunds];
    // Sort by value or name? Let's just list them.
    return renderHoldingsList(allHoldings);
  };

  const renderScene = SceneMap({
    stocks: StocksRoute,
    mfs: MutualFundsRoute,
    all: AllRoute,
  });

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: "#0D87E1" }}
      style={{ backgroundColor: "#fff" }}
      labelStyle={{
        color: "#333",
        fontSize: RFValue(12),
        fontFamily: "SemiBold",
      }}
      activeColor="#0D87E1"
      inactiveColor="#999"
    />
  );

  if (isLoading) return <LoadingSpinner message="Loading portfolio..." />;

  return (
    <View style={styles.container}>
      <PortfolioSummary
        investedValue={summary.totalInvested}
        currentValue={summary.totalCurrentValue}
        totalProfitAndLoss={summary.totalGainLoss}
        totalProfitAndLossPercentage={summary.totalGainLossPercent}
      />

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
        style={styles.tabView}
      />

      {/* Modals */}
      {selectedHolding && (
        <>
          <BuyModal
            isVisible={buyModalVisible}
            onClose={() => setBuyModalVisible(false)}
            userId={userId}
            instrumentType={selectedHolding.type}
            instrumentId={selectedHolding.instrumentId} // We set this in handleBuy
            instrumentName={
              selectedHolding.name ||
              selectedHolding.stockName ||
              selectedHolding.mutualFundName
            }
            currentPrice={selectedHolding.currentPrice || selectedHolding.nav}
            walletBalance={wallet?.balance || 0}
            onSuccess={() => {}} // Query auto updates
          />
          <SellModal
            isVisible={sellModalVisible}
            onClose={() => setSellModalVisible(false)}
            userId={userId}
            instrumentType={selectedHolding.type}
            holdingId={selectedHolding._id}
            instrumentName={
              selectedHolding.name ||
              selectedHolding.stockName ||
              selectedHolding.mutualFundName
            }
            currentPrice={selectedHolding.currentPrice || selectedHolding.nav}
            ownedQuantity={selectedHolding.quantity || selectedHolding.units}
            onSuccess={() => {}} // Query auto updates
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  tabView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
});
