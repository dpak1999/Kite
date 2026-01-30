import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";

interface InstrumentCardProps {
  name: string;
  symbol: string;
  price: number;
  changePercent: number;
  isInWatchlist: boolean;
  onToggleWatchlist: () => void;
  onPress: () => void;
  type: "stock" | "mutualFund";
}

export const InstrumentCard: React.FC<InstrumentCardProps> = ({
  name,
  symbol,
  price,
  changePercent,
  isInWatchlist,
  onToggleWatchlist,
  onPress,
  type,
}) => {
  const isPositive = changePercent >= 0;
  const changeColor = isPositive ? "#4caf50" : "#f44336";

  const formattedPrice = `₹${price.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const formattedChange = `${isPositive ? "+" : ""}${changePercent.toFixed(2)}%`;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.iconContainer}>
        <View
          style={[
            styles.iconPlaceholder,
            { backgroundColor: type === "stock" ? "#e3f2fd" : "#e8f5e9" },
          ]}
        >
          <Text
            style={[
              styles.iconText,
              { color: type === "stock" ? "#0D87E1" : "#2e7d32" },
            ]}
          >
            {symbol.substring(0, 1)}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.mainInfo}>
          <Text style={styles.symbol}>{symbol}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
        </View>

        <View style={styles.priceInfo}>
          <Text style={styles.price}>{formattedPrice}</Text>
          <Text style={[styles.change, { color: changeColor }]}>
            {formattedChange}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.watchlistButton}
        onPress={onToggleWatchlist}
      >
        <Ionicons
          name={isInWatchlist ? "star" : "star-outline"}
          size={RFValue(20)}
          color={isInWatchlist ? "#ffc107" : "#ccc"}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  iconContainer: {
    marginRight: 12,
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: RFValue(16),
    fontFamily: "Bold",
  },
  content: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mainInfo: {
    flex: 1,
  },
  symbol: {
    fontSize: RFValue(14),
    fontFamily: "SemiBold",
    color: "#333",
  },
  name: {
    fontSize: RFValue(12),
    fontFamily: "Regular",
    color: "#999",
    marginTop: 2,
  },
  priceInfo: {
    alignItems: "flex-end",
    marginRight: 12,
  },
  price: {
    fontSize: RFValue(14),
    fontFamily: "SemiBold",
    color: "#333",
  },
  change: {
    fontSize: RFValue(12),
    fontFamily: "Medium",
    marginTop: 2,
  },
  watchlistButton: {
    padding: 8,
  },
});
