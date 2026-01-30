import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";

interface TransactionListItemProps {
  type:
    | "add_money"
    | "buy_stock"
    | "sell_stock"
    | "buy_mutual_fund"
    | "sell_mutual_fund";
  description: string;
  amount: number;
  date: number;
  status?: string;
}

export const TransactionListItem: React.FC<TransactionListItemProps> = ({
  type,
  description,
  amount,
  date,
  status,
}) => {
  const isCredit = type === "add_money" || type.startsWith("sell");
  const isAddMoney = type === "add_money";

  let iconName: keyof typeof Ionicons.glyphMap = "swap-horizontal";
  let iconColor = "#666";
  let iconBg = "#f0f0f0";

  if (isAddMoney) {
    iconName = "wallet-outline";
    iconColor = "#0D87E1";
    iconBg = "#e3f2fd";
  } else if (type.includes("buy")) {
    iconName = "trending-up-outline";
    iconColor = "#f44336"; // Red for débit
    iconBg = "#ffebee";
  } else if (type.includes("sell")) {
    iconName = "trending-down-outline";
    iconColor = "#4caf50"; // Green for credit
    iconBg = "#e8f5e9";
  }

  const formattedAmount = `₹${Math.abs(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const formattedDate = new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={RFValue(20)} color={iconColor} />
      </View>

      <View style={styles.content}>
        <Text style={styles.description} numberOfLines={1}>
          {description}
        </Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>

      <View style={styles.rightContent}>
        <Text style={[styles.amount, { color: isCredit ? "#4caf50" : "#333" }]}>
          {isCredit ? "+" : "-"}
          {formattedAmount}
        </Text>
        {status && <Text style={styles.status}>{status}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: RFValue(14),
    fontFamily: "Medium",
    color: "#333",
    marginBottom: 4,
  },
  date: {
    fontSize: RFValue(11),
    fontFamily: "Regular",
    color: "#999",
  },
  rightContent: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: RFValue(14),
    fontFamily: "SemiBold",
  },
  status: {
    fontSize: RFValue(10),
    fontFamily: "Medium",
    color: "#999",
    marginTop: 2,
    textTransform: "capitalize",
  },
});
