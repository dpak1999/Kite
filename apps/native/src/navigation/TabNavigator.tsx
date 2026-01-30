import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

import WatchlistScreen from "../screens/WatchlistScreen";
import OrdersScreen from "../screens/OrdersScreen";
import PortfolioScreen from "../screens/PortfolioScreen";
import AppsScreen from "../screens/AppsScreen";
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
          let iconName;

          if (route.name === "Watchlist") {
            iconName = focused ? "bookmark" : "bookmark-outline";
          } else if (route.name === "Orders") {
            iconName = focused ? "briefcase" : "briefcase-outline";
          } else if (route.name === "Portfolio") {
            iconName = focused ? "pie-chart" : "pie-chart-outline";
          } else if (route.name === "Apps") {
            iconName = focused ? "grid" : "grid-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          // You can return any component that you like here!
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Watchlist" component={WatchlistScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Portfolio" component={PortfolioScreen} />
      <Tab.Screen name="Apps" component={AppsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
