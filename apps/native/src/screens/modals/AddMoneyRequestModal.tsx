import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { useMutation } from "convex/react";
import Toast from "react-native-toast-message";
import { RFValue } from "react-native-responsive-fontsize";
import { api } from "../../../../../packages/backend/convex/_generated/api";
import { Id } from "../../../../../packages/backend/convex/_generated/dataModel";

import { AmountInput } from "../../components/AmountInput";
import { LoadingSpinner } from "../../components/LoadingSpinner";

interface AddMoneyRequestModalProps {
  isVisible: boolean;
  onClose: () => void;
  userId: string | undefined | null;
}

export const AddMoneyRequestModal: React.FC<AddMoneyRequestModalProps> = ({
  isVisible,
  onClose,
  userId,
}) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const createRequest = useMutation(api.addMoneyRequests.createRequest);

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Toast.show({
        type: "error",
        text1: "Invalid Amount",
        text2: "Please enter a valid amount greater than 0",
      });
      return;
    }

    if (Number(amount) > 1000000) {
      Toast.show({
        type: "error",
        text1: "Limit Exceeded",
        text2: "Maximum allowed amount is ₹10,00,000",
      });
      return;
    }

    if (!userId) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "User not authenticated",
      });
      return;
    }

    try {
      setLoading(true);
      await createRequest({
        userId: userId as Id<"users">,
        amount: Number(amount),
      });
      Toast.show({
        type: "success",
        text1: "Request Sent",
        text2: "Your add money request has been submitted",
      });
      setAmount("");
      onClose();
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Request Failed",
        text2: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={loading ? undefined : onClose}
      useNativeDriver
      avoidKeyboard
    >
      <View style={styles.modalContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>Add Money to Wallet</Text>

          <AmountInput
            value={amount}
            onChangeText={setAmount}
            placeholder="Enter Amount"
            editable={!loading}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner />
              ) : (
                <Text style={styles.submitButtonText}>Submit Request</Text>
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
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
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
    backgroundColor: "#0D87E1",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: RFValue(14),
    fontFamily: "SemiBold",
    color: "#fff",
  },
});
