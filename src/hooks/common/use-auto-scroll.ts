"use client";

import { RefObject, useEffect, useRef } from "react";

interface UseAutoScrollOptions {
  intervalMs?: number;
  enabled?: boolean;
  alAvanzar?: () => boolean;
}

/** Desplaza automáticamente un contenedor horizontal a intervalos, pausable con el mouse */
export function useAutoScroll(
  scrollRef: RefObject<HTMLDivElement | null>,
  { intervalMs = 5000, enabled = true, alAvanzar }: UseAutoScrollOptions = {}
) {
  const pausadoRef = useRef(false);
  const alAvanzarRef = useRef(alAvanzar);

  useEffect(() => {
    alAvanzarRef.current = alAvanzar;
  });

  useEffect(() => {
    if (!enabled) return;

    const avanzar = () => {
      const el = scrollRef.current;
      if (!el || pausadoRef.current) return;
      if (alAvanzarRef.current?.()) return;
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
