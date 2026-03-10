"use client";

import { useEffect, useRef } from "react";

/** Delay before reporting "typing" (avoids showing on single keystroke). */
const TYPING_SHOW_MS = 400;
/** Delay after last keystroke before reporting "not typing". */
const TYPING_HIDE_MS = 1500;

/**
 * Converts a raw "has input" signal into a debounced typing signal:
 * - Emits true only after showMs of continuous input.
 * - Emits false after hideMs of no input, or immediately when input is cleared.
 * Pass inputValue so the effect runs on each keystroke and can reset the hide timer.
 */
export function useDebouncedTypingIndicator(
  inputValue: string,
  onTypingChange: (typing: boolean) => void,
  options?: { showMs?: number; hideMs?: number }
) {
  const showMs = options?.showMs ?? TYPING_SHOW_MS;
  const hideMs = options?.hideMs ?? TYPING_HIDE_MS;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reportedRef = useRef<boolean | null>(null);
  const timeoutKindRef = useRef<"show" | "hide" | null>(null);
  const hasContent = inputValue.trim().length > 0;

  const clear = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      timeoutKindRef.current = null;
    }
  };

  useEffect(() => {
    if (!hasContent) {
      clear();
      if (reportedRef.current !== false) {
        reportedRef.current = false;
        onTypingChange(false);
      }
      return clear;
    }

    if (reportedRef.current === true) {
      clear();
      timeoutKindRef.current = "hide";
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        timeoutKindRef.current = null;
        reportedRef.current = false;
        onTypingChange(false);
      }, hideMs);
      return clear;
    }

    if (!timeoutRef.current) {
      timeoutKindRef.current = "show";
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        timeoutKindRef.current = null;
        reportedRef.current = true;
        onTypingChange(true);
      }, showMs);
    }
    return () => {
      if (timeoutKindRef.current === "hide") clear();
    };
  }, [inputValue, onTypingChange, showMs, hideMs]);

  useEffect(() => {
    return () => {
      clear();
      onTypingChange(false);
    };
  }, [onTypingChange]);
}
