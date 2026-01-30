import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";

interface WalletCardProps {
  balance: number;
  onAddMoney: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  balance,
  onAddMoney,
}) => {
  const formattedBalance = `₹${balance.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.label}>Wallet Balance</Text>
        <Text style={styles.balance}>{formattedBalance}</Text>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={onAddMoney}>
        <Ionicons name="add" size={RFValue(20)} color="#fff" />
        <Text style={styles.buttonText}>Add Money</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: RFValue(12),
    fontFamily: "Medium",
    color: "#666",
    marginBottom: 4,
  },
  balance: {
    fontSize: RFValue(24),
    fontFamily: "Bold",
    color: "#333",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D87E1",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: RFValue(12),
    fontFamily: "SemiBold",
    marginLeft: 4,
  },
});
