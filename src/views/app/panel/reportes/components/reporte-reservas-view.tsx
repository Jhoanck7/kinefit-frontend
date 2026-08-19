"use client";

import { Card } from "@/components/ui";
import { useGetReporteReservas } from "@/hooks/api";

interface ReporteReservasViewProps {
  fechaDesde?: string;
  fechaHasta?: string;
  compararCon?: boolean;
}

export function ReporteReservasView({
  fechaDesde,
  fechaHasta,
  compararCon,
}: ReporteReservasViewProps) {
  const { data, isLoading: cargando } = useGetReporteReservas({
    fechaDesde,
    fechaHasta,
    compararCon,
  });

  const indicadores = data?.indicadores;
  const comparacion = data?.comparacion;
  const evolucionTemporal = data?.evolucionTemporal ?? [];
  const distribucionPorHora = data?.distribucionPorHora ?? [];
  const distribucionPorDiaSemana = data?.distribucionPorDiaSemana ?? [];
  const distribucionPorEstado = data?.distribucionPorEstado ?? [];
  const rankingServicios = data?.rankingServicios ?? [];
  const rankingProfesionales = data?.rankingProfesionales ?? [];
  const rankingClientes = data?.rankingClientes ?? [];
  const clientesNuevos = data?.clientesNuevos ?? 0;
  const clientesRecurrentes = data?.clientesRecurrentes ?? 0;
  const web = data?.origen.web ?? 0;
  const manual = data?.origen.manual ?? 0;

  const maxReservasEvolucion = Math.max(
    ...evolucionTemporal.map(p => p.reservas),
    1
  );
  const maxHora = Math.max(...distribucionPorHora.map(p => p.cantidad), 1);
  const maxDia = Math.max(...distribucionPorDiaSemana.map(p => p.cantidad), 1);

  const totalEstado =
    distribucionPorEstado.reduce((acc, e) => acc + e.cantidad, 0) || 1;
  const totalOrigen = web + manual || 1;
  const totalRetencion = clientesNuevos + clientesRecurrentes || 1;
  const pctNuevos = Math.round((clientesNuevos / totalRetencion) * 100);
  const pctRecurrentes = Math.round(
    (clientesRecurrentes / totalRetencion) * 100
  );

  if (cargando) {
    return (
      <Card className="p-6">
        <p className="py-8 text-center text-sm text-brand-muted">
          Cargando reporte de reservas...
        </p>
      </Card>
    );
  }

  if (!indicadores || indicadores.reservasTotales === 0) {
    return (
      <Card className="p-6">
        <p className="py-8 text-center text-sm text-brand-muted">
          Sin reservas registradas en el período seleccionado.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 text-sm text-panel-sidebar">
      {/* 1. KPIs principales con Variación */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* KPI 1: Reservas Totales */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-wider text-brand-muted">
              Reservas Totales
            </span>
            {comparacion?.variacionReservasTotales !== undefined && (
              <span className="rounded-none bg-emerald-700 px-2.5 py-1 text-sm font-bold text-white">
                {comparacion.variacionReservasTotales >= 0 ? "+" : ""}
                {comparacion.variacionReservasTotales}% vs anterior
              </span>
            )}
          </div>
          <p className="mt-3 text-2xl font-bold text-panel-sidebar">
            {indicadores.reservasTotales}
          </p>
          <p className="mt-1 text-sm text-brand-muted">
            Citas agendadas en el rango seleccionado
          </p>
        </Card>

        {/* KPI 2: Porcentaje de Ocupación */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-wider text-brand-muted">
              Tasa de Ocupación
            </span>
            {comparacion?.variacionPorcentajeOcupacion !== undefined && (
              <span className="rounded-none bg-emerald-700 px-2.5 py-1 text-sm font-bold text-white">
                {comparacion.variacionPorcentajeOcupacion >= 0 ? "+" : ""}
                {comparacion.variacionPorcentajeOcupacion}% vs anterior
              </span>
            )}
          </div>
          <p className="mt-3 text-2xl font-bold text-panel-sidebar">
            {indicadores.porcentajeOcupacion}%
          </p>
          <p className="mt-1 text-sm text-brand-muted">
            Bloques ocupados vs disponibles en agenda
          </p>
        </Card>

        {/* KPI 3: Tasa de Inasistencias */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-wider text-brand-muted">
              Tasa de Inasistencias
            </span>
            {comparacion?.variacionTasaInasistencias !== undefined && (
              <span className="rounded-none bg-emerald-700 px-2.5 py-1 text-sm font-bold text-white">
                {comparacion.variacionTasaInasistencias}% vs anterior
              </span>
            )}
          </div>
          <p className="mt-3 text-2xl font-bold text-panel-sidebar">
            {indicadores.tasaInasistencias}%
          </p>
          <p className="mt-1 text-sm text-brand-muted">
            Citas no asistidas o canceladas a última hora
          </p>
        </Card>
      </div>

      {/* 2. Gráfico de Evolución Temporal */}
      {evolucionTemporal.length > 0 && (
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-sm font-bold text-panel-sidebar">
                Evolución Temporal de Reservas e Ingresos
              </h3>
              <p className="text-sm text-brand-muted">
                Comportamiento diario/semanal durante el rango seleccionado
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm font-semibold text-panel-sidebar">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-panel-sidebar inline-block" />{" "}
                Reservas (N°)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-slate-400 inline-block" />{" "}
                Ingresos ($ CLP)
              </span>
            </div>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 pt-6 border-b border-brand-border pb-2">
            {evolucionTemporal.map(item => {
              const alturaPct = Math.round(
                (item.reservas / maxReservasEvolucion) * 100
              );
              return (
                <div
                  key={item.periodo}
                  className="flex-1 flex flex-col items-center gap-2 group relative"
                >
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-panel-sidebar text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                    {item.reservas} citas | $
                    {item.ingresos.toLocaleString("es-CL")}
                  </div>
                  <span className="text-xs font-bold text-panel-sidebar">
                    {item.reservas}
                  </span>
                  <div
                    style={{ height: `${alturaPct}%` }}
                    className="w-full max-w-[36px] rounded-t-lg bg-panel-sidebar transition-all group-hover:opacity-80"
                  />
                  <span className="text-xs font-semibold text-brand-muted mt-1">
                    {item.periodo}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 3. Distribuciones */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h4 className="text-sm font-bold uppercase tracking-wider text-brand-muted mb-4">
            Horarios de Mayor Demanda (Distribución por Hora)
          </h4>
          <div className="space-y-3">
            {distribucionPorHora.map(h => {
              const pct = Math.round((h.cantidad / maxHora) * 100);
              return (
                <div
                  key={h.etiqueta}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="w-12 font-semibold text-panel-sidebar">
                    {h.etiqueta}
                  </span>
                  <div className="flex-1 h-3 rounded-full bg-panel-seleccion overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-panel-sidebar rounded-full transition-all"
                    />
                  </div>
                  <span className="w-8 text-right font-bold text-panel-sidebar">
                    {h.cantidad}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="text-sm font-bold uppercase tracking-wider text-brand-muted mb-4">
            Demanda por Día de la Semana
          </h4>
          <div className="space-y-3">
            {distribucionPorDiaSemana.map(d => {
              const pct = Math.round((d.cantidad / maxDia) * 100);
              return (
                <div
                  key={d.etiqueta}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="w-16 font-semibold text-panel-sidebar">
                    {d.etiqueta}
                  </span>
                  <div className="flex-1 h-3 rounded-full bg-panel-seleccion overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-panel-sidebar rounded-full transition-all"
                    />
                  </div>
                  <span className="w-8 text-right font-bold text-panel-sidebar">
                    {d.cantidad}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* 4. Estado de Citas, Origen y Retención */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="p-6 space-y-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-brand-muted">
            Distribución por Estado
          </h4>
          <div className="space-y-2 text-sm">
            {distribucionPorEstado.map(e => (
              <div
                key={e.etiqueta}
                className="flex justify-between items-center p-2 rounded-lg bg-panel-fondo"
              >
                <span className="font-semibold text-panel-sidebar">
                  {e.etiqueta}
                </span>
                <span className="font-bold text-panel-sidebar">
                  {e.cantidad} ({Math.round((e.cantidad / totalEstado) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-brand-muted">
            Origen de Reservas
          </h4>
          <div className="space-y-3 pt-1">
            {[
              { etiqueta: "Reserva Web", cantidad: web },
              { etiqueta: "Agendamiento Manual", cantidad: manual },
            ].map(o => {
              const pct = Math.round((o.cantidad / totalOrigen) * 100);
              return (
                <div key={o.etiqueta} className="space-y-1">
                  <div className="flex justify-between text-sm font-bold text-panel-sidebar">
                    <span>{o.etiqueta}</span>
                    <span>
                      {o.cantidad} ({pct}%)
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-panel-seleccion overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-panel-sidebar"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6 space-y-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-brand-muted">
            Retención de Pacientes
          </h4>
          <div className="pt-2 text-center">
            <span className="text-2xl font-bold text-panel-sidebar">
              {pctRecurrentes}%
            </span>
            <span className="text-sm font-semibold text-brand-muted block mt-0.5">
              Pacientes Recurrentes
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-sm pt-2 border-t border-brand-border">
            <div className="bg-panel-fondo p-2 rounded-lg">
              <span className="font-bold text-panel-sidebar block">
                {clientesNuevos}
              </span>
              <span className="text-xs text-brand-muted">
                Nuevos ({pctNuevos}%)
              </span>
            </div>
            <div className="bg-panel-fondo p-2 rounded-lg">
              <span className="font-bold text-panel-sidebar block">
                {clientesRecurrentes}
              </span>
              <span className="text-xs text-brand-muted">Recurrentes</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 5. Rankings */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <h4 className="text-sm font-bold uppercase tracking-wider text-brand-muted mb-3">
            Top Servicios Solicitados
          </h4>
          <div className="divide-y divide-brand-border text-sm">
            {rankingServicios.map((s, idx) => (
              <div
                key={s.id}
                className="py-2.5 flex justify-between items-center"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-panel-sidebar text-sm">
                    #{idx + 1}
                  </span>
                  <span className="font-medium text-panel-sidebar">
                    {s.nombre}
                  </span>
                </div>
                <span className="font-bold text-panel-sidebar bg-panel-seleccion px-2 py-0.5 rounded">
                  {s.cantidad} citas
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="text-sm font-bold uppercase tracking-wider text-brand-muted mb-3">
            Top Especialistas
          </h4>
          <div className="divide-y divide-brand-border text-xs text-sm">
            {rankingProfesionales.map((p, idx) => (
              <div
                key={p.id}
                className="py-2.5 flex justify-between items-center"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-panel-sidebar text-sm">
                    #{idx + 1}
                  </span>
                  <span className="font-medium text-panel-sidebar">
                    {p.nombre}
                  </span>
                </div>
                <span className="font-bold text-panel-sidebar bg-panel-seleccion px-2 py-0.5 rounded">
                  {p.cantidad} atenciones
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="text-sm font-bold uppercase tracking-wider text-brand-muted mb-3">
            Pacientes Más Frecuentes
          </h4>
          <div className="divide-y divide-brand-border text-sm">
            {rankingClientes.map((c, idx) => (
              <div
                key={c.id}
                className="py-2.5 flex justify-between items-center"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-panel-sidebar text-sm">
                    #{idx + 1}
                  </span>
                  <span className="font-medium text-panel-sidebar">
                    {c.nombre}
                  </span>
                </div>
                <span className="font-bold text-panel-sidebar bg-panel-seleccion px-2 py-0.5 rounded">
                  {c.cantidad} visitas
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
