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
      const el = ref.current;
      el.scrollTop = el.scrollHeight - el.clientHeight;
      prevRef.current = scrollWhen;
    }
  }, [ref, scrollWhen]);
}
