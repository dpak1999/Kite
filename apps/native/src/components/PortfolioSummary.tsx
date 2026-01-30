import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

interface PortfolioSummaryProps {
  investedValue: number;
  currentValue: number;
  totalProfitAndLoss: number;
  totalProfitAndLossPercentage: number;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  investedValue,
  currentValue,
  totalProfitAndLoss,
  totalProfitAndLossPercentage,
}) => {
  const isProfit = totalProfitAndLoss >= 0;
  const plColor = isProfit ? "#4caf50" : "#f44336";

  const formattedInvested = `₹${investedValue.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const formattedCurrent = `₹${currentValue.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const formattedPL = `${isProfit ? "+" : ""}₹${Math.abs(
    totalProfitAndLoss,
  ).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const formattedPercent = `${isProfit ? "+" : ""}${totalProfitAndLossPercentage.toFixed(2)}%`;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.label}>Invested</Text>
          <Text style={styles.value}>{formattedInvested}</Text>
        </View>
        <View style={[styles.column, styles.alignRight]}>
          <Text style={styles.label}>Current</Text>
          <Text style={styles.value}>{formattedCurrent}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.label}>P&L</Text>
          <Text style={[styles.plValue, { color: plColor }]}>
            {formattedPL}
          </Text>
        </View>
        <View style={[styles.column, styles.alignRight]}>
          <Text style={styles.label}>Returns</Text>
          <Text style={[styles.plValue, { color: plColor }]}>
            {formattedPercent}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    flex: 1,
  },
  alignRight: {
    alignItems: "flex-end",
  },
  label: {
    fontSize: RFValue(12),
    fontFamily: "Medium",
    color: "#999",
    marginBottom: 4,
  },
  value: {
    fontSize: RFValue(16),
    fontFamily: "SemiBold",
    color: "#333",
  },
  plValue: {
    fontSize: RFValue(16),
    fontFamily: "Bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 12,
  },
});
