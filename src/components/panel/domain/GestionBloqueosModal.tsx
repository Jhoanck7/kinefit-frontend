"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/panel/primitives/Button";
import { EmptyState } from "@/components/panel/primitives/EmptyState";
import { Modal } from "@/components/panel/primitives/Modal";
import {
  crearBloqueo,
  listBloqueosEspecialista,
  revertirBloqueo,
} from "@/lib/panel/data/bloqueos";
import { BloqueoResuelto } from "@/lib/panel/data/citas";
import { listEspecialistas } from "@/lib/panel/data/especialistas";
import {
  fechaISO,
  formatearFechaExtensa,
  formatearRangoHorario,
} from "@/lib/panel/domain/formato";
import { Especialista } from "@/lib/panel/domain/tipos";
import { useHoyPanel } from "@/lib/panel/reloj";

interface GestionBloqueosModalProps {
  abierto: boolean;
  onClose: () => void;
  onBloqueoCreado?: () => void;
}

export function GestionBloqueosModal({
  abierto,
  onClose,
  onBloqueoCreado,
}: GestionBloqueosModalProps) {
  const hoy = useHoyPanel();
  const [especialistas, setEspecialistas] = useState<Especialista[]>([]);
  const [especialistaFiltro, setEspecialistaFiltro] = useState<string>("");
  const [bloqueos, setBloqueos] = useState<BloqueoResuelto[]>([]);

  // Formulario de creación
  const [mostrarForm, setMostrarForm] = useState(false);
  const [especialistaForm, setEspecialistaForm] = useState("");
  const [fechaForm, setFechaForm] = useState("");
  const [horaInicioForm, setHoraInicioForm] = useState("09:00");
  const [horaTerminoForm, setHoraTerminoForm] = useState("14:00");
  const [motivoForm, setMotivoForm] = useState("");

  async function cargarBloqueos() {
    if (!hoy || !especialistaFiltro) return;
    const datos = await listBloqueosEspecialista(especialistaFiltro, hoy);
    setBloqueos(datos);
  }

  useEffect(() => {
    if (!abierto || especialistas.length > 0) return;
    listEspecialistas().then(lista => {
      setEspecialistas(lista);
      if (lista.length > 0) {
        setEspecialistaFiltro(lista[0].id);
        setEspecialistaForm(lista[0].id);
      }
    });
  }, [abierto, especialistas.length]);

  useEffect(() => {
    if (!hoy || !abierto) return;
    if (!fechaForm) {
      setFechaForm(fechaISO(hoy));
    }
    cargarBloqueos();
  }, [hoy, abierto, especialistaFiltro, fechaForm]);

  async function handleGuardarBloqueo(e: React.FormEvent) {
    e.preventDefault();
    if (!hoy || !motivoForm.trim()) return;

    const fechaObjeto = new Date(`${fechaForm}T00:00:00`);

    await crearBloqueo({
      especialistaId: especialistaForm,
      fecha: fechaObjeto,
      horaInicio: horaInicioForm,
      horaTermino: horaTerminoForm,
      motivo: motivoForm.trim(),
    });

    if (especialistaFiltro !== especialistaForm) {
      setEspecialistaFiltro(especialistaForm);
    }
    await cargarBloqueos();

    setMotivoForm("");
    setMostrarForm(false);
    if (onBloqueoCreado) onBloqueoCreado();
  }

  async function handleToggleActivo(id: string) {
    await revertirBloqueo(id);
    await cargarBloqueos();
    if (onBloqueoCreado) onBloqueoCreado();
  }

  return (
    <Modal abierto={abierto} onCerrar={onClose} ancho="max-w-3xl">
      <div className="bg-white text-slate-900 font-sans shadow-none rounded-none">
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
          <div>
            <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900">
              Gestión de Bloqueos de Agenda
            </h2>
            <p className="font-sans text-xs text-slate-500 mt-0.5">
              Administración de feriados, emergencias y bloqueos por profesional
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1 font-sans text-sm text-slate-400 hover:text-slate-900 rounded-none focus:outline-none"
          >
            ✕
          </button>
        </div>

        {/* Contenido principal */}
        <div className="p-6 space-y-4 font-sans text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-sans text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Filtrar:
              </span>
              <select
                value={especialistaFiltro}
                onChange={e => setEspecialistaFiltro(e.target.value)}
                className="rounded-none border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
              >
                {especialistas.map(esp => (
                  <option key={esp.id} value={esp.id}>
                    {esp.nombre} ({esp.cargo})
                  </option>
                ))}
              </select>
            </div>

            {!mostrarForm && (
              <button
                type="button"
                onClick={() => setMostrarForm(true)}
                className="font-sans text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 rounded-none shadow-none"
              >
                REGISTRAR BLOQUEO
              </button>
            )}
          </div>

          {/* Formulario de registro de bloqueo */}
          {mostrarForm && (
            <form
              onSubmit={handleGuardarBloqueo}
              className="border border-slate-200 bg-slate-50/50 p-4 space-y-3 rounded-none"
            >
              <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">
                Registrar Nuevo Bloqueo
              </h4>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                    Especialista
                  </label>
                  <select
                    value={especialistaForm}
                    onChange={e => setEspecialistaForm(e.target.value)}
                    className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                  >
                    {especialistas.map(esp => (
                      <option key={esp.id} value={esp.id}>
                        {esp.nombre} ({esp.cargo})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                    Fecha del Bloqueo
                  </label>
                  <input
                    type="date"
                    value={fechaForm}
                    onChange={e => setFechaForm(e.target.value)}
                    required
                    className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                    Hora Inicio
                  </label>
                  <select
                    value={horaInicioForm}
                    onChange={e => setHoraInicioForm(e.target.value)}
                    className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                  >
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">13:00 PM</option>
                    <option value="15:00">15:00 PM</option>
                    <option value="16:00">16:00 PM</option>
                    <option value="17:00">17:00 PM</option>
                    <option value="18:00">18:00 PM</option>
                    <option value="19:00">19:00 PM</option>
                    <option value="20:00">20:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                    Hora Término
                  </label>
                  <select
                    value={horaTerminoForm}
                    onChange={e => setHoraTerminoForm(e.target.value)}
                    className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                  >
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">13:00 PM</option>
                    <option value="14:00">14:00 PM (Colación)</option>
                    <option value="16:00">16:00 PM</option>
                    <option value="17:00">17:00 PM</option>
                    <option value="18:00">18:00 PM</option>
                    <option value="19:00">19:00 PM</option>
                    <option value="20:00">20:00 PM</option>
                    <option value="21:00">21:00 PM (Cierre)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                  Motivo del Bloqueo
                </label>
                <input
                  type="text"
                  placeholder="Ej. Capacitación técnica, Feriado nacional, Cierre por emergencia"
                  value={motivoForm}
                  onChange={e => setMotivoForm(e.target.value)}
                  required
                  className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setMostrarForm(false)}
                  className="font-sans text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 rounded-none shadow-none"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="font-sans text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 bg-[#003366] hover:bg-[#002244] text-white rounded-none shadow-none"
                >
                  Guardar Bloqueo
                </button>
              </div>
            </form>
          )}

          {/* Lista de bloqueos */}
          <div className="divide-y divide-slate-200 border border-slate-200 bg-white rounded-none">
            {bloqueos.length === 0 ? (
              <EmptyState
                titulo="Sin bloqueos registrados"
                descripcion="No hay bloqueos registrados para esta especialista."
              />
            ) : (
              bloqueos.map(b => {
                const esActivo = b.activo !== false;
                return (
                  <div
                    key={b.id}
                    className="p-4 flex flex-wrap justify-between items-center gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-sans font-medium text-sm ${esActivo ? "text-slate-900" : "text-slate-400 line-through"}`}
                        >
                          {b.motivo}
                        </span>
                        <span
                          className={`border px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider rounded-none ${
                            esActivo
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : "border-slate-200 bg-slate-50 text-slate-500"
                          }`}
                        >
                          {esActivo ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                      <span className="font-sans text-xs text-slate-500 block mt-0.5">
                        {formatearFechaExtensa(b.fecha)} ·{" "}
                        {formatearRangoHorario(b.horaInicio, b.horaTermino)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleActivo(b.id)}
                        className={`font-sans text-xs font-bold uppercase tracking-wider px-3 py-1.5 border transition-colors rounded-none shadow-none ${
                          esActivo
                            ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                            : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                        }`}
                      >
                        {esActivo ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50/60 p-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white rounded-none shadow-none"
          >
            ENTENDIDO
          </button>
        </div>
      </div>
    </Modal>
  );
}
