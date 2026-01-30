import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { RFValue } from "react-native-responsive-fontsize";
import { useUserWallet } from "../hooks/useUserWallet";
import { useRecentTransactions } from "../hooks/useUserTransactions";
import { useUserRequests } from "../hooks/useAddMoneyRequests";
import { WalletCard } from "../components/WalletCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import { TransactionListItem } from "../components/TransactionListItem";
import { AddMoneyRequestModal } from "./modals/AddMoneyRequestModal";

export default function WalletScreen({ navigation }: any) {
  const { user } = useUser();
  const userId = user?.id;

  const [isAddMoneyModalVisible, setAddMoneyModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Queries
  const wallet = useUserWallet(userId);
  const recentTransactions = useRecentTransactions(userId, 5);
  const pendingRequests = useUserRequests(userId); // Default page 1, limit 10

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Queries in Convex auto-update, but we can simulate a refresh feel or refetch specific things if needed.
    // For now, just wait a bit.
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  if (!userId) return <LoadingSpinner message="Authenticating..." />;
  if (wallet === undefined)
    return <LoadingSpinner message="Loading wallet..." />;

  const pendingRequestsList =
    pendingRequests?.requests?.filter((r) => r.status === "pending") || [];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <WalletCard
          balance={wallet?.balance || 0}
          onAddMoney={() => setAddMoneyModalVisible(true)}
        />

        {pendingRequestsList.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Requests</Text>
            {pendingRequestsList.map((request) => (
              <View key={request._id} style={styles.requestCard}>
                <View>
                  <Text style={styles.requestAmount}>
                    ₹{request.amount.toLocaleString("en-IN")}
                  </Text>
                  <Text style={styles.requestDate}>
                    {new Date(request.requestedAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Pending</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Transactions")}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions === undefined ? (
            <LoadingSpinner />
          ) : recentTransactions.length === 0 ? (
            <EmptyState message="No recent transactions" icon="time-outline" />
          ) : (
            recentTransactions.map((tx) => (
              <TransactionListItem
                key={tx._id}
                type={tx.type as any}
                description={tx.description || ""}
                amount={tx.amount}
                date={tx.createdAt}
                status={undefined}
              />
            ))
          )}
        </View>
      </ScrollView>

      <AddMoneyRequestModal
        isVisible={isAddMoneyModalVisible}
        onClose={() => setAddMoneyModalVisible(false)}
        userId={userId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: RFValue(16),
    fontFamily: "Bold",
    color: "#333",
    paddingHorizontal: 16, // If no header
  },
  viewAllText: {
    fontSize: RFValue(12),
    fontFamily: "SemiBold",
    color: "#0D87E1",
  },
  requestCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  requestAmount: {
    fontSize: RFValue(14),
    fontFamily: "SemiBold",
    color: "#333",
  },
  requestDate: {
    fontSize: RFValue(12),
    fontFamily: "Regular",
    color: "#999",
  },
  badge: {
    backgroundColor: "#fff3e0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#bf360c", // Orange-ish
    fontSize: RFValue(10),
    fontFamily: "SemiBold",
  },
});
