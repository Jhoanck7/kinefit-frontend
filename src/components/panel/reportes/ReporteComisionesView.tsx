"use client";

import { REPORTE_COMISIONES_MOCK } from "@/lib/mock/reportes";
import { Card } from "@/components/panel/primitives/Card";

export function ReporteComisionesView() {
  const data = REPORTE_COMISIONES_MOCK;

  return (
    <div className="space-y-6 text-sm text-panel-sidebar">
      {/* Encabezado e Info de Generación (Centrado) */}
      <Card className="flex flex-wrap items-center justify-center gap-3 text-center">
        <div>
          <h3 className="text-sm font-bold text-panel-sidebar">Liquidación de Sueldos y Reparto de Comisiones</h3>
          <p className="text-sm text-brand-muted">
            Desglose de recaudación bruta, impuestos, cargos POS y honorarios a pagar por profesional
          </p>
        </div>
        <span className="rounded-xl bg-panel-seleccion px-3 py-1.5 text-sm font-semibold text-panel-sidebar">
          Reporte generado: {data.generadoEl}
        </span>
      </Card>

      {/* Tarjetas de Liquidación por Profesional */}
      <div className="space-y-4">
        {data.profesionales.map((p) => {
          const tieneAcuerdo = p.montoProfesional !== undefined && p.montoCentro !== undefined;
          return (
            <Card key={p.especialistaId} className="space-y-4">
              {/* Encabezado del profesional */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-border pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-panel-sidebar text-white font-bold text-sm">
                    {p.especialistaNombre[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-panel-sidebar text-sm">{p.especialistaNombre}</h4>
                    <span className="text-sm text-brand-muted">{p.totalVentas} atenciones procesadas</span>
                  </div>
                </div>

                {tieneAcuerdo ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-800">
                    Acuerdo Vigente: {p.porcentajeProfesionalVigente}% Profesional / {100 - (p.porcentajeProfesionalVigente ?? 50)}% Centro
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-800">
                    {p.ventasSinRepartoVigente} cobro(s) sin acuerdo de reparto
                  </span>
                )}
              </div>

              {/* Grid de desglose de importes */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-sm">
                <div className="bg-panel-fondo p-3 rounded-xl border border-brand-border">
                  <span className="text-brand-muted block font-medium">Recaudación Bruta</span>
                  <span className="text-sm font-bold text-panel-sidebar mt-0.5 block">
                    ${p.montoTotalCobrado.toLocaleString("es-CL")}
                  </span>
                </div>

                <div className="bg-panel-fondo p-3 rounded-xl border border-brand-border">
                  <span className="text-brand-muted block font-medium">Retención IVA</span>
                  <span className="text-sm font-semibold text-panel-sidebar mt-0.5 block">
                    -${p.impuesto.toLocaleString("es-CL")}
                  </span>
                </div>

                <div className="bg-panel-fondo p-3 rounded-xl border border-brand-border">
                  <span className="text-brand-muted block font-medium">Comisión POS Descontada</span>
                  <span className="text-sm font-semibold text-rose-700 mt-0.5 block">
                    {p.comisionTerminal > 0 ? `-$${p.comisionTerminal.toLocaleString("es-CL")}` : "$0"}
                  </span>
                </div>

                <div className="bg-panel-fondo p-3 rounded-xl border border-brand-border">
                  <span className="text-brand-muted block font-medium">Ventas Sin Reparto</span>
                  <span className="text-sm font-bold text-panel-sidebar mt-0.5 block">
                    {p.ventasSinRepartoVigente} atenciones
                  </span>
                </div>
              </div>

              {/* Resultado de Reparto Final */}
              {tieneAcuerdo ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2">
                  <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200 flex justify-between items-center">
                    <div>
                      <span className="text-sm font-semibold text-emerald-800 block">Líquido a Pagar Profesional</span>
                      <span className="text-xs text-emerald-700">
                        {p.porcentajeProfesionalVigente}% de la base líquida
                      </span>
                    </div>
                    <span className="text-xl font-bold text-emerald-800">
                      ${p.montoProfesional?.toLocaleString("es-CL")}
                    </span>
                  </div>

                  <div className="rounded-xl bg-panel-seleccion p-4 border border-brand-border flex justify-between items-center">
                    <div>
                      <span className="text-sm font-semibold text-panel-sidebar block">Margen Neto Clínica</span>
                      <span className="text-xs text-brand-muted">
                        {100 - (p.porcentajeProfesionalVigente ?? 50)}% de la base líquida
                      </span>
                    </div>
                    <span className="text-xl font-bold text-panel-sidebar">
                      ${p.montoCentro?.toLocaleString("es-CL")}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 text-sm text-amber-900">
                  <strong>Atención:</strong> {p.motivoNoCalculable ?? "No hay tasa de reparto registrada."} Configura un convenio en la sección de Ventas para calcular la liquidación.
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
