"use client";

import { useEffect, useState } from "react";
import { useHoyPanel } from "@/lib/panel/reloj";
import { Modal } from "@/components/panel/primitives/Modal";
import { Button } from "@/components/panel/primitives/Button";
import { EmptyState } from "@/components/panel/primitives/EmptyState";
import { listBloqueosEspecialista, crearBloqueo, revertirBloqueo } from "@/lib/panel/data/bloqueos";
import { BloqueoResuelto } from "@/lib/panel/data/citas";
import { ESPECIALISTAS } from "@/lib/panel/data/_seed/especialistas";
import { formatearFechaExtensa, formatearRangoHorario, fechaISO } from "@/lib/panel/domain/formato";

interface GestionBloqueosModalProps {
  abierto: boolean;
  onClose: () => void;
  onBloqueoCreado?: () => void;
}

export function GestionBloqueosModal({ abierto, onClose, onBloqueoCreado }: GestionBloqueosModalProps) {
  const hoy = useHoyPanel();
  const [especialistaFiltro, setEspecialistaFiltro] = useState<string>("esp-franchesca");
  const [bloqueos, setBloqueos] = useState<BloqueoResuelto[]>([]);

  // Formulario de creación
  const [mostrarForm, setMostrarForm] = useState(false);
  const [especialistaForm, setEspecialistaForm] = useState("esp-franchesca");
  const [fechaForm, setFechaForm] = useState("");
  const [horaInicioForm, setHoraInicioForm] = useState("09:00");
  const [horaTerminoForm, setHoraTerminoForm] = useState("14:00");
  const [motivoForm, setMotivoForm] = useState("");

  async function cargarBloqueos() {
    if (!hoy) return;
    const datos = await listBloqueosEspecialista(especialistaFiltro, hoy);
    setBloqueos(datos);
  }

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
    <Modal abierto={abierto} onCerrar={onClose}>
      <div className="text-sm text-panel-sidebar">
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-4 border-b border-brand-border p-6">
          <div>
            <h2 className="text-lg font-bold text-panel-sidebar">
              Gestión de Bloqueos de Agenda
            </h2>
            <p className="text-xs text-brand-muted">
              Administración de feriados, cierres por emergencia y reversión de bloqueos
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="rounded-full p-1.5 text-brand-muted hover:bg-panel-fondo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar"
          >
            &times;
          </button>
        </div>

        {/* Contenido principal */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-brand-muted">Filtrar por Especialista:</span>
              <select
                value={especialistaFiltro}
                onChange={(e) => setEspecialistaFiltro(e.target.value)}
                className="rounded-lg border border-brand-border bg-white px-3 py-1.5 text-sm font-medium text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
              >
                {ESPECIALISTAS.map((esp) => (
                  <option key={esp.id} value={esp.id}>
                    {esp.nombre} ({esp.cargo})
                  </option>
                ))}
              </select>
            </div>

            {!mostrarForm && (
              <Button
                variante="secundario"
                className="px-3 py-1.5 text-xs"
                onClick={() => setMostrarForm(true)}
              >
                Registrar Bloqueo
              </Button>
            )}
          </div>

          {/* Formulario de registro de bloqueo */}
          {mostrarForm && (
            <form onSubmit={handleGuardarBloqueo} className="rounded-xl border border-brand-border bg-panel-fondo p-4 space-y-3">
              <h4 className="font-bold text-panel-sidebar text-sm border-b border-brand-border pb-2">
                Registrar Nuevo Bloqueo
              </h4>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-brand-muted mb-1">Especialista</label>
                  <select
                    value={especialistaForm}
                    onChange={(e) => setEspecialistaForm(e.target.value)}
                    className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
                  >
                    {ESPECIALISTAS.map((esp) => (
                      <option key={esp.id} value={esp.id}>
                        {esp.nombre} ({esp.cargo})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-muted mb-1">Fecha del Bloqueo</label>
                  <input
                    type="date"
                    value={fechaForm}
                    onChange={(e) => setFechaForm(e.target.value)}
                    required
                    className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-muted mb-1">Hora Inicio</label>
                  <select
                    value={horaInicioForm}
                    onChange={(e) => setHoraInicioForm(e.target.value)}
                    className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
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
                  <label className="block text-xs font-semibold text-brand-muted mb-1">Hora Término</label>
                  <select
                    value={horaTerminoForm}
                    onChange={(e) => setHoraTerminoForm(e.target.value)}
                    className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
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
                <label className="block text-xs font-semibold text-brand-muted mb-1">Motivo del Bloqueo</label>
                <input
                  type="text"
                  placeholder="Ej. Capacitación técnica, Feriado nacional, Cierre por emergencia"
                  value={motivoForm}
                  onChange={(e) => setMotivoForm(e.target.value)}
                  required
                  className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-brand-border">
                <Button
                  variante="secundario"
                  className="px-4 py-1.5 text-xs"
                  type="button"
                  onClick={() => setMostrarForm(false)}
                >
                  Cancelar
                </Button>
                <Button variante="primario" className="px-4 py-1.5 text-xs" type="submit">
                  Guardar Bloqueo
                </Button>
              </div>
            </form>
          )}

          {/* Lista de bloqueos activos e inactivos (Reversión atómica) */}
          <div className="divide-y divide-brand-border rounded-xl border border-brand-border bg-white">
            {bloqueos.length === 0 ? (
              <EmptyState
                titulo="Sin bloqueos registrados"
                descripcion="No hay bloqueos registrados para esta especialista."
              />
            ) : (
              bloqueos.map((b) => {
                const esActivo = b.activo !== false;
                return (
                  <div key={b.id} className="p-4 flex flex-wrap justify-between items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${esActivo ? "text-panel-sidebar" : "text-brand-muted line-through"}`}>
                          {b.motivo}
                        </span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          esActivo ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-500"
                        }`}>
                          {esActivo ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                      <span className="text-brand-muted text-sm block mt-0.5">
                        {formatearFechaExtensa(b.fecha)} | {formatearRangoHorario(b.horaInicio, b.horaTermino)}
                      </span>
                    </div>

                    {/* Acciones de Reversión (PATCH /api/bloqueos-agenda/{id}/revertir) */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleActivo(b.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                          esActivo
                            ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                            : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
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
        <div className="border-t border-brand-border p-6 flex justify-end">
          <Button variante="primario" onClick={onClose}>
            Entendido
          </Button>
        </div>
      </div>
    </Modal>
  );
}
