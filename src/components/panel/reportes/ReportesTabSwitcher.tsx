"use client";

import { Card } from "@/components/panel/primitives/Card";
import { NeutralBadge } from "@/components/panel/primitives/Badge";

export type TabReporte = "reservas" | "ventas" | "comisiones";

interface ReportesTabSwitcherProps {
  tabActivo: TabReporte;
  onCambiarTab: (tab: TabReporte) => void;
}

export function ReportesTabSwitcher({ tabActivo, onCambiarTab }: ReportesTabSwitcherProps) {
  return (
    <Card className="flex flex-wrap items-center justify-center gap-4 text-sm text-panel-sidebar">
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => onCambiarTab("reservas")}
          className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
            tabActivo === "reservas"
              ? "bg-panel-sidebar text-white shadow"
              : "bg-panel-seleccion text-panel-sidebar hover:bg-panel-fondo"
          }`}
        >
          1. Reservas y Métricas
        </button>

        <button
          type="button"
          onClick={() => onCambiarTab("ventas")}
          className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
            tabActivo === "ventas"
              ? "bg-panel-sidebar text-white shadow"
              : "bg-panel-seleccion text-panel-sidebar hover:bg-panel-fondo"
          }`}
        >
          2. Reporte de Ventas
        </button>

        <button
          type="button"
          onClick={() => onCambiarTab("comisiones")}
          className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
            tabActivo === "comisiones"
              ? "bg-panel-sidebar text-white shadow"
              : "bg-panel-seleccion text-panel-sidebar hover:bg-panel-fondo"
          }`}
        >
          3. Comisiones y Reparto
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm text-brand-muted font-medium">
        <span>Acceso restringido:</span>
        <NeutralBadge>Solo Administrador</NeutralBadge>
      </div>
    </Card>
  );
}
