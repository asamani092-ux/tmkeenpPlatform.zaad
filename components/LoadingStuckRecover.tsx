"use client";

import { useEffect } from "react";

/**
 * If a route `loading.tsx` stays mounted too long (stuck soft navigation),
 * force a full document reload. Time O(1), Space O(1).
 */
export default function LoadingStuckRecover({
  timeoutMs = 6000,
}: {
  timeoutMs?: number;
}) {
  useEffect(() => {
    const id = window.setTimeout(() => {
      window.location.reload();
    }, timeoutMs);
    return () => window.clearTimeout(id);
  }, [timeoutMs]);

  return null;
}
