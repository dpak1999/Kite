import React from "react";
import { StyleSheet, View, Text, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { RFValue } from "react-native-responsive-fontsize";

interface PriceChartProps {
  data: number[];
  labels?: string[];
  days?: number;
  color?: string;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  data,
  labels = [],
  days = 7,
  color = "#0D87E1",
}) => {
  const screenWidth = Dimensions.get("window").width;

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No price data available</Text>
      </View>
    );
  }

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => color,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForDots: {
      r: "0",
    },
    decimalPlaces: 2,
  };

  const chartData = {
    labels: labels.length > 0 ? labels : [],
    datasets: [
      {
        data: data,
        color: (opacity = 1) => color,
        strokeWidth: 2,
      },
      {
        data: [Math.min(...data) * 0.999], // Dummy min
        withDots: false,
      },
      {
        data: [Math.max(...data) * 1.001], // Dummy max
        withDots: false,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        bezier
        withDots={false}
        withInnerLines={false}
        withOuterLines={false}
        withVerticalLines={false}
        withHorizontalLines={true}
        withVerticalLabels={false}
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    alignItems: "center",
  },
  chart: {
    marginRight: 0,
    paddingRight: 0,
  },
  emptyContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    margin: 16,
  },
  emptyText: {
    color: "#999",
    fontFamily: "Medium",
    fontSize: RFValue(14),
  },
});
