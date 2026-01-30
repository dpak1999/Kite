import { useQuery } from "convex/react";
import { api } from "../../../../packages/backend/convex/_generated/api";

export const useUserWallet = (clerkUserId: string | undefined | null) => {
  const user = useQuery(api.users.getByClerkId, clerkUserId ? { clerkId: clerkUserId } : "skip");
  const userId = user?._id;

  const wallet = useQuery(api.wallets.getUserWallet,
    userId ? { userId } : "skip"
  );
  return wallet;
};

export const useWalletStats = (clerkUserId: string | undefined | null) => {
  const user = useQuery(api.users.getByClerkId, clerkUserId ? { clerkId: clerkUserId } : "skip");
  const userId = user?._id;

  const stats = useQuery(api.wallets.getWalletStats,
    userId ? { userId } : "skip"
  );
  return stats;
};
