import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { RFValue } from "react-native-responsive-fontsize";

interface ConfirmModalProps {
  isVisible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmJson?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isVisible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmColor = "#0D87E1",
}) => {
  return (
    <Modal isVisible={isVisible} onBackdropPress={onCancel} useNativeDriver>
      <View style={styles.modalContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>{cancelLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: confirmColor }]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>{confirmLabel}</Text>
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
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: RFValue(14),
    fontFamily: "Regular",
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 20,
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
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: RFValue(14),
    fontFamily: "SemiBold",
    color: "#fff",
  },
});
