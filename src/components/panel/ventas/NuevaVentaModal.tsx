"use client";

import { useState } from "react";
import { Modal } from "@/components/panel/primitives/Modal";
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
    <Modal abierto={abierto} onCerrar={onClose} ancho="max-w-2xl">
      <div className="bg-white text-slate-900 font-sans shadow-none rounded-none">
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
          <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900">
            Registrar Cobro Manual
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1 font-sans text-sm text-slate-400 hover:text-slate-900 rounded-none focus:outline-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-sans text-xs">
          <div>
            <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Nombre del Paciente *
            </label>
            <input
              type="text"
              required
              value={pacienteNombre}
              onChange={(e) => setPacienteNombre(e.target.value)}
              placeholder="Ej: Sofía Castro"
              className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Especialista Atención *
              </label>
              <select
                value={especialistaId}
                onChange={(e) => setEspecialistaId(e.target.value)}
                className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
              >
                <option value="esp-1">Francesca Astudillo</option>
                <option value="esp-2">Valeria Sepúlveda</option>
                <option value="esp-3">Constanza Morales</option>
                <option value="esp-4">Ignacio Soto</option>
              </select>
            </div>

            <div>
              <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Servicio / Concepto *
              </label>
              <input
                type="text"
                required
                value={servicioNombre}
                onChange={(e) => setServicioNombre(e.target.value)}
                placeholder="Ej: Evaluación Kinesiología"
                className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Monto Bruto ($ CLP) *
              </label>
              <input
                type="number"
                required
                min={1000}
                step={500}
                value={montoBruto}
                onChange={(e) => setMontoBruto(parseFloat(e.target.value) || 0)}
                className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Tributación IVA
              </label>
              <select
                value={afectoIva ? "afecto" : "exento"}
                onChange={(e) => setAfectoIva(e.target.value === "afecto")}
                className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
              >
                <option value="afecto">Afecto IVA (19%)</option>
                <option value="exento">Exento IVA (0%)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Método de Pago *
              </label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
              >
                <option value="Debito">Débito</option>
                <option value="Credito">Crédito</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Efectivo">Efectivo</option>
              </select>
            </div>

            <div>
              <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Terminal POS
              </label>
              <select
                disabled={metodoPago === "Efectivo" || metodoPago === "Transferencia"}
                value={terminalPosId}
                onChange={(e) => setTerminalPosId(e.target.value)}
                className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 disabled:bg-slate-50 disabled:text-slate-400 focus:border-slate-900 focus:outline-none"
              >
                {TERMINALES_MOCK.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre} ({t.comisionPorcentaje}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 rounded-none shadow-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white rounded-none shadow-none"
            >
              Guardar Cobro
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
