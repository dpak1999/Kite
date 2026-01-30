import { useQuery } from "convex/react";
import { api } from "../../../../packages/backend/convex/_generated/api";

export const useUserPortfolio = (clerkUserId: string | undefined | null) => {
  const user = useQuery(api.users.getByClerkId, clerkUserId ? { clerkId: clerkUserId } : "skip");
  const userId = user?._id;

  return useQuery(
    api.holdings.getUserPortfolio,
    userId ? { userId } : "skip"
  );
};

export const usePortfolioSummary = (clerkUserId: string | undefined | null) => {
  const user = useQuery(api.users.getByClerkId, clerkUserId ? { clerkId: clerkUserId } : "skip");
  const userId = user?._id;

  return useQuery(
    api.holdings.getPortfolioSummary,
    userId ? { userId } : "skip"
  );
};
