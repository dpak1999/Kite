import { useQuery } from "convex/react";
import { api } from "../../../../packages/backend/convex/_generated/api";

export const useUserRequests = (clerkUserId: string | undefined | null, page = 1, limit = 10) => {
  const user = useQuery(api.users.getByClerkId, clerkUserId ? { clerkId: clerkUserId } : "skip");
  const userId = user?._id;

  return useQuery(
    api.addMoneyRequests.getUserRequests,
    userId
      ? {
        userId,
        paginationOpts: { page, limit },
      }
      : "skip"
  );
};
