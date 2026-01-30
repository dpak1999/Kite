"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";

export default function UserSync() {
  const { user, isLoaded } = useUser();
  const syncUser = useMutation(api.users.syncUser);
  const initializeWallet = useMutation(api.wallets.initializeWallet);

  const convexUser = useQuery(
    api.users.getByClerkId,
    user?.id ? { clerkId: user.id } : "skip",
  );

  useEffect(() => {
    const sync = async () => {
      if (!isLoaded || !user) return;
      try {
        await syncUser({
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          imageUrl: user.imageUrl || undefined,
        });
      } catch (e) {
        console.error("Sync error:", e);
      }
    };
    sync();
  }, [user, isLoaded, syncUser]);

  useEffect(() => {
    const init = async () => {
      if (convexUser?._id) {
        try {
          await initializeWallet({ userId: convexUser._id });
        } catch (e) {
          // Ignore if already exists
        }
      }
    };
    init();
  }, [convexUser, initializeWallet]);

  return null;
}
