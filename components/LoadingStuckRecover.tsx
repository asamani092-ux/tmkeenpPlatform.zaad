"use client";

import { useEffect } from "react";

/**
 * Soft-nav can stick on route `loading.tsx`. After a generous wait (cold starts
 * often exceed 6s), force a full document load — at most twice per path.
 * Time O(1), Space O(1).
 */
export default function LoadingStuckRecover({
  timeoutMs = 20_000,
}: {
  timeoutMs?: number;
}) {
  useEffect(() => {
    const key = `loading-recover-count:${window.location.pathname}`;
    let count = 0;
    try {
      count = Number(sessionStorage.getItem(key) || "0");
    } catch {
      /* private mode */
    }
    if (count >= 2) return;

    const id = window.setTimeout(() => {
      try {
        sessionStorage.setItem(key, String(count + 1));
      } catch {
        /* ignore */
      }
      window.location.assign(window.location.href);
    }, timeoutMs);

    // Page finished loading (this effect is on loading.tsx which unmounts) —
    // cleanup cancels the timer so healthy loads never reload.
    return () => window.clearTimeout(id);
  }, [timeoutMs]);

  return null;
}
