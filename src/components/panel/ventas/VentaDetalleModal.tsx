"use client";

import { VentaMock } from "@/lib/mock/ventas";
import { Modal } from "@/components/panel/primitives/Modal";
import { Button } from "@/components/panel/primitives/Button";

interface VentaDetalleModalProps {
  venta: VentaMock | null;
  onClose: () => void;
}

export function VentaDetalleModal({ venta, onClose }: VentaDetalleModalProps) {
  if (!venta) return null;

  const primerItem = venta.items[0];

  function handleImprimir() {
    window.print();
  }

  return (
    <Modal abierto={Boolean(venta)} onCerrar={onClose}>
      <div className="text-sm text-panel-sidebar">
        {/* Encabezado Formal de Comprobante */}
        <div className="flex items-start justify-between gap-4 border-b border-brand-border p-6">
          <div>
            <h2 className="text-lg font-bold text-panel-sidebar">
              Comprobante de Venta {venta.codigoDisplay}
            </h2>
            <p className="text-xs text-brand-muted mt-0.5">
              {venta.fechaFormateada}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full p-1.5 text-brand-muted hover:bg-panel-fondo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar"
          >
            &times;
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* SECCIÓN 1: DATOS DE LA ATENCIÓN */}
          <div className="space-y-2">
            <p className="border-b border-brand-border pb-1.5 text-xs font-bold uppercase tracking-wider text-brand-muted">
              Datos de la Atención
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm pt-1">
              <div>
                <span className="text-brand-muted font-medium block">Paciente:</span>
                <span className="font-bold text-panel-sidebar">{venta.pacienteNombre}</span>
              </div>
              <div>
                <span className="text-brand-muted font-medium block">Servicio:</span>
                <span className="font-semibold text-panel-sidebar">{primerItem?.servicioNombre ?? "Atención general"}</span>
              </div>
              <div>
                <span className="text-brand-muted font-medium block">Profesional:</span>
                <span className="font-semibold text-panel-sidebar">{venta.especialistaNombre}</span>
              </div>
              <div>
                <span className="text-brand-muted font-medium block">Medio de Pago:</span>
                <span className="font-semibold text-panel-sidebar">
                  {venta.metodoPago} {venta.terminalNombre ? `| ${venta.terminalNombre}` : ""}
                </span>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: DESGLOSE CONTABLE (Matemática en Cascada) */}
          <div className="space-y-2">
            <p className="border-b border-brand-border pb-1.5 text-xs font-bold uppercase tracking-wider text-brand-muted">
              Desglose Contable
            </p>
            <div className="space-y-2 text-sm pt-1">
              <div className="flex justify-between items-center">
                <span className="font-medium text-panel-sidebar">Monto Cobrado (Bruto)</span>
                <span className="font-bold text-panel-sidebar">${venta.montoBruto.toLocaleString("es-CL")} CLP</span>
              </div>

              <div className="flex justify-between items-center text-brand-muted">
                <span className="pl-3">IVA ({primerItem?.afectoIva ? "19% Afecto" : "Exento"})</span>
                <span>-${venta.ivaMonto.toLocaleString("es-CL")} CLP</span>
              </div>

              <div className="border-t border-brand-border my-1" />

              <div className="flex justify-between items-center">
                <span className="font-bold text-panel-sidebar">Monto Neto Real</span>
                <span className="font-bold text-panel-sidebar">${venta.montoNeto.toLocaleString("es-CL")} CLP</span>
              </div>

              <div className="flex justify-between items-center text-brand-muted">
                <span className="pl-3">Comisión POS {venta.terminalNombre ?? ""}</span>
                <span>-${venta.comisionPosMonto.toLocaleString("es-CL")} CLP</span>
              </div>

              <div className="border-t border-brand-border my-1" />

              <div className="flex justify-between items-center">
                <span className="font-bold text-panel-sidebar">Base Líquida a Repartir</span>
                <span className="font-bold text-panel-sidebar">${venta.baseReparticion.toLocaleString("es-CL")} CLP</span>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: DISTRIBUCIÓN DE HONORARIOS */}
          <div className="space-y-2">
            <p className="border-b border-brand-border pb-1.5 text-xs font-bold uppercase tracking-wider text-brand-muted">
              Distribución de Honorarios
            </p>
            {venta.repartoConfigurado && venta.pagoProfesional !== undefined && venta.margenClinica !== undefined ? (
              <div className="space-y-2 text-sm pt-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-panel-sidebar">
                    Pago Especialista ({venta.porcentajeProfesionalAplicado ?? 50}%)
                  </span>
                  <span className="font-bold text-panel-sidebar">
                    ${venta.pagoProfesional.toLocaleString("es-CL")} CLP
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-panel-sidebar">
                    Margen Clínica ({100 - (venta.porcentajeProfesionalAplicado ?? 50)}%)
                  </span>
                  <span className="font-bold text-panel-sidebar">
                    ${venta.margenClinica.toLocaleString("es-CL")} CLP
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-panel-fondo p-3 text-xs text-brand-muted border border-brand-border">
                Reparto no calculable: {venta.motivoNoCalculable ?? "Sin acuerdo de reparto registrado al momento de la transacción."}
              </div>
            )}
          </div>
        </div>

        {/* Pie de comprobante formal con botón Imprimir / PDF */}
        <div className="border-t border-brand-border p-6 flex justify-between items-center">
          <Button variante="secundario" onClick={handleImprimir}>
            Imprimir / Guardar PDF
          </Button>
          <Button variante="primario" onClick={onClose}>
            Cerrar Ventana
          </Button>
        </div>
      </div>
    </Modal>
  );
}
