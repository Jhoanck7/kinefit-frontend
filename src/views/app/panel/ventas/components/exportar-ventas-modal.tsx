"use client";

import { Modal } from "@/components/shared";
import { Button } from "@/components/ui";

interface ExportarVentasModalProps {
  abierto: boolean;
  exportando: boolean;
  onExportar: (soloFiltradas: boolean) => void;
  onClose: () => void;
}

/** Modal para elegir si se exportan todas las ventas o solo las del filtro actual */
export function ExportarVentasModal({
  abierto,
  exportando,
  onExportar,
  onClose,
}: ExportarVentasModalProps) {
  return (
    <Modal abierto={abierto} onCerrar={onClose} ancho="sm:max-w-md">
      <div className="bg-white text-foreground font-sans p-6 space-y-4">
        <h3 className="font-sans text-section-title font-bold text-foreground">
          Exportar Ventas
        </h3>
        <p className="font-sans text-sm text-slate-600">
          Elige qué ventas incluir en el archivo.
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="font-sans text-xs font-bold px-4 py-2 border border-slate-200"
          >
            Cancelar
          </button>
          <Button
            variant="outline"
            onClick={() => onExportar(false)}
            disabled={exportando}
          >
            Exportar Todas
          </Button>
          <Button onClick={() => onExportar(true)} disabled={exportando}>
            Exportar Filtradas
          </Button>
        </div>
      </div>
    </Modal>
  );
}
