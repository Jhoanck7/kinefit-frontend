"use client";

import { RefObject, useEffect, useRef } from "react";

interface UseAutoScrollOptions {
  intervalMs?: number;
  enabled?: boolean;
}

export function useAutoScroll(
  scrollRef: RefObject<HTMLDivElement | null>,
  { intervalMs = 5000, enabled = true }: UseAutoScrollOptions = {}
) {
  const pausadoRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const avanzar = () => {
      const el = scrollRef.current;
      if (!el || pausadoRef.current) return;
      const { scrollLeft, clientWidth, scrollWidth } = el;
      if (scrollLeft + clientWidth >= scrollWidth - 24) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: clientWidth, behavior: "smooth" });
      }
    };

    const timer = setInterval(avanzar, intervalMs);
    return () => clearInterval(timer);
  }, [scrollRef, intervalMs, enabled]);

  return {
    onMouseEnter: () => {
      pausadoRef.current = true;
    },
    onMouseLeave: () => {
      pausadoRef.current = false;
    },
  };
}
