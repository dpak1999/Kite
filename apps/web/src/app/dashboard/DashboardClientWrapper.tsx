"use client";

import { useSyncUser } from "@/hooks/useSyncUser";

export default function DashboardClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sync current user to Convex on dashboard load
  useSyncUser();

  return <>{children}</>;
}
