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
 * defecto de shadcn se oculta porque cada modal consumidor arma su propio
 * header y usa ModalCloseButton dentro de `children`.
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
          "w-full p-0 rounded-overlay border-border shadow-[0_20px_45px_-20px_rgba(7,51,108,0.30)] overflow-y-auto max-h-[92vh]",
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

export function ModalCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-sans text-xs font-semibold text-muted-foreground hover:text-foreground focus:outline-none"
    >
      Cerrar
    </button>
  );
}
