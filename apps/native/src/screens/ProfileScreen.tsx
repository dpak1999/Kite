import React from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { useUser, useClerk } from "@clerk/clerk-expo";

const ProfileScreen = ({ navigation }) => {
  const { user } = useUser();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut();
    // Navigation will be handled by the auth listener in Navigation.tsx or by replacing the stack
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {user?.firstName?.charAt(0) || "U"}
            </Text>
          </View>
        </View>
        <Text style={styles.title}>{user?.fullName || "User"}</Text>
        <Text style={styles.subtitle}>
          {user?.primaryEmailAddress?.emailAddress}
        </Text>

        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
    alignItems: "center",
    paddingTop: 40,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  avatarText: {
    fontSize: RFValue(32),
    fontFamily: "SemiBold",
    color: "#0D87E1",
  },
  title: {
    fontSize: RFValue(20),
    fontFamily: "SemiBold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: RFValue(14),
    fontFamily: "Regular",
    color: "#666",
    marginBottom: 32,
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: "#ffebee",
    borderRadius: 8,
  },
  logoutText: {
    color: "tomato",
    fontSize: RFValue(14),
    fontFamily: "Medium",
  },
});

export default ProfileScreen;
