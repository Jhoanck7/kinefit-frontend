"use client";

import { useContext } from "react";

import { RelojPanelContext } from "@/providers/reloj-panel-provider";

/** `null` hasta que se resuelve en el cliente (un instante, tras el montaje). */
export function useHoyPanel(): Date | null {
  return useContext(RelojPanelContext);
}
