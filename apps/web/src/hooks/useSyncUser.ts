"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";

/**
 * Hook to sync the current Clerk user to Convex
 * Call this in the dashboard layout to ensure users are synced on login
 */
export function useSyncUser() {
  const { user, isLoaded } = useUser();
  const syncUser = useMutation(api.users.syncUser);

  useEffect(() => {
    if (isLoaded && user) {
      syncUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        imageUrl: user.imageUrl || undefined,
      }).catch(console.error);
    }
  }, [isLoaded, user, syncUser]);
}
