import React from "react";
import { StyleSheet, View, Text, SafeAreaView } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

const PortfolioScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Portfolio</Text>
        <Text style={styles.subtitle}>Holdings and Positions</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: RFValue(20),
    fontFamily: "SemiBold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: RFValue(14),
    fontFamily: "Regular",
    color: "#666",
  },
});

export default PortfolioScreen;
