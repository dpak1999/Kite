import React from "react";
import { StyleSheet, View, ActivityIndicator, Text } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0D87E1" />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  message: {
    marginTop: 12,
    fontSize: RFValue(14),
    fontFamily: "Medium",
    color: "#666",
  },
});
