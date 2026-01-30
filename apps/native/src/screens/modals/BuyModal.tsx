import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import Modal from "react-native-modal";
import { useMutation } from "convex/react";
import Toast from "react-native-toast-message";
import { RFValue } from "react-native-responsive-fontsize";
import { api } from "../../../../../packages/backend/convex/_generated/api";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { Id } from "../../../../../packages/backend/convex/_generated/dataModel";

interface BuyModalProps {
  isVisible: boolean;
  onClose: () => void;
  userId: string | undefined | null;
  instrumentType: "stock" | "mutualFund";
  instrumentId: string;
  instrumentName: string;
  currentPrice: number;
  walletBalance: number;
  onSuccess: () => void;
}

export const BuyModal: React.FC<BuyModalProps> = ({
  isVisible,
  onClose,
  userId,
  instrumentType,
  instrumentId,
  instrumentName,
  currentPrice,
  walletBalance,
  onSuccess,
}) => {
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);

  const buyStock = useMutation(api.trading.buyStock);
  const buyMutualFund = useMutation(api.trading.buyMutualFund);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isVisible) {
      setQuantity("");
    }
  }, [isVisible]);

  const totalCost = Number(quantity) * currentPrice;
  const isValid = Number(quantity) > 0 && totalCost <= walletBalance;
  const insufficientFunds = totalCost > walletBalance;

  const handleBuy = async () => {
    if (!isValid || !userId) return;

    try {
      setLoading(true);

      if (instrumentType === "stock") {
        await buyStock({
          userId: userId as Id<"users">,
          stockId: instrumentId as Id<"stocks">,
          quantity: Number(quantity),
        });
      } else {
        await buyMutualFund({
          userId: userId as Id<"users">,
          mutualFundId: instrumentId as Id<"mutualFunds">,
          units: Number(quantity),
        });
      }

      Toast.show({
        type: "success",
        text1: "Purchase Successful",
        text2: `You bought ${quantity} ${instrumentType === "stock" ? "shares" : "units"} of ${instrumentName}`,
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Purchase Failed",
        text2: error.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const formattedPrice = `₹${currentPrice.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const formattedCost = `₹${totalCost.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const formattedBalance = `₹${walletBalance.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={loading ? undefined : onClose}
      useNativeDriver
      avoidKeyboard
    >
      <View style={styles.modalContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>
            Buy {instrumentType === "stock" ? "Stock" : "Mutual Fund"}
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Instrument</Text>
            <Text style={styles.value}>{instrumentName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Current Price</Text>
            <Text style={styles.value}>{formattedPrice}</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Enter {instrumentType === "stock" ? "Quantity" : "Units"}
            </Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="0"
              keyboardType="numeric"
              editable={!loading}
            />
          </View>

          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Cost</Text>
              <Text style={styles.summaryValue}>{formattedCost}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Wallet Balance</Text>
              <Text style={styles.summaryValue}>{formattedBalance}</Text>
            </View>
            {insufficientFunds && (
              <Text style={styles.errorText}>Insufficient funds in wallet</Text>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!isValid || loading) && styles.disabledButton,
              ]}
              onPress={handleBuy}
              disabled={!isValid || loading}
            >
              {loading ? (
                <LoadingSpinner />
              ) : (
                <Text style={styles.submitButtonText}>Buy Now</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 340,
  },
  title: {
    fontSize: RFValue(18),
    fontFamily: "Bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: {
    fontSize: RFValue(14),
    fontFamily: "Regular",
    color: "#666",
  },
  value: {
    fontSize: RFValue(14),
    fontFamily: "SemiBold",
    color: "#333",
    flex: 1,
    textAlign: "right",
    marginLeft: 12,
  },
  inputContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: RFValue(12),
    fontFamily: "Medium",
    color: "#666",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: RFValue(16),
    fontFamily: "SemiBold",
    color: "#333",
    backgroundColor: "#f9f9f9",
  },
  summaryContainer: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: RFValue(12),
    fontFamily: "Regular",
    color: "#666",
  },
  summaryValue: {
    fontSize: RFValue(12),
    fontFamily: "SemiBold",
    color: "#333",
  },
  errorText: {
    color: "tomato",
    fontSize: RFValue(12),
    fontFamily: "Medium",
    marginTop: 8,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: RFValue(14),
    fontFamily: "SemiBold",
    color: "#666",
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#4caf50",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: RFValue(14),
    fontFamily: "SemiBold",
    color: "#fff",
  },
});
