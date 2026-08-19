"use client";

import { ReactNode } from "react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ModalProps {
  abierto: boolean;
  onCerrar: () => void;
  children: ReactNode;
  ancho?: string;
  className?: string;
}

/**
 * Wrapper delgado sobre Dialog de Radix/shadcn: conserva la API simple del
 * modal original (abierto/onCerrar/children/ancho) mientras usa el motor
 * real de Radix (portal, overlay, foco, ESC). El botón de cierre por
 * defecto de shadcn se oculta porque cada modal consumidor ya dibuja su
 * propio botón ✕ dentro del header que arma en `children`.
 */
export function Modal({
  abierto,
  onCerrar,
  children,
  ancho = "sm:max-w-6xl",
  className,
}: ModalProps) {
  return (
    <Dialog open={abierto} onOpenChange={open => !open && onCerrar()}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "w-full p-0 rounded-none border-slate-200 shadow-none overflow-y-auto max-h-[92vh]",
          ancho,
          className
        )}
      >
        <DialogTitle className="sr-only">Modal</DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  );
}
