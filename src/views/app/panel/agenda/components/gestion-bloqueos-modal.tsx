"use client";

import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

import {
  Alerta,
  EmptyState,
  Modal,
  ModalCloseButton,
} from "@/components/shared";
import {
  useCreateBloqueoMutation,
  useCreateBloqueoParaTodosMutation,
  useGetBloqueos,
  useGetEspecialistas,
  useRevertirBloqueoMutation,
} from "@/hooks/api";
import { useHoyPanel } from "@/hooks/common";
import { handleApiError } from "@/lib/api";
import {
  fechaISO,
  formatearFechaExtensa,
  formatearRangoHorario,
} from "@/lib/formato";
import { generarRejillaDia } from "@/lib/horario";

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
  const { data: especialistas = [] } = useGetEspecialistas(undefined, true);
  const [especialistaFiltro, setEspecialistaFiltro] = useState<string>("");
  const especialistaFiltroNum = especialistaFiltro
    ? Number(especialistaFiltro)
    : undefined;
  const { data: bloqueos = [] } = useGetBloqueos(
    especialistaFiltroNum,
    abierto && Boolean(especialistaFiltroNum)
  );

  // Formulario de creación
  const [mostrarForm, setMostrarForm] = useState(false);
  const [especialistaForm, setEspecialistaForm] = useState("");
  const [fechaForm, setFechaForm] = useState("");
  const [horaInicioForm, setHoraInicioForm] = useState("09:00");
  const [horaTerminoForm, setHoraTerminoForm] = useState("14:00");
  const [motivoForm, setMotivoForm] = useState("");

  const { data: session } = useSession();
  const esAdministrador = session?.user.rol === "Administrador";
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  const crearBloqueoMutation = useCreateBloqueoMutation();
  const crearParaTodosMutation = useCreateBloqueoParaTodosMutation();
  const revertirBloqueoMutation = useRevertirBloqueoMutation();

  useEffect(() => {
    if (!abierto || especialistaFiltro || especialistas.length === 0) return;
    setEspecialistaFiltro(String(especialistas[0].id));
    setEspecialistaForm(String(especialistas[0].id));
  }, [abierto, especialistas, especialistaFiltro]);

  useEffect(() => {
    if (!hoy || !abierto || fechaForm) return;
    setFechaForm(fechaISO(hoy));
  }, [hoy, abierto, fechaForm]);

  const rejillaForm = useMemo(() => {
    const diaSemana = fechaForm
      ? new Date(`${fechaForm}T00:00:00`).getDay()
      : (hoy?.getDay() ?? 1);
    return generarRejillaDia(diaSemana);
  }, [fechaForm, hoy]);

  async function handleGuardarBloqueo(e: React.FormEvent) {
    e.preventDefault();
    if (!motivoForm.trim() || !especialistaForm) return;
    setErrorGuardar(null);

    try {
      if (especialistaForm === "todos") {
        await crearParaTodosMutation.mutateAsync({
          fecha: fechaForm,
          horaInicio: horaInicioForm,
          horaFin: horaTerminoForm,
          motivo: motivoForm.trim(),
        });
      } else {
        await crearBloqueoMutation.mutateAsync({
          especialistaId: Number(especialistaForm),
          fecha: fechaForm,
          horaInicio: horaInicioForm,
          horaFin: horaTerminoForm,
          motivo: motivoForm.trim(),
        });

        if (especialistaFiltro !== especialistaForm) {
          setEspecialistaFiltro(especialistaForm);
        }
      }

      setMotivoForm("");
      setMostrarForm(false);
      if (onBloqueoCreado) onBloqueoCreado();
    } catch (err: unknown) {
      setErrorGuardar(handleApiError(err).message);
    }
  }

  async function handleToggleActivo(id: number) {
    await revertirBloqueoMutation.mutateAsync(id);
    if (onBloqueoCreado) onBloqueoCreado();
  }

  return (
    <Modal abierto={abierto} onCerrar={onClose}>
      <div className="bg-white text-foreground font-sans shadow-none rounded-overlay">
        {/* Encabezado */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm px-6 py-4">
          <div>
            <h2 className="font-sans text-section-title font-bold text-foreground">
              Gestión de Bloqueos de Agenda
            </h2>
            <p className="font-sans text-xs text-slate-500 mt-0.5">
              Administración de feriados, emergencias y bloqueos por profesional
            </p>
          </div>
          <ModalCloseButton onClick={onClose} />
        </div>

        {/* Contenido principal */}
        <div className="p-6 space-y-4 font-sans text-xs">
          {errorGuardar && <Alerta tono="error">{errorGuardar}</Alerta>}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-sans text-label font-medium text-muted-foreground">
                Filtrar:
              </span>
              <select
                value={especialistaFiltro}
                onChange={e => setEspecialistaFiltro(e.target.value)}
                className="rounded-none border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
              >
                {especialistas.map(esp => (
                  <option key={esp.id} value={esp.id}>
                    {esp.nombre}
                  </option>
                ))}
              </select>
            </div>

            {!mostrarForm && (
              <button
                type="button"
                onClick={() => setMostrarForm(true)}
                className="font-sans text-xs font-bold px-3.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-foreground rounded-overlay shadow-none"
              >
                Registrar Bloqueo
              </button>
            )}
          </div>

          {/* Formulario de registro de bloqueo */}
          {mostrarForm && (
            <form
              onSubmit={handleGuardarBloqueo}
              className="border border-slate-200 bg-slate-50/50 p-4 space-y-3 rounded-none"
            >
              <h4 className="font-sans text-micro-header font-medium text-muted-foreground border-b border-slate-200 pb-2">
                Registrar Nuevo Bloqueo
              </h4>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-sans text-label font-medium text-muted-foreground block mb-1">
                    Especialista
                  </label>
                  <select
                    value={especialistaForm}
                    onChange={e => setEspecialistaForm(e.target.value)}
                    className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                  >
                    {esAdministrador && (
                      <option value="todos">
                        Todos los Especialistas Activos
                      </option>
                    )}
                    {especialistas.map(esp => (
                      <option key={esp.id} value={esp.id}>
                        {esp.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-sans text-label font-medium text-muted-foreground block mb-1">
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
                  <label className="font-sans text-label font-medium text-muted-foreground block mb-1">
                    Hora Inicio
                  </label>
                  <select
                    value={horaInicioForm}
                    onChange={e => setHoraInicioForm(e.target.value)}
                    className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                  >
                    {rejillaForm.map(b => (
                      <option key={b.inicio} value={b.inicio}>
                        {b.inicio}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-sans text-label font-medium text-muted-foreground block mb-1">
                    Hora Término
                  </label>
                  <select
                    value={horaTerminoForm}
                    onChange={e => setHoraTerminoForm(e.target.value)}
                    className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                  >
                    {rejillaForm.map(b => (
                      <option key={b.termino} value={b.termino}>
                        {b.termino}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-sans text-label font-medium text-muted-foreground block mb-1">
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
                  className="font-sans text-xs font-bold px-3.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-foreground rounded-overlay shadow-none"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    crearBloqueoMutation.isPending ||
                    crearParaTodosMutation.isPending
                  }
                  className="font-sans text-xs font-bold px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-overlay shadow-none disabled:opacity-50"
                >
                  {crearBloqueoMutation.isPending ||
                  crearParaTodosMutation.isPending
                    ? "Guardando…"
                    : "Guardar Bloqueo"}
                </button>
              </div>
            </form>
          )}

          {/* Lista de bloqueos */}
          <div className="divide-y divide-slate-200 border border-slate-200 bg-white rounded-none">
            {bloqueos.length === 0 ? (
              <EmptyState
                titulo="Sin Bloqueos Registrados"
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
                          className={`font-sans font-medium text-value ${esActivo ? "text-foreground" : "text-slate-400 line-through"}`}
                        >
                          {b.motivo}
                        </span>
                        <span
                          className={`rounded-overlay px-2 py-0.5 font-sans text-[10px] font-bold ${
                            esActivo
                              ? "bg-emerald-700 text-white"
                              : "bg-slate-400 text-white"
                          }`}
                        >
                          {esActivo ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                      <span className="font-sans text-xs text-slate-500 block mt-0.5">
                        {formatearFechaExtensa(new Date(`${b.fecha}T00:00:00`))}
                        , {formatearRangoHorario(b.horaInicio, b.horaFin)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleActivo(b.id)}
                        className={`font-sans text-xs font-bold px-3 py-1.5 transition-colors rounded-overlay shadow-none ${
                          esActivo
                            ? "border border-slate-200 bg-white hover:bg-slate-50 text-foreground"
                            : "border-0 bg-primary hover:bg-primary-hover text-white"
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
            className="font-sans text-xs font-bold px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-overlay shadow-none"
          >
            Entendido
          </button>
        </div>
      </div>
    </Modal>
  );
}
