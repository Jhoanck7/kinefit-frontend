"use client";

import { ReactNode } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

/**
 * Componente de acción simulada (DD-7): toda acción que en el producto
 * real mutaría algo produce esta confirmación visual, que dice
 * explícitamente que en el prototipo no se guarda. Así ningún botón
 * queda inerte (punto 7.9 / G-11).
 */
export function SimulatedActionNotice({
  abierto,
  onCerrar,
  titulo,
  descripcion,
}: {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  descripcion: ReactNode;
}) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} ancho="max-w-md">
      <div className="p-8 text-center">
        <h2 className="text-lg font-semibold text-panel-sidebar">{titulo}</h2>
        <p className="mt-2 text-sm text-brand-muted">{descripcion}</p>
        <p className="mt-3 text-xs text-brand-muted italic">
          Acción simulada: esto no se guarda realmente en el prototipo.
        </p>
        <Button variante="primario" className="mt-6" onClick={onCerrar} autoFocus>
          Entendido
        </Button>
      </div>
    </Modal>
  );
}
