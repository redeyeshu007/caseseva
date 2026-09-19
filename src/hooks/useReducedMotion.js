import { useEffect, useState } from "react";

/**
 * Tracks the user's prefers-reduced-motion setting so scroll-driven
 * and pinned animations can be disabled or replaced with simpler
 * transitions in real time.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (event) => setReduced(event.matches);

    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return reduced;
}
