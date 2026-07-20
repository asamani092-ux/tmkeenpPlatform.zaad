"use client";

import { useEffect, useState } from "react";

/** Sync client state when server props refresh — O(1) per prop change */
export function useSyncFromProps<T>(prop: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState(prop);
  useEffect(() => {
    setState(prop);
  }, [prop]);
  return [state, setState];
}
