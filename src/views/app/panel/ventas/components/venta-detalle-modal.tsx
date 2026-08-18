"use client";

import { Modal } from "@/components/shared";
import { formatearFechaHora } from "@/lib/formato";
import { VentaResponse } from "@/models/responses";

interface VentaDetalleModalProps {
  venta: VentaResponse | null;
  onClose: () => void;
}

export function VentaDetalleModal({ venta, onClose }: VentaDetalleModalProps) {
  if (!venta) return null;

  const primerItem = venta.items[0];
  const montoNeto = venta.desglose.montoTotal - (venta.desglose.impuesto ?? 0);
  const baseReparticion = montoNeto - venta.desglose.comisionTerminal;
  const repartoConfigurado =
    venta.desglose.montoProfesional !== undefined &&
    venta.desglose.montoCentro !== undefined;

  function handleImprimir() {
    window.print();
  }

  return (
    <Modal abierto={Boolean(venta)} onCerrar={onClose}>
      <div className="bg-white text-slate-900 font-sans shadow-none rounded-none">
        {/* Encabezado Formal */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
          <div>
            <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900">
              Comprobante de Venta{" "}
              <span className="font-sans font-bold text-slate-900">
                #{venta.id}
              </span>
            </h2>
            <p className="font-sans text-xs text-slate-500 mt-0.5">
              {formatearFechaHora(new Date(venta.createdAt))}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1 font-sans text-sm text-slate-400 hover:text-slate-900 rounded-none focus:outline-none"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo en 2 Columnas */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* COLUMNA IZQUIERDA (2/3) - DESGLOSE CONTABLE */}
          <div className="md:col-span-2 p-6 space-y-6">
            <div>
              <h3 className="border-b border-slate-200 pb-1 font-sans text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-3">
                DESGLOSE CONTABLE
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Monto Cobrado (Bruto)
                  </span>
                  <span className="font-sans font-medium text-sm text-slate-900">
                    ${venta.desglose.montoTotal.toLocaleString("es-CL")} CLP
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    IVA (
                    {venta.desglose.impuesto && venta.desglose.impuesto > 0
                      ? "Afecto"
                      : "Exento"}
                    )
                  </span>
                  <span className="font-sans font-medium text-sm text-slate-700">
                    -${(venta.desglose.impuesto ?? 0).toLocaleString("es-CL")}{" "}
                    CLP
                  </span>
                </div>

                <div className="border-t border-slate-200 my-1" />

                <div className="flex justify-between items-center text-sm">
                  <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Monto Neto Real
                  </span>
                  <span className="font-sans font-medium text-sm text-slate-900">
                    ${montoNeto.toLocaleString("es-CL")} CLP
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Comisión POS{" "}
                    {venta.terminalNombre ? `(${venta.terminalNombre})` : ""}
                  </span>
                  <span className="font-sans font-medium text-sm text-slate-700">
                    -${venta.desglose.comisionTerminal.toLocaleString("es-CL")}{" "}
                    CLP
                  </span>
                </div>

                <div className="border-t border-slate-200 my-1" />

                <div className="flex justify-between items-center text-sm">
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#003366]">
                    Base Líquida a Repartir
                  </span>
                  <span className="font-sans font-bold text-sm text-[#003366]">
                    ${baseReparticion.toLocaleString("es-CL")} CLP
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="border-b border-slate-200 pb-1 font-sans text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-3">
                DISTRIBUCIÓN DE HONORARIOS
              </h3>
              {repartoConfigurado ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      Pago Especialista (
                      {venta.desglose.porcentajeProfesionalAplicado ?? 50}%)
                    </span>
                    <span className="font-sans font-medium text-sm text-slate-900">
                      $
                      {venta.desglose.montoProfesional!.toLocaleString("es-CL")}{" "}
                      CLP
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      Margen Clínica (
                      {100 -
                        (venta.desglose.porcentajeProfesionalAplicado ?? 50)}
                      %)
                    </span>
                    <span className="font-sans font-medium text-sm text-slate-900">
                      ${venta.desglose.montoCentro!.toLocaleString("es-CL")} CLP
                    </span>
                  </div>
                </div>
              ) : (
                <p className="font-sans text-xs text-slate-500">
                  {venta.desglose.motivoNoCalculable ??
                    "Sin acuerdo de reparto registrado al momento de la transacción."}
                </p>
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA (1/3) - FICHA DE LA ATENCIÓN */}
          <div className="md:col-span-1 bg-slate-50/80 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="border-b border-slate-200 pb-1 font-sans text-[10px] font-medium uppercase tracking-widest text-slate-400">
                DATOS DE LA ATENCIÓN
              </h3>

              <div>
                <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Paciente
                </span>
                <p className="font-sans font-medium text-sm text-slate-900 mt-0.5">
                  {venta.pacienteNombre ?? "Cliente sin registrar"}
                </p>
              </div>

              <div>
                <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Servicio
                </span>
                <p className="font-sans font-medium text-sm text-slate-900 mt-0.5">
                  {primerItem?.servicioNombre ??
                    primerItem?.descripcion ??
                    "Atención general"}
                </p>
              </div>

              {venta.creadoPorNombre && (
                <div>
                  <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                    Registrada por
                  </span>
                  <p className="font-sans font-medium text-sm text-slate-900 mt-0.5">
                    {venta.creadoPorNombre}
                  </p>
                </div>
              )}

              <div>
                <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Medio de Pago
                </span>
                <p className="font-sans font-medium text-sm text-slate-900 mt-0.5">
                  {venta.metodoPago}{" "}
                  {venta.terminalNombre ? `· ${venta.terminalNombre}` : ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pie de Acciones */}
        <div className="border-t border-slate-200 bg-slate-50/60 p-4 flex justify-between items-center">
          <button
            type="button"
            onClick={handleImprimir}
            className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 rounded-none shadow-none"
          >
            IMPRIMIR COMPROBANTE
          </button>
          <button
            type="button"
            onClick={onClose}
            className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white rounded-none shadow-none"
          >
            CERRAR
          </button>
        </div>
      </div>
    </Modal>
  );
}
