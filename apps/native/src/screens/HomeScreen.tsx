import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { useUser, useClerk } from "@clerk/clerk-expo";

const HomeScreen = ({ navigation }) => {
  const { user } = useUser();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut();
    navigation.replace("LoginScreen");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Kite</Text>
        <TouchableOpacity onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hello, {user?.firstName || "User"}!</Text>
          <Text style={styles.cardSubtitle}>
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Getting Started</Text>
          <Text style={styles.cardText}>
            Your app is ready. Start building your features by:
          </Text>
          <Text style={styles.bulletPoint}>
            • Defining your schema in packages/backend/convex/schema.ts
          </Text>
          <Text style={styles.bulletPoint}>
            • Creating queries and mutations in packages/backend/convex/
          </Text>
          <Text style={styles.bulletPoint}>
            • Building your screens in apps/native/src/screens/
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Real-time Data</Text>
          <Text style={styles.cardText}>
            Use Convex hooks like useQuery and useMutation to interact with your
            backend. Changes sync in real-time across all connected clients.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#0D87E1",
  },
  title: {
    fontSize: RFValue(18),
    fontFamily: "SemiBold",
    color: "#fff",
  },
  signOutText: {
    fontSize: RFValue(14),
    fontFamily: "Medium",
    color: "#fff",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: RFValue(16),
    fontFamily: "SemiBold",
    color: "#333",
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: RFValue(14),
    fontFamily: "Regular",
    color: "#666",
  },
  cardText: {
    fontSize: RFValue(14),
    fontFamily: "Regular",
    color: "#666",
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: RFValue(13),
    fontFamily: "Regular",
    color: "#666",
    marginLeft: 8,
    marginBottom: 4,
  },
});

export default HomeScreen;
