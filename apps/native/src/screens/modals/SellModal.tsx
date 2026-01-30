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

interface SellModalProps {
  isVisible: boolean;
  onClose: () => void;
  userId: string | undefined | null;
  instrumentType: "stock" | "mutualFund";
  holdingId: string;
  instrumentName: string;
  currentPrice: number;
  ownedQuantity: number;
  onSuccess: () => void;
}

export const SellModal: React.FC<SellModalProps> = ({
  isVisible,
  onClose,
  userId,
  instrumentType,
  holdingId,
  instrumentName,
  currentPrice,
  ownedQuantity,
  onSuccess,
}) => {
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);

  const sellStock = useMutation(api.trading.sellStock);
  const sellMutualFund = useMutation(api.trading.sellMutualFund);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isVisible) {
      setQuantity("");
    }
  }, [isVisible]);

  const totalProceeds = Number(quantity) * currentPrice;
  const isValid = Number(quantity) > 0 && Number(quantity) <= ownedQuantity;

  const handleSell = async () => {
    if (!isValid || !userId) return;

    try {
      setLoading(true);

      if (instrumentType === "stock") {
        await sellStock({
          userId: userId as Id<"users">,
          holdingId: holdingId as Id<"userStockHoldings">,
          quantity: Number(quantity),
        });
      } else {
        await sellMutualFund({
          userId: userId as Id<"users">,
          holdingId: holdingId as Id<"userMutualFundHoldings">,
          units: Number(quantity),
        });
      }

      Toast.show({
        type: "success",
        text1: "Sale Successful",
        text2: `You sold ${quantity} ${instrumentType === "stock" ? "shares" : "units"} of ${instrumentName}`,
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Sale Failed",
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

  const formattedProceeds = `₹${totalProceeds.toLocaleString("en-IN", {
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
            Sell {instrumentType === "stock" ? "Stock" : "Mutual Fund"}
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Instrument</Text>
            <Text style={styles.value}>{instrumentName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Current Price</Text>
            <Text style={styles.value}>{formattedPrice}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Owned</Text>
            <Text style={styles.value}>
              {ownedQuantity} {instrumentType === "stock" ? "Shares" : "Units"}
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Enter Quantity to Sell</Text>
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
              <Text style={styles.summaryLabel}>Estimated Proceeds</Text>
              <Text style={styles.summaryValue}>{formattedProceeds}</Text>
            </View>
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
              onPress={handleSell}
              disabled={!isValid || loading}
            >
              {loading ? (
                <LoadingSpinner />
              ) : (
                <Text style={styles.submitButtonText}>Sell Now</Text>
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
    backgroundColor: "#f44336",
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
