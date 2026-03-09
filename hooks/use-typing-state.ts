"use client";

import { useState, useCallback } from "react";

/**
 * Local typing state: isUserTyping and last change for debounce.
 */
export function useTypingState() {
  const [isTyping, setIsTyping] = useState(false);

  const setTyping = useCallback((typing: boolean) => {
    setIsTyping(typing);
  }, []);

  return { isTyping, setTyping };
}
