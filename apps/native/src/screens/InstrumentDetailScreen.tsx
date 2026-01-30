import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";
import { useQuery, useMutation } from "convex/react";
import Toast from "react-native-toast-message";
import { api } from "../../../../packages/backend/convex/_generated/api";
import { Id } from "../../../../packages/backend/convex/_generated/dataModel";
import { PriceChart } from "../components/PriceChart";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { BuyModal } from "./modals/BuyModal";
import { useUserWallet } from "../hooks/useUserWallet";

export default function InstrumentDetailScreen({ route, navigation }: any) {
  const { user } = useUser();
  const userId = user?.id;
  const { instrumentId, type, name, symbol, price } = route.params;

  const [buyModalVisible, setBuyModalVisible] = useState(false);

  // Queries
  const wallet = useUserWallet(userId);
  const isInWatchlistQuery = useQuery(
    api.watchlist.isInWatchlist,
    userId
      ? { userId: userId as Id<"users">, instrumentType: type, instrumentId }
      : "skip",
  );

  // Historical Data
  const stockHistoricalData = useQuery(
    api.stocks.getHistoricalData,
    type === "stock" ? { stockId: instrumentId as Id<"stocks"> } : "skip",
  );

  const mfHistoricalData = useQuery(
    api.mutualFunds.getHistoricalData,
    type === "mutualFund"
      ? { mutualFundId: instrumentId as Id<"mutualFunds"> }
      : "skip",
  );

  const historicalResponse =
    type === "stock" ? stockHistoricalData : mfHistoricalData;
  const historicalData = historicalResponse?.data;

  const toggleWatchlist = useMutation(api.watchlist.toggleWatchlist);

  const handleToggleWatchlist = async () => {
    try {
      await toggleWatchlist({
        userId: userId as Id<"users">,
        instrumentType: type,
        instrumentId,
      });
      Toast.show({
        type: "success",
        text1: isInWatchlistQuery
          ? "Removed from Watchlist"
          : "Added to Watchlist",
      });
    } catch (error) {
      Toast.show({ type: "error", text1: "Action failed" });
    }
  };

  const chartData = historicalData?.map((d: any) => d.close) || [
    price * 0.95,
    price * 0.97,
    price * 0.96,
    price * 0.98,
    price * 0.99,
    price,
  ]; // Mock fallback

  const chartLabels = historicalData?.map((d: any) =>
    new Date(d.date).getDate().toString(),
  ) || ["1", "2", "3", "4", "5", "6"];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={RFValue(24)} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {name}
        </Text>
        <TouchableOpacity
          onPress={handleToggleWatchlist}
          style={styles.watchButton}
        >
          <Ionicons
            name={isInWatchlistQuery ? "star" : "star-outline"}
            size={RFValue(24)}
            color={isInWatchlistQuery ? "#ffc107" : "#333"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.priceContainer}>
          <Text style={styles.symbol}>{symbol}</Text>
          <Text style={styles.price}>
            ₹{price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </Text>
          <Text style={[styles.change, { color: "#4caf50" }]}>
            +2.5% (Today)
          </Text>
        </View>

        <View style={styles.chartContainer}>
          <PriceChart
            data={chartData}
            labels={chartLabels}
            color={type === "stock" ? "#0D87E1" : "#2e7d32"}
          />
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Key Statistics</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Open</Text>
            <Text style={styles.statValue}>₹{(price * 0.98).toFixed(2)}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>High</Text>
            <Text style={styles.statValue}>₹{(price * 1.02).toFixed(2)}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Low</Text>
            <Text style={styles.statValue}>₹{(price * 0.97).toFixed(2)}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Prev. Close</Text>
            <Text style={styles.statValue}>₹{(price * 0.95).toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.buyButton}
          onPress={() => setBuyModalVisible(true)}
        >
          <Text style={styles.buyButtonText}>
            Buy {type === "stock" ? "Shares" : "Units"}
          </Text>
        </TouchableOpacity>
      </View>

      <BuyModal
        isVisible={buyModalVisible}
        onClose={() => setBuyModalVisible(false)}
        userId={userId}
        instrumentType={type}
        instrumentId={instrumentId}
        instrumentName={name}
        currentPrice={price}
        walletBalance={wallet?.balance || 0}
        onSuccess={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16, // SafeArea handled by Navigation usually or wrapper
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: RFValue(16),
    fontFamily: "SemiBold",
    color: "#333",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  watchButton: {
    padding: 4,
  },
  content: {
    paddingBottom: 80,
  },
  priceContainer: {
    padding: 24,
    alignItems: "center",
  },
  symbol: {
    fontSize: RFValue(14),
    fontFamily: "Medium",
    color: "#666",
    marginBottom: 4,
  },
  price: {
    fontSize: RFValue(32),
    fontFamily: "Bold",
    color: "#333",
  },
  change: {
    fontSize: RFValue(14),
    fontFamily: "Medium",
    marginTop: 4,
  },
  chartContainer: {
    marginBottom: 24,
  },
  statsContainer: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    marginHorizontal: 16,
    borderRadius: 12,
  },
  statsTitle: {
    fontSize: RFValue(16),
    fontFamily: "SemiBold",
    color: "#333",
    marginBottom: 16,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statLabel: {
    fontSize: RFValue(14),
    fontFamily: "Regular",
    color: "#666",
  },
  statValue: {
    fontSize: RFValue(14),
    fontFamily: "Medium",
    color: "#333",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  buyButton: {
    backgroundColor: "#0D87E1",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buyButtonText: {
    color: "#fff",
    fontSize: RFValue(16),
    fontFamily: "Bold",
  },
});
