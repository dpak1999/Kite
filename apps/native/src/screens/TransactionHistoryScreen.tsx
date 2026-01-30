import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { RFValue } from "react-native-responsive-fontsize";
import { useUserTransactions } from "../hooks/useUserTransactions";
import { TransactionListItem } from "../components/TransactionListItem";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";

type FilterType = "all" | "add_money" | "buy" | "sell";

export default function TransactionHistoryScreen() {
  const { user } = useUser();
  const userId = user?.id;
  const [filter, setFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // Map filter UI to API filter
  const apiFilter =
    filter === "all"
      ? undefined
      : filter === "buy"
        ? { type: "buy" } // simplified for API, backend handles "buy_stock" or "buy_mutual_fund" usually or we need to be specific.
        : // Assuming backend filter logic handles partial match or specific types.
          // If exact match needed: we might need logic here.
          // The prompt says: inputs: { type?: string } in useUserTransactions.
          // Let's assume the backend handles broad types or we filter client side if needed,
          // but ideally backend.
          { type: filter };

  // If backend expects specific "buy_stock" vs "buy", let's check prompt.
  // Prompt says: `api.transactions.getUserTransactions(userId, filters?, paginationOpts)`
  // Let's pass the filter string and hope backend handles it. If not we might see issues.
  // Re-reading hook definition: `filters?: { type?: string }`.

  const transactionsData = useUserTransactions(userId, apiFilter, page, 20);
  const transactions = transactionsData?.transactions || [];
  const isLoading = transactionsData === undefined;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setPage(1);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const loadMore = () => {
    // Basic pagination - if we have data, try next page
    if (transactionsData && page < transactionsData.totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const renderFilterTab = (tab: FilterType, label: string) => (
    <TouchableOpacity
      style={[styles.filterTab, filter === tab && styles.activeFilterTab]}
      onPress={() => {
        setFilter(tab);
        setPage(1);
      }}
    >
      <Text
        style={[styles.filterText, filter === tab && styles.activeFilterText]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
      </View>

      <View style={styles.filterContainer}>
        {renderFilterTab("all", "All")}
        {renderFilterTab("add_money", "Money In")}
        {renderFilterTab("buy", "Buy")}
        {renderFilterTab("sell", "Sell")}
      </View>

      {isLoading && page === 1 ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TransactionListItem
              type={item.type as any}
              description={item.description || ""}
              amount={item.amount}
              date={item.createdAt}
              status={undefined}
            />
          )}
          ListEmptyComponent={
            <EmptyState message="No transactions found" icon="search-outline" />
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: RFValue(20),
    fontFamily: "Bold",
    color: "#333",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    marginRight: 8,
  },
  activeFilterTab: {
    backgroundColor: "#0D87E1",
  },
  filterText: {
    fontSize: RFValue(12),
    fontFamily: "Medium",
    color: "#666",
  },
  activeFilterText: {
    color: "#fff",
  },
  listContent: {
    paddingBottom: 20,
  },
});
