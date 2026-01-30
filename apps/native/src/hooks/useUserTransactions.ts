import { useQuery } from "convex/react";
import { api } from "../../../../packages/backend/convex/_generated/api";

export const useUserTransactions = (
  clerkUserId: string | undefined | null,
  filters?: { type?: string },
  page = 1,
  limit = 20
) => {
  const user = useQuery(api.users.getByClerkId, clerkUserId ? { clerkId: clerkUserId } : "skip");
  const userId = user?._id;

  return useQuery(
    api.transactions.getUserTransactions,
    userId
      ? {
        userId,
        filters: filters ? { type: filters.type as any } : undefined,
        paginationOpts: { page, limit },
      }
      : "skip"
  );
};

export const useRecentTransactions = (clerkUserId: string | undefined | null, limit = 5) => {
  const user = useQuery(api.users.getByClerkId, clerkUserId ? { clerkId: clerkUserId } : "skip");
  const userId = user?._id;

  return useQuery(
    api.transactions.getRecentTransactions,
    userId ? { userId, limit } : "skip"
  );
};

export const useTransactionStats = (clerkUserId: string | undefined | null) => {
  const user = useQuery(api.users.getByClerkId, clerkUserId ? { clerkId: clerkUserId } : "skip");
  const userId = user?._id;

  return useQuery(
    api.transactions.getTransactionStats,
    userId ? { userId } : "skip"
  );
};
