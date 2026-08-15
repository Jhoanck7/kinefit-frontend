"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/panel/primitives/Button";
import { Card } from "@/components/panel/primitives/Card";
import { EmptyState } from "@/components/panel/primitives/EmptyState";
import { ESPECIALISTAS } from "@/lib/panel/data/_seed/especialistas";
import {
  crearBloqueo,
  listBloqueosEspecialista,
} from "@/lib/panel/data/bloqueos";
import { BloqueoResuelto } from "@/lib/panel/data/citas";
import {
  fechaISO,
  formatearFechaExtensa,
  formatearRangoHorario,
} from "@/lib/panel/domain/formato";
import { useHoyPanel } from "@/lib/panel/reloj";
import {
  usePanelSessionStore,
  USUARIO_SESION_PANEL,
} from "@/lib/store/usePanelSessionStore";

export default function BloqueosPage() {
  const router = useRouter();
  const hoy = useHoyPanel();
  const usuario = usePanelSessionStore(s => s.usuario) ?? USUARIO_SESION_PANEL;

  const [especialistaFiltro, setEspecialistaFiltro] =
    useState<string>("esp-franchesca");
  const [bloqueos, setBloqueos] = useState<BloqueoResuelto[] | null>(null);

  // Formulario de creación de bloqueo
  const [mostrarForm, setMostrarForm] = useState(false);
  const [especialistaForm, setEspecialistaForm] = useState("esp-franchesca");
  const [fechaForm, setFechaForm] = useState("");
  const [horaInicioForm, setHoraInicioForm] = useState("09:00");
  const [horaTerminoForm, setHoraTerminoForm] = useState("14:00");
  const [motivoForm, setMotivoForm] = useState("");

  useEffect(() => {
    if (!hoy) return;
    if (!fechaForm) {
      setFechaForm(fechaISO(hoy));
    }
    listBloqueosEspecialista(especialistaFiltro, hoy).then(setBloqueos);
  }, [hoy, especialistaFiltro, fechaForm]);

  async function handleGuardarBloqueo(e: React.FormEvent) {
    e.preventDefault();
    if (!hoy || !motivoForm.trim()) return;

    const fechaObjeto = new Date(`${fechaForm}T00:00:00`);

    const nuevo = await crearBloqueo({
      especialistaId: especialistaForm,
      fecha: fechaObjeto,
      horaInicio: horaInicioForm,
      horaTermino: horaTerminoForm,
      motivo: motivoForm.trim(),
    });

    if (especialistaFiltro === especialistaForm) {
      setBloqueos([nuevo, ...(bloqueos ?? [])]);
    } else {
      setEspecialistaFiltro(especialistaForm);
    }

    setMotivoForm("");
    setMostrarForm(false);
  }

  if (!hoy || bloqueos === null) return <div aria-hidden />;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Botón de retorno y encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.push("/panel/agenda")}
            className="flex items-center gap-1 text-sm text-panel-sidebar underline underline-offset-2 mb-2"
          >
            ← Volver a la Agenda
          </button>
          <h2 className="text-xl font-bold text-panel-sidebar">
            Gestión de Bloqueos de Agenda
          </h2>
          <p className="text-sm text-brand-muted">
            Administración de feriados, cierres de emergencia y bloqueos de
            disponibilidad
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!mostrarForm && (
            <Button variante="primario" onClick={() => setMostrarForm(true)}>
              + Registrar Bloqueo
            </Button>
          )}
        </div>
      </div>

      {/* Formulario Interactivo de Registro de Bloqueo */}
      {mostrarForm && (
        <form
          onSubmit={handleGuardarBloqueo}
          className="rounded-xl border border-brand-border bg-panel-fondo p-6 space-y-4 shadow-sm"
        >
          <h3 className="font-bold text-panel-sidebar text-base border-b border-brand-border pb-2">
            Registrar Nuevo Bloqueo de Agenda
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-brand-muted mb-1">
                Especialista
              </label>
              <select
                value={especialistaForm}
                onChange={e => setEspecialistaForm(e.target.value)}
                className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
              >
                {ESPECIALISTAS.map(esp => (
                  <option key={esp.id} value={esp.id}>
                    {esp.nombre} ({esp.cargo})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-muted mb-1">
                Fecha del Bloqueo
              </label>
              <input
                type="date"
                value={fechaForm}
                onChange={e => setFechaForm(e.target.value)}
                required
                className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-muted mb-1">
                Hora Inicio
              </label>
              <select
                value={horaInicioForm}
                onChange={e => setHoraInicioForm(e.target.value)}
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
              <label className="block text-xs font-semibold text-brand-muted mb-1">
                Hora Término
              </label>
              <select
                value={horaTerminoForm}
                onChange={e => setHoraTerminoForm(e.target.value)}
                className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
              >
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="13:00">13:00 PM</option>
                <option value="14:00">14:00 PM (Hora de Colación)</option>
                <option value="16:00">16:00 PM</option>
                <option value="17:00">17:00 PM</option>
                <option value="18:00">18:00 PM</option>
                <option value="19:00">19:00 PM</option>
                <option value="20:00">20:00 PM</option>
                <option value="21:00">21:00 PM (Cierre Centro)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-muted mb-1">
              Motivo del Bloqueo
            </label>
            <input
              type="text"
              placeholder="Ej. Capacitación técnica, Feriado nacional, Cierre por emergencia"
              value={motivoForm}
              onChange={e => setMotivoForm(e.target.value)}
              required
              className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-brand-border">
            <Button
              variante="secundario"
              type="button"
              onClick={() => setMostrarForm(false)}
            >
              Cancelar
            </Button>
            <Button variante="primario" type="submit">
              Guardar Bloqueo
            </Button>
          </div>
        </form>
      )}

      {/* Selector de filtro por Especialista */}
      <div className="flex items-center justify-between border-b border-brand-border pb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-brand-muted">
            Filtrar por Especialista:
          </span>
          <select
            value={especialistaFiltro}
            onChange={e => setEspecialistaFiltro(e.target.value)}
            className="rounded-lg border border-brand-border bg-white px-3 py-1.5 text-sm font-medium text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
          >
            {ESPECIALISTAS.map(esp => (
              <option key={esp.id} value={esp.id}>
                {esp.nombre} ({esp.cargo})
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-brand-muted font-medium">
          {bloqueos.length} bloqueo(s) registrado(s)
        </span>
      </div>

      {/* Lista de Bloqueos */}
      <Card className="p-0 overflow-hidden">
        {bloqueos.length === 0 ? (
          <EmptyState
            titulo="Sin bloqueos registrados"
            descripcion="No hay bloqueos activos para esta especialista."
          />
        ) : (
          <ul className="divide-y divide-brand-border text-sm">
            {bloqueos.map(bloqueo => (
              <li
                key={bloqueo.id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-panel-sidebar">
                      {bloqueo.motivo}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                      {bloqueo.especialista.nombre}
                    </span>
                  </div>
                  <p className="text-sm text-brand-muted mt-1">
                    {formatearFechaExtensa(bloqueo.fecha)} ·{" "}
                    {formatearRangoHorario(
                      bloqueo.horaInicio,
                      bloqueo.horaTermino
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
