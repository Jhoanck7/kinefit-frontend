"use client";

import { RefObject, useEffect, useRef } from "react";

interface UseMarqueeScrollOptions {
  speed?: number;
  enabled?: boolean;
}

export function useMarqueeScroll(
  scrollRef: RefObject<HTMLDivElement | null>,
  { speed = 0.6, enabled = true }: UseMarqueeScrollOptions = {}
) {
  const pausadoRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    let frameId: number;

    const paso = () => {
      const el = scrollRef.current;
      if (el && !pausadoRef.current) {
        el.scrollLeft += speed;
        const mitad = el.scrollWidth / 2;
        if (el.scrollLeft >= mitad) {
          el.scrollLeft -= mitad;
        }
      }
      frameId = requestAnimationFrame(paso);
    };

    frameId = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(frameId);
  }, [scrollRef, speed, enabled]);

  return {
    pausadoRef,
    onMouseEnter: () => {
      pausadoRef.current = true;
    },
    onMouseLeave: () => {
      pausadoRef.current = false;
    },
  };
}
