"use client";

import { Modal, ModalCloseButton } from "@/components/shared";
import { formatearFechaHora } from "@/lib/formato";
import { TerminalPagoResponse, VentaResponse } from "@/models/responses";

interface VentaDetalleModalProps {
  venta: VentaResponse | null;
  terminales: TerminalPagoResponse[];
  onClose: () => void;
}

export function VentaDetalleModal({
  venta,
  terminales,
  onClose,
}: VentaDetalleModalProps) {
  if (!venta) return null;

  const primerItem = venta.items[0];
  const montoNeto = venta.desglose.montoTotal - (venta.desglose.impuesto ?? 0);
  const baseReparticion = montoNeto - venta.desglose.comisionTerminal;
  const repartoConfigurado =
    venta.desglose.montoProfesional !== undefined &&
    venta.desglose.montoCentro !== undefined;
  const terminalUsado = terminales.find(t => t.id === venta.terminalPagoId);

  function handleImprimir() {
    window.print();
  }

  return (
    <Modal abierto={Boolean(venta)} onCerrar={onClose}>
      <div className="bg-white text-foreground font-sans shadow-none rounded-overlay">
        {/* Encabezado Formal */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-slate-50/80 backdrop-blur-sm px-6 py-4">
          <div>
            <h2 className="font-sans text-section-title font-bold text-foreground">
              Comprobante de Venta{" "}
              <span className="font-sans font-bold text-foreground">
                #{venta.id}
              </span>
            </h2>
            <p className="font-sans text-xs text-slate-500 mt-0.5">
              {formatearFechaHora(new Date(venta.createdAt))}
            </p>
          </div>
          <ModalCloseButton onClick={onClose} />
        </div>

        {/* Cuerpo en 2 Columnas */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* COLUMNA IZQUIERDA (2/3) - DESGLOSE CONTABLE */}
          <div className="md:col-span-2 p-6 space-y-6">
            <div>
              <h3 className="border-b border-border pb-1 font-sans text-micro-header font-medium text-muted-foreground mb-3">
                Desglose Contable
              </h3>
              <div className="space-y-3">
                {Boolean(venta.desglose.descuentoConvenio) && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-sans text-label font-medium text-muted-foreground">
                        Precio de Lista
                      </span>
                      <span className="font-sans font-medium text-value text-foreground">
                        $
                        {(
                          venta.desglose.montoTotal +
                          venta.desglose.descuentoConvenio!
                        ).toLocaleString("es-CL")}{" "}
                        CLP
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-sans text-label font-medium text-muted-foreground">
                        Descuento Convenio
                      </span>
                      <span className="font-sans font-medium text-value text-slate-700">
                        -$
                        {venta.desglose.descuentoConvenio!.toLocaleString(
                          "es-CL"
                        )}{" "}
                        CLP
                      </span>
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center text-sm">
                  <span className="font-sans text-label font-medium text-muted-foreground">
                    Monto Cobrado (Bruto)
                  </span>
                  <span className="font-sans font-medium text-value text-foreground">
                    ${venta.desglose.montoTotal.toLocaleString("es-CL")} CLP
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="font-sans text-label font-medium text-muted-foreground">
                    IVA (
                    {venta.desglose.impuesto && venta.desglose.impuesto > 0
                      ? "Afecto"
                      : "Exento"}
                    )
                  </span>
                  <span className="font-sans font-medium text-value text-slate-700">
                    -${(venta.desglose.impuesto ?? 0).toLocaleString("es-CL")}{" "}
                    CLP
                  </span>
                </div>

                <div className="border-t border-slate-200 my-1" />

                <div className="flex justify-between items-center text-sm">
                  <span className="font-sans text-label font-medium text-muted-foreground">
                    Monto Neto Real
                  </span>
                  <span className="font-sans font-medium text-value text-foreground">
                    ${montoNeto.toLocaleString("es-CL")} CLP
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="font-sans text-label font-medium text-muted-foreground">
                    Comisión POS{" "}
                    {venta.terminalNombre ? `(${venta.terminalNombre})` : ""}
                  </span>
                  <span className="font-sans font-medium text-value text-slate-700">
                    -${venta.desglose.comisionTerminal.toLocaleString("es-CL")}{" "}
                    CLP
                  </span>
                </div>

                {Boolean(venta.desglose.impuestoComisionTerminal) && (
                  <p className="text-right font-sans text-[11px] text-slate-400 -mt-1">
                    (incluye impuesto de comisión: $
                    {venta.desglose.impuestoComisionTerminal!.toLocaleString(
                      "es-CL"
                    )}{" "}
                    CLP)
                  </p>
                )}

                <div className="border-t border-slate-200 my-1" />

                <div className="flex justify-between items-center text-sm">
                  <span className="font-sans text-label font-bold text-primary">
                    Base Líquida a Repartir
                  </span>
                  <span className="font-sans font-bold text-value text-primary">
                    ${baseReparticion.toLocaleString("es-CL")} CLP
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="border-b border-border pb-1 font-sans text-micro-header font-medium text-muted-foreground mb-3">
                Distribución de Honorarios
              </h3>
              {repartoConfigurado ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-sans text-label font-medium text-muted-foreground">
                      Pago Especialista (
                      {venta.desglose.porcentajeProfesionalAplicado ?? 50}%)
                    </span>
                    <span className="font-sans font-medium text-value text-foreground">
                      $
                      {venta.desglose.montoProfesional!.toLocaleString("es-CL")}{" "}
                      CLP
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-sans text-label font-medium text-muted-foreground">
                      Margen de la Empresa (
                      {100 -
                        (venta.desglose.porcentajeProfesionalAplicado ?? 50)}
                      %)
                    </span>
                    <span className="font-sans font-medium text-value text-foreground">
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
              <h3 className="border-b border-border pb-1 font-sans text-micro-header font-medium text-muted-foreground">
                Datos de la Atención
              </h3>

              <div>
                <span className="font-sans text-label font-medium text-muted-foreground block">
                  Paciente
                </span>
                <p className="font-sans font-medium text-value text-foreground mt-0.5">
                  {venta.pacienteNombre ?? "Cliente sin registrar"}
                </p>
              </div>

              <div>
                <span className="font-sans text-label font-medium text-muted-foreground block">
                  Servicio
                </span>
                <p className="font-sans font-medium text-value text-foreground mt-0.5">
                  {primerItem?.servicioNombre ??
                    primerItem?.descripcion ??
                    "Atención general"}
                </p>
              </div>

              {venta.creadoPorNombre && (
                <div>
                  <span className="font-sans text-label font-medium text-muted-foreground block">
                    Registrada por
                  </span>
                  <p className="font-sans font-medium text-value text-foreground mt-0.5">
                    {venta.creadoPorNombre}
                  </p>
                </div>
              )}

              <div>
                <span className="font-sans text-label font-medium text-muted-foreground block">
                  Medio de Pago
                </span>
                <p className="font-sans font-medium text-value text-foreground mt-0.5">
                  {venta.metodoPago}
                  {venta.terminalNombre ? `, ${venta.terminalNombre}` : ""}
                </p>
                {terminalUsado?.notas && (
                  <p className="font-sans text-xs text-slate-500 mt-1">
                    {terminalUsado.notas}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pie de Acciones */}
        <div className="border-t border-border bg-slate-50/60 p-4 flex justify-between items-center">
          <button
            type="button"
            onClick={handleImprimir}
            className="font-sans text-xs font-bold px-4 py-2 border border-border bg-white hover:bg-slate-50 text-foreground rounded-overlay shadow-none"
          >
            Imprimir Comprobante
          </button>
          <button
            type="button"
            onClick={onClose}
            className="font-sans text-xs font-bold px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-overlay shadow-none"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
