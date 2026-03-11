"use client";

import { useNetworkStatus } from "@/hooks/use-network-status";

/** Mount once (e.g. in root layout) to sync navigator online/offline to chat connection state. */
export function NetworkStatusSync() {
  useNetworkStatus();
  return null;
}
