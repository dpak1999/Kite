import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

interface HoldingCardProps {
  name: string;
  symbol: string;
  quantity: number;
  currentPrice: number;
  profitAndLoss: number;
  profitAndLossPercentage: number;
  onBuy: () => void;
  onSell: () => void;
  type: "stock" | "mutualFund";
}

export const HoldingCard: React.FC<HoldingCardProps> = ({
  name,
  symbol,
  quantity,
  currentPrice,
  profitAndLoss,
  profitAndLossPercentage,
  onBuy,
  onSell,
  type,
}) => {
  const currentValue = currentPrice * quantity;
  const isProfit = profitAndLoss >= 0;
  const plColor = isProfit ? "#4caf50" : "#f44336";

  const formattedCurrentValue = `₹${currentValue.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const formattedPL = `${isProfit ? "+" : ""}₹${Math.abs(
    profitAndLoss,
  ).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const formattedPercent = `${isProfit ? "+" : ""}${profitAndLossPercentage.toFixed(2)}%`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.symbol}>{symbol}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.value}>{formattedCurrentValue}</Text>
          <Text style={[styles.pl, { color: plColor }]}>
            {formattedPL} ({formattedPercent})
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.detailText}>
          {quantity} {type === "stock" ? "Shares" : "Units"} @ ₹
          {currentPrice.toFixed(2)}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.buyButton]}
          onPress={onBuy}
        >
          <Text style={styles.buyButtonText}>Buy More</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.sellButton]}
          onPress={onSell}
        >
          <Text style={styles.sellButtonText}>Sell</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  symbol: {
    fontSize: RFValue(14),
    fontFamily: "Bold",
    color: "#333",
  },
  name: {
    fontSize: RFValue(12),
    fontFamily: "Regular",
    color: "#666",
    maxWidth: 150,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  value: {
    fontSize: RFValue(14),
    fontFamily: "SemiBold",
    color: "#333",
  },
  pl: {
    fontSize: RFValue(12),
    fontFamily: "Medium",
    marginTop: 2,
  },
  details: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  detailText: {
    fontSize: RFValue(12),
    fontFamily: "Regular",
    color: "#999",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  buyButton: {
    backgroundColor: "#e3f2fd",
  },
  buyButtonText: {
    color: "#0D87E1",
    fontSize: RFValue(12),
    fontFamily: "SemiBold",
  },
  sellButton: {
    backgroundColor: "#f5f5f5",
  },
  sellButtonText: {
    color: "#333",
    fontSize: RFValue(12),
    fontFamily: "SemiBold",
  },
});
