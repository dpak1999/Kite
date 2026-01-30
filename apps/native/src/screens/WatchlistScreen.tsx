import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";
import { useQuery, useMutation } from "convex/react";
import Toast from "react-native-toast-message";
import { api } from "../../../../packages/backend/convex/_generated/api";
import { useWatchlist } from "../hooks/useWatchlist";
import { InstrumentCard } from "../components/InstrumentCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import { Id } from "../../../../packages/backend/convex/_generated/dataModel";

export default function WatchlistScreen({ navigation }: any) {
  const { user } = useUser();
  const userId = user?.id;

  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Queries
  const watchlist = useWatchlist(userId);
  const convexUser = useQuery(
    api.users.getByClerkId,
    userId ? { clerkId: userId } : "skip",
  );
  const convexUserId = convexUser?._id;

  const allStocks = useQuery(api.stocks.list) || [];
  const allMFs = useQuery(api.mutualFunds.list) || [];

  const addToWatchlist = useMutation(api.watchlist.addToWatchlist);
  const removeFromWatchlist = useMutation(api.watchlist.removeFromWatchlist);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleToggleWatchlist = async (
    type: "stock" | "mutualFund",
    id: string,
    isInWatchlist: boolean,
  ) => {
    if (!convexUserId) return;

    try {
      if (isInWatchlist) {
        await removeFromWatchlist({
          userId: convexUserId,
          instrumentType: type,
          instrumentId: id as any,
        });
        Toast.show({ type: "success", text1: "Removed from Watchlist" });
      } else {
        await addToWatchlist({
          userId: convexUserId,
          instrumentType: type,
          instrumentId: id as any,
        });
        Toast.show({ type: "success", text1: "Added to Watchlist" });
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Failed to update watchlist" });
    }
  };

  const isInWatchlist = (id: string) => {
    if (!watchlist) return false;
    return watchlist.some(
      (item: any) => item.stockId === id || item.mutualFundId === id,
    );
  };

  const getFilteredData = () => {
    if (!searchQuery) {
      if (!watchlist) return [];
      // return watchlist items mapped to instrument structure
      return watchlist.map((item: any) => {
        const isStock = item.instrumentType === "stock";
        const instrument = item.instrument;

        if (!instrument) return null;

        return {
          _id: instrument.id,
          name: instrument.name,
          symbol: instrument.symbol,
          currentPrice: instrument.currentPrice,
          changePercent: instrument.percentChange || 0,
          type: item.instrumentType,
          isInWatchlist: true,
        };
      }).filter(Boolean); // Remove null items
    }

    const lowerQuery = searchQuery.toLowerCase();
    const filteredStocks = (allStocks || [])
      .filter(
        (s: any) =>
          s.companyName.toLowerCase().includes(lowerQuery) ||
          s.symbol.toLowerCase().includes(lowerQuery),
      )
      .map((s: any) => ({
        _id: s._id,
        name: s.companyName,
        symbol: s.symbol,
        currentPrice: s.currentPrice,
        changePercent: s.percentChange || 0,
        type: "stock",
        isInWatchlist: isInWatchlist(s._id),
      }));

    const filteredMFs = (allMFs || [])
      .filter(
        (mf: any) =>
          mf.schemeName.toLowerCase().includes(lowerQuery) ||
          (mf.category && mf.category.toLowerCase().includes(lowerQuery)),
      )
      .map((mf: any) => ({
        _id: mf._id,
        name: mf.schemeName,
        symbol: mf.category || mf.schemeId,
        currentPrice: mf.currentNav,
        changePercent: 0,
        type: "mutualFund",
        isInWatchlist: isInWatchlist(mf._id),
      }));

    return [...filteredStocks, ...filteredMFs];
  };

  const data = getFilteredData();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={RFValue(20)}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stocks & mutual funds..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={RFValue(16)} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <InstrumentCard
            name={item.name}
            symbol={item.symbol}
            price={item.currentPrice}
            changePercent={item.changePercent}
            isInWatchlist={item.isInWatchlist}
            onToggleWatchlist={() =>
              handleToggleWatchlist(
                item.type as any,
                item._id,
                item.isInWatchlist,
              )
            }
            onPress={() =>
              navigation.navigate("InstrumentDetail", {
                instrumentId: item._id,
                type: item.type,
                name: item.name,
                symbol: item.symbol,
                price: item.currentPrice,
              })
            }
            type={item.type as any}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            message={
              searchQuery ? "No results found" : "Your watchlist is empty"
            }
            icon="search-outline"
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: RFValue(14),
    fontFamily: "Regular",
    color: "#333",
  },
  listContent: {
    paddingBottom: 20,
  },
});
