import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

import WatchlistScreen from "../screens/WatchlistScreen";
import TransactionHistoryScreen from "../screens/TransactionHistoryScreen";
import PortfolioScreen from "../screens/PortfolioScreen";
import WalletScreen from "../screens/WalletScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#0D87E1", // Kite Blue
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          height: Platform.OS === "ios" ? 88 : 60,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "Medium",
          marginTop: -4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "help";

          if (route.name === "Watchlist") {
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "Transactions") {
            iconName = focused ? "time" : "time-outline";
          } else if (route.name === "Portfolio") {
            iconName = focused ? "pie-chart" : "pie-chart-outline";
          } else if (route.name === "Wallet") {
            iconName = focused ? "wallet" : "wallet-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Watchlist" component={WatchlistScreen} />
      <Tab.Screen name="Transactions" component={TransactionHistoryScreen} />
      <Tab.Screen name="Portfolio" component={PortfolioScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
