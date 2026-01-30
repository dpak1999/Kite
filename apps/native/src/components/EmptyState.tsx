import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "file-tray-outline",
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={RFValue(48)} color="#ccc" />
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    marginTop: 16,
    fontSize: RFValue(14),
    fontFamily: "Medium",
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
  button: {
    marginTop: 24,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: "#0D87E1",
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: RFValue(14),
    fontFamily: "SemiBold",
  },
});
