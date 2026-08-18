"use client";

import { useState } from "react";

import { Modal } from "@/components/shared";
import { useCreateVentaMutation, useGetPacientes } from "@/hooks/api";
import { CreateVentaRequest } from "@/models/requests";
import { PacienteResponse, TerminalPagoResponse } from "@/models/responses";

type MetodoPago = CreateVentaRequest["metodoPago"];

interface NuevaVentaModalProps {
  abierto: boolean;
  onClose: () => void;
  onCrearVenta: () => void;
  terminales: TerminalPagoResponse[];
}

export function NuevaVentaModal({
  abierto,
  onClose,
  onCrearVenta,
  terminales,
}: NuevaVentaModalProps) {
  const [busquedaPaciente, setBusquedaPaciente] = useState("");
  const [pacienteSeleccionado, setPacienteSeleccionado] =
    useState<PacienteResponse | null>(null);
  const busquedaTrim = busquedaPaciente.trim();
  const { data: resultados = [] } = useGetPacientes(
    busquedaTrim.length >= 2 ? busquedaTrim : undefined,
    undefined,
    busquedaTrim.length >= 2 && !pacienteSeleccionado
  );
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState(40000);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("Debito");
  const [terminalPagoId, setTerminalPagoId] = useState<string>(
    String(terminales[0]?.id ?? "")
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const crearVentaMutation = useCreateVentaMutation();

  const requiereTerminal = metodoPago === "Debito" || metodoPago === "Credito";

  function resetForm() {
    setBusquedaPaciente("");
    setPacienteSeleccionado(null);
    setDescripcion("");
    setMonto(40000);
    setMetodoPago("Debito");
    setTerminalPagoId(String(terminales[0]?.id ?? ""));
    setErrorMsg(null);
  }

  function handleBuscarPaciente(termino: string) {
    setBusquedaPaciente(termino);
    setPacienteSeleccionado(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!descripcion.trim() || monto <= 0) return;

    setErrorMsg(null);

    try {
      await crearVentaMutation.mutateAsync({
        pacienteId: pacienteSeleccionado?.id,
        metodoPago,
        terminalPagoId: requiereTerminal ? Number(terminalPagoId) : undefined,
        items: [
          {
            tipo: "Servicio",
            descripcion: descripcion.trim(),
            monto,
          },
        ],
      });
      onCrearVenta();
      resetForm();
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "No se pudo registrar el cobro.";
      setErrorMsg(msg);
    }
  }

  return (
    <Modal
      abierto={abierto}
      onCerrar={() => {
        resetForm();
        onClose();
      }}
      ancho="max-w-2xl"
    >
      <div className="bg-white text-slate-900 font-sans shadow-none rounded-none">
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

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 font-sans text-xs"
        >
          {errorMsg && (
            <div className="border border-red-300 bg-red-50 p-3 font-sans text-xs font-semibold text-red-800 rounded-none">
              {errorMsg}
            </div>
          )}

          <div className="relative">
            <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Paciente (opcional — dejar vacío para cliente sin registrar)
            </label>
            <input
              type="text"
              value={
                pacienteSeleccionado
                  ? `${pacienteSeleccionado.nombre} ${pacienteSeleccionado.apellido}`
                  : busquedaPaciente
              }
              onChange={e => handleBuscarPaciente(e.target.value)}
              placeholder="Buscar por nombre o RUT..."
              className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
            />
            {resultados.length > 0 && !pacienteSeleccionado && (
              <ul className="absolute z-10 mt-1 w-full divide-y divide-slate-200 border border-slate-200 bg-white shadow-sm max-h-48 overflow-y-auto">
                {resultados.map(p => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setPacienteSeleccionado(p)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-slate-50"
                    >
                      <span className="font-medium text-slate-900">
                        {p.nombre} {p.apellido}
                      </span>
                      <span className="text-xs text-slate-500">{p.rut}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Servicio / Concepto *
            </label>
            <input
              type="text"
              required
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Ej: Evaluación Kinesiología"
              className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Monto ($ CLP) *
              </label>
              <input
                type="number"
                required
                min={1000}
                step={500}
                value={monto}
                onChange={e => setMonto(parseFloat(e.target.value) || 0)}
                className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Método de Pago *
              </label>
              <select
                value={metodoPago}
                onChange={e => setMetodoPago(e.target.value as MetodoPago)}
                className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
              >
                <option value="Debito">Débito</option>
                <option value="Credito">Crédito</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Efectivo">Efectivo</option>
              </select>
            </div>
          </div>

          {requiereTerminal && (
            <div>
              <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Terminal POS *
              </label>
              <select
                required
                value={terminalPagoId}
                onChange={e => setTerminalPagoId(e.target.value)}
                className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
              >
                {terminales.length === 0 && (
                  <option value="">Sin terminales configuradas</option>
                )}
                {terminales.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              disabled={
                crearVentaMutation.isPending ||
                (requiereTerminal && !terminalPagoId)
              }
              className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white rounded-none shadow-none disabled:opacity-50"
            >
              {crearVentaMutation.isPending ? "Guardando..." : "Guardar Cobro"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
