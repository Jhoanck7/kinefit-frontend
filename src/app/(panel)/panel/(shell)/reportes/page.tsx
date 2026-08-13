"use client";

import { useState } from "react";
import { Card } from "@/components/panel/primitives/Card";
import { ReportesTabSwitcher, TabReporte } from "@/components/panel/reportes/ReportesTabSwitcher";
import { ReporteReservasView } from "@/components/panel/reportes/ReporteReservasView";
import { ReporteVentasView } from "@/components/panel/reportes/ReporteVentasView";
import { ReporteComisionesView } from "@/components/panel/reportes/ReporteComisionesView";

export default function ReportesPage() {
  const [tabActivo, setTabActivo] = useState<TabReporte>("reservas");
  const [rangoFecha, setRangoFecha] = useState("30dias");
  const [compararConAnterior, setCompararConAnterior] = useState(true);

  return (
    <div className="mx-auto max-w-6xl space-y-4 font-sans shadow-none">
      {/* 1. Selector de Pestañas Principales */}
      <ReportesTabSwitcher tabActivo={tabActivo} onCambiarTab={setTabActivo} />

      {/* 2. Barra Superior de Filtros de Fecha */}
      <Card className="flex flex-wrap items-center justify-between p-4 rounded-none border-slate-200 shadow-none text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-400 uppercase tracking-wider text-[11px]">Período:</span>
            <select
              value={rangoFecha}
              onChange={(e) => setRangoFecha(e.target.value)}
              className="rounded-none border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-slate-900 focus:outline-none"
            >
              <option value="hoy">HOY</option>
              <option value="ayer">AYER</option>
              <option value="7dias">ÚLTIMOS 7 DÍAS</option>
              <option value="30dias">ÚLTIMOS 30 DÍAS</option>
              <option value="mesActual">ESTE MES</option>
              <option value="mesAnterior">MES ANTERIOR</option>
              <option value="personalizado">RANGO PERSONALIZADO</option>
            </select>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer font-medium text-xs text-slate-700">
            <input
              type="checkbox"
              checked={compararConAnterior}
              onChange={(e) => setCompararConAnterior(e.target.checked)}
              className="rounded-none text-[#003366] focus:ring-0"
            />
            Comparar con período anterior
          </label>
        </div>

        <div className="text-slate-400 text-xs font-medium">
          Mostrando datos consolidados
        </div>
      </Card>

      {/* 3. Renderizado según la Pestaña Activa */}
      {tabActivo === "reservas" && <ReporteReservasView />}
      {tabActivo === "ventas" && <ReporteVentasView />}
      {tabActivo === "comisiones" && <ReporteComisionesView />}
    </div>
  );
}
