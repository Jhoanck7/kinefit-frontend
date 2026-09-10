"use client";

import {
  Card,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@/components/ui";

import {
  ReporteComisionesView,
  ReporteReservasView,
  ReportesTabSwitcher,
  ReporteVentasView,
} from "./components";
import { useReportes } from "./hooks";

const OPCIONES_PERIODO = [
  { value: "hoy", etiqueta: "HOY" },
  { value: "ayer", etiqueta: "AYER" },
  { value: "7dias", etiqueta: "ÚLTIMOS 7 DÍAS" },
  { value: "30dias", etiqueta: "ÚLTIMOS 30 DÍAS" },
  { value: "mesActual", etiqueta: "ESTE MES" },
  { value: "mesAnterior", etiqueta: "MES ANTERIOR" },
  { value: "personalizado", etiqueta: "PERSONALIZADO…" },
];

const OPCIONES_VISTA = [
  { value: "dia", etiqueta: "Diario" },
  { value: "semana", etiqueta: "Semanal" },
  { value: "mes", etiqueta: "Mensual" },
];

export default function ReportesView() {
  const {
    tabActivo,
    rangoFecha,
    compararConAnterior,
    vista,
    customDesde,
    customHasta,
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

      {/* 2. Barra Superior de Filtros */}
      <Card className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-none border-slate-200 shadow-none text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Selector de período */}
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

          {/* Inputs de rango personalizado */}
          {rangoFecha === "personalizado" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customDesde}
                onChange={e => actions.setCustomDesde(e.target.value)}
                className="rounded-none border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300"
              />
              <span className="text-slate-400">—</span>
              <input
                type="date"
                value={customHasta}
                min={customDesde}
                onChange={e => actions.setCustomHasta(e.target.value)}
                className="rounded-none border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300"
              />
            </div>
          )}

          {/* Selector de granularidad (solo en tab Reservas) */}
          {tabActivo === "reservas" && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-400 uppercase tracking-wider text-[11px]">
                Vista:
              </span>
              <Select
                value={vista}
                onValueChange={v =>
                  actions.setVista(v as "dia" | "semana" | "mes")
                }
              >
                <SelectTrigger size="sm" className="rounded-none text-xs w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPCIONES_VISTA.map(op => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.etiqueta}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Toggle comparar con período anterior (solo en tab Reservas) */}
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
          Datos consolidados
        </div>
      </Card>

      {/* 3. Renderizado según la Pestaña Activa */}
      {tabActivo === "reservas" && (
        <ReporteReservasView
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
          compararCon={compararConAnterior}
          vista={vista}
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
