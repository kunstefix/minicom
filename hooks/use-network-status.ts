"use client";

import { useEffect } from "react";
import { useChatStore } from "@/store/chat-store";

/**
 * Syncs navigator.onLine (and online/offline events) to the chat store so the
 * offline banner shows as soon as the device loses network, without waiting
 * for the Realtime channel to report CLOSED/CHANNEL_ERROR.
 */
export function useNetworkStatus() {
  const setConnectionState = useChatStore((s) => s.setConnectionState);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOffline = () => setConnectionState("disconnected");
    const handleOnline = () => setConnectionState("connecting");

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [setConnectionState]);
}
