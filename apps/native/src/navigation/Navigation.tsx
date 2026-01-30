import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useUser } from "@clerk/clerk-expo";
import LoginScreen from "../screens/LoginScreen";
import TabNavigator from "./TabNavigator";
import InstrumentDetailScreen from "../screens/InstrumentDetailScreen";

const Stack = createNativeStackNavigator();

const Navigation = () => {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        id={undefined}
        initialRouteName={isSignedIn ? "TabNavigator" : "LoginScreen"}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="TabNavigator" component={TabNavigator} />
        <Stack.Screen
          name="InstrumentDetail"
          component={InstrumentDetailScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
