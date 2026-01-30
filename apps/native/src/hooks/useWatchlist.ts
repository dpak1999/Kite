import { useQuery } from "convex/react";
import { api } from "../../../../packages/backend/convex/_generated/api";

export const useWatchlist = (clerkUserId: string | undefined | null) => {
  const user = useQuery(api.users.getByClerkId, clerkUserId ? { clerkId: clerkUserId } : "skip");
  const userId = user?._id;

  return useQuery(
    api.watchlist.getUserWatchlist,
    userId ? { userId } : "skip"
  );
};

export const useWatchlistCount = (clerkUserId: string | undefined | null) => {
  const user = useQuery(api.users.getByClerkId, clerkUserId ? { clerkId: clerkUserId } : "skip");
  const userId = user?._id;

  return useQuery(
    api.watchlist.getWatchlistCount,
    userId ? { userId } : "skip"
  );
};
