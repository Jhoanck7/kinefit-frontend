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
    <div className="mx-auto max-w-6xl space-y-6">
      {/* 1. Selector de Pestañas Principales (Centrado) */}
      <ReportesTabSwitcher tabActivo={tabActivo} onCambiarTab={setTabActivo} />

      {/* 2. Barra Superior de Filtros de Fecha de Reportes (Centrado) */}
      <Card className="flex flex-wrap items-center justify-center gap-4 text-sm text-panel-sidebar">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-brand-muted text-sm">Período de Análisis:</span>
            <select
              value={rangoFecha}
              onChange={(e) => setRangoFecha(e.target.value)}
              className="rounded-lg border border-brand-border bg-panel-fondo px-3 py-2 font-medium text-sm text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
            >
              <option value="hoy">Hoy</option>
              <option value="ayer">Ayer</option>
              <option value="7dias">Últimos 7 días</option>
              <option value="30dias">Últimos 30 días</option>
              <option value="mesActual">Este Mes</option>
              <option value="mesAnterior">Mes Anterior</option>
              <option value="personalizado">Rango Personalizado</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer font-medium text-sm text-panel-sidebar">
            <input
              type="checkbox"
              checked={compararConAnterior}
              onChange={(e) => setCompararConAnterior(e.target.checked)}
              className="rounded text-panel-sidebar focus:ring-panel-sidebar"
            />
            Comparar con período anterior
          </label>
        </div>

        <div className="text-brand-muted text-sm font-medium">
          Mostrando datos consolidados (Datos de prueba)
        </div>
      </Card>

      {/* 3. Renderizado según la Pestaña Activa */}
      {tabActivo === "reservas" && <ReporteReservasView />}
      {tabActivo === "ventas" && <ReporteVentasView />}
      {tabActivo === "comisiones" && <ReporteComisionesView />}
    </div>
  );
}
