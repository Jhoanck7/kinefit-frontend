"use client";

import { Badge, Card } from "@/components/ui";

export type TabReporte = "reservas" | "ventas" | "comisiones";

interface ReportesTabSwitcherProps {
  tabActivo: TabReporte;
  onCambiarTab: (tab: TabReporte) => void;
}

export function ReportesTabSwitcher({
  tabActivo,
  onCambiarTab,
}: ReportesTabSwitcherProps) {
  return (
    <Card className="flex flex-wrap items-center justify-between p-4 rounded-none border-slate-200 shadow-none font-sans">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onCambiarTab("reservas")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-none transition-colors ${
            tabActivo === "reservas"
              ? "bg-[#003366] text-white"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          1. Reservas y Métricas
        </button>

        <button
          type="button"
          onClick={() => onCambiarTab("ventas")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-none transition-colors ${
            tabActivo === "ventas"
              ? "bg-[#003366] text-white"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          2. Reporte de Ventas
        </button>

        <button
          type="button"
          onClick={() => onCambiarTab("comisiones")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-none transition-colors ${
            tabActivo === "comisiones"
              ? "bg-[#003366] text-white"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          3. Comisiones y Reparto
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span className="text-[11px] uppercase tracking-wider text-slate-400">
          Acceso:
        </span>
        <Badge className="rounded-none border-slate-200 bg-slate-50 text-[11px] font-medium text-slate-700">
          Solo Administrador
        </Badge>
      </div>
    </Card>
  );
}
