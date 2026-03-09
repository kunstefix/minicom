"use client";

import { useEffect, useRef } from "react";

/**
 * Scroll a container to the bottom when dependency (e.g. messages length) changes.
 */
export function useAutoScroll<T>(
  ref: React.RefObject<HTMLDivElement | null>,
  scrollWhen: T
) {
  const prevRef = useRef<T>(scrollWhen);

  useEffect(() => {
    if (ref.current && prevRef.current !== scrollWhen) {
      ref.current.scrollTop = ref.current.scrollHeight;
      prevRef.current = scrollWhen;
    }
  }, [ref, scrollWhen]);
}
