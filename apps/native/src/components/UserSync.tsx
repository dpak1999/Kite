import { useEffect } from "react";
import { useUser } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../packages/backend/convex/_generated/api";

/**
 * Component that syncs the authenticated Clerk user to Convex database
 * Also initializes wallet for new users
 */
export default function UserSync() {
  const { user, isLoaded } = useUser();
  const syncUser = useMutation(api.users.syncUser);
  const initializeWallet = useMutation(api.wallets.initializeWallet);

  // Query the user from Convex after sync
  const convexUser = useQuery(
    api.users.getByClerkId,
    user?.id ? { clerkId: user.id } : "skip",
  );

  useEffect(() => {
    const syncUserToConvex = async () => {
      if (!isLoaded || !user) return;

      try {
        // Sync user to Convex (creates or updates)
        await syncUser({
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          imageUrl: user.imageUrl || undefined,
        });

        console.log("User synced to Convex:", user.id);
      } catch (error) {
        console.error("Error syncing user to Convex:", error);
      }
    };

    syncUserToConvex();
  }, [user?.id, isLoaded]);

  // Initialize wallet after user is synced to Convex
  useEffect(() => {
    const initWallet = async () => {
      if (!convexUser) return;

      try {
        await initializeWallet({ userId: convexUser._id });
        console.log("Wallet initialized for user:", convexUser._id);
      } catch (error) {
        // Wallet might already exist, which is fine
        console.log("Wallet initialization:", error);
      }
    };

    initWallet();
  }, [convexUser?._id]);

  return null; // This component doesn't render anything
}
