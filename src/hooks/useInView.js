import { useEffect, useRef, useState } from "react";

/**
 * Reports whether an element is currently intersecting the viewport.
 * Used to lazy-mount and pause the React Three Fiber scene in the
 * Assembly section so it never runs off-screen.
 */
export function useInView({ rootMargin = "0px", threshold = 0.15 } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin, threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return [ref, inView];
}
