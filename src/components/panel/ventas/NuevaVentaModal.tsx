"use client";

import { useState } from "react";
import { Modal } from "@/components/panel/primitives/Modal";
import { Button } from "@/components/panel/primitives/Button";
import { MetodoPago, TERMINALES_MOCK, VentaMock } from "@/lib/mock/ventas";

interface NuevaVentaModalProps {
  abierto: boolean;
  onClose: () => void;
  onCrearVenta: (nuevaVenta: VentaMock) => void;
}

export function NuevaVentaModal({ abierto, onClose, onCrearVenta }: NuevaVentaModalProps) {
  const [pacienteNombre, setPacienteNombre] = useState("");
  const [especialistaId, setEspecialistaId] = useState("esp-1");
  const [servicioNombre, setServicioNombre] = useState("");
  const [afectoIva, setAfectoIva] = useState(true);
  const [montoBruto, setMontoBruto] = useState(40000);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("Debito");
  const [terminalPosId, setTerminalPosId] = useState("term-1");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pacienteNombre || !servicioNombre) return;

    const termObj = TERMINALES_MOCK.find((t) => t.id === terminalPosId);

    const requiereTerminal = metodoPago === "Debito" || metodoPago === "Credito";
    const pctPos = requiereTerminal && termObj ? termObj.comisionPorcentaje : 0;
    const comisionPos = Math.round(montoBruto * (pctPos / 100));

    const iva = afectoIva ? Math.round(montoBruto - montoBruto / 1.19) : 0;
    const neto = montoBruto - iva;
    const baseReparto = neto - comisionPos;

    const pctProf = 50;
    const pagoProf = Math.round(baseReparto * (pctProf / 100));
    const margenCl = baseReparto - pagoProf;

    const espNombreMap: Record<string, string> = {
      "esp-1": "Francesca Astudillo",
      "esp-2": "Valeria Sepúlveda",
      "esp-3": "Constanza Morales",
      "esp-4": "Ignacio Soto",
    };

    const idRandom = Math.floor(1000 + Math.random() * 9000);

    const nueva: VentaMock = {
      id: `v-${idRandom}`,
      codigoDisplay: `#${idRandom}`,
      fechaIso: new Date().toISOString(),
      fechaFormateada: new Date().toLocaleDateString("es-CL") + " " + new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
      pacienteId: `pac-${idRandom}`,
      pacienteNombre,
      especialistaId,
      especialistaNombre: espNombreMap[especialistaId] ?? "Especialista",
      metodoPago,
      terminalPosId: requiereTerminal ? terminalPosId : undefined,
      terminalNombre: requiereTerminal && termObj ? termObj.nombre : "Sin POS",
      montoBruto,
      items: [{ id: `item-${idRandom}`, servicioNombre, tipo: "Servicio", afectoIva, monto: montoBruto }],
      comisionPosMonto: comisionPos,
      ivaMonto: iva,
      montoNeto: neto,
      baseReparticion: baseReparto,
      repartoConfigurado: true,
      porcentajeProfesionalAplicado: pctProf,
      pagoProfesional: pagoProf,
      margenClinica: margenCl,
    };

    onCrearVenta(nueva);
    onClose();
  }

  return (
    <Modal abierto={abierto} onCerrar={onClose}>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-brand-border pb-3">
          <h3 className="text-base font-bold text-panel-sidebar">Registrar Nueva Venta / Cobro</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="rounded-lg p-1 text-brand-muted hover:bg-panel-fondo hover:text-panel-sidebar"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 text-sm text-panel-sidebar">
          <div>
            <label className="block font-semibold mb-1 text-panel-sidebar">Nombre del Paciente *</label>
            <input
              type="text"
              required
              value={pacienteNombre}
              onChange={(e) => setPacienteNombre(e.target.value)}
              placeholder="Ej: Sofía Castro"
              className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-panel-sidebar">Especialista Atención *</label>
              <select
                value={especialistaId}
                onChange={(e) => setEspecialistaId(e.target.value)}
                className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
              >
                <option value="esp-1">Francesca Astudillo</option>
                <option value="esp-2">Valeria Sepúlveda</option>
                <option value="esp-3">Constanza Morales</option>
                <option value="esp-4">Ignacio Soto</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-panel-sidebar">Servicio / Concepto *</label>
              <input
                type="text"
                required
                value={servicioNombre}
                onChange={(e) => setServicioNombre(e.target.value)}
                placeholder="Ej: Evaluación Kinesiología"
                className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-panel-sidebar">Monto Bruto ($ CLP) *</label>
              <input
                type="number"
                required
                min={1000}
                step={500}
                value={montoBruto}
                onChange={(e) => setMontoBruto(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm font-bold text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-panel-sidebar">Tributación IVA</label>
              <select
                value={afectoIva ? "afecto" : "exento"}
                onChange={(e) => setAfectoIva(e.target.value === "afecto")}
                className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
              >
                <option value="afecto">Afecto IVA (19%)</option>
                <option value="exento">Exento IVA (0%)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-panel-sidebar">Método de Pago *</label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
              >
                <option value="Debito">Débito</option>
                <option value="Credito">Crédito</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Efectivo">Efectivo</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-panel-sidebar">Terminal POS</label>
              <select
                disabled={metodoPago === "Efectivo" || metodoPago === "Transferencia"}
                value={terminalPosId}
                onChange={(e) => setTerminalPosId(e.target.value)}
                className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm text-panel-sidebar disabled:bg-panel-fondo disabled:text-brand-muted focus:border-panel-sidebar focus:outline-none"
              >
                {TERMINALES_MOCK.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre} ({t.comisionPorcentaje}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-brand-border">
            <Button variante="secundario" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button variante="primario" type="submit">
              Guardar Cobro
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
