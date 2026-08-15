"use client";

import { ReporteComisionesView } from "@/components/panel/reportes/ReporteComisionesView";
import { ReporteReservasView } from "@/components/panel/reportes/ReporteReservasView";
import { ReportesTabSwitcher } from "@/components/panel/reportes/ReportesTabSwitcher";
import { ReporteVentasView } from "@/components/panel/reportes/ReporteVentasView";
import {
  Card,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@/components/ui";

import { useReportes } from "./hooks";

const OPCIONES_PERIODO = [
  { value: "hoy", etiqueta: "HOY" },
  { value: "ayer", etiqueta: "AYER" },
  { value: "7dias", etiqueta: "ÚLTIMOS 7 DÍAS" },
  { value: "30dias", etiqueta: "ÚLTIMOS 30 DÍAS" },
  { value: "mesActual", etiqueta: "ESTE MES" },
  { value: "mesAnterior", etiqueta: "MES ANTERIOR" },
];

export default function ReportesView() {
  const {
    tabActivo,
    rangoFecha,
    compararConAnterior,
    fechaDesde,
    fechaHasta,
    actions,
  } = useReportes();

  return (
    <div className="mx-auto max-w-6xl space-y-4 font-sans shadow-none">
      {/* 1. Selector de Pestañas Principales */}
      <ReportesTabSwitcher
        tabActivo={tabActivo}
        onCambiarTab={actions.setTabActivo}
      />

      {/* 2. Barra Superior de Filtros de Fecha */}
      <Card className="flex flex-wrap items-center justify-between p-4 rounded-none border-slate-200 shadow-none text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-400 uppercase tracking-wider text-[11px]">
              Período:
            </span>
            <Select value={rangoFecha} onValueChange={actions.setRangoFecha}>
              <SelectTrigger size="sm" className="rounded-none text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPCIONES_PERIODO.map(opcion => (
                  <SelectItem key={opcion.value} value={opcion.value}>
                    {opcion.etiqueta}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {tabActivo === "reservas" && (
            <label className="flex items-center gap-2 cursor-pointer font-medium text-xs text-slate-700">
              <Switch
                checked={compararConAnterior}
                onCheckedChange={actions.setCompararConAnterior}
              />
              Comparar con período anterior
            </label>
          )}
        </div>

        <div className="text-slate-400 text-xs font-medium">
          Mostrando datos consolidados
        </div>
      </Card>

      {/* 3. Renderizado según la Pestaña Activa */}
      {tabActivo === "reservas" && (
        <ReporteReservasView
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
          compararCon={compararConAnterior}
        />
      )}
      {tabActivo === "ventas" && (
        <ReporteVentasView fechaDesde={fechaDesde} fechaHasta={fechaHasta} />
      )}
      {tabActivo === "comisiones" && (
        <ReporteComisionesView
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
        />
      )}
    </div>
  );
}
