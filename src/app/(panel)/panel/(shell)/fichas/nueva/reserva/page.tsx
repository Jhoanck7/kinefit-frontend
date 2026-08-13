"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHoyPanel } from "@/lib/panel/reloj";
import { useNuevaFichaStore } from "@/lib/store/useNuevaFichaStore";
import { buscarPacientes, PacienteResuelto } from "@/lib/panel/data/pacientes";
import { reservasDelPaciente, CitaResuelta } from "@/lib/panel/data/citas";
import { fichaDeLaCita } from "@/lib/panel/data/fichas";
import { citaService } from "@/lib/services/cita.service";
import { formatearFechaExtensa, formatearRangoHorario } from "@/lib/panel/domain/formato";
import { Card } from "@/components/panel/primitives/Card";
import { Button } from "@/components/panel/primitives/Button";
import { SearchInput } from "@/components/panel/primitives/CamposFormulario";
import { SummaryPanel } from "@/components/panel/primitives/SummaryPanel";
import { StepIndicator } from "@/components/panel/primitives/StepIndicator";
import { BottomActionBar } from "@/components/panel/primitives/BottomActionBar";
import { EmptyState } from "@/components/panel/primitives/EmptyState";

export default function NuevaFichaReservaPage() {
  const router = useRouter();
  const hoy = useHoyPanel();
  const { pacienteId, pacienteNombre, citaId, setReserva, reiniciar } = useNuevaFichaStore();

  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<PacienteResuelto[]>([]);
  const [reservas, setReservas] = useState<(CitaResuelta & { conFicha: boolean; fichaId?: string })[]>([]);
  const [cambiandoEstadoId, setCambiandoEstadoId] = useState<string | null>(null);

  useEffect(() => {
    buscarPacientes(busqueda).then(setResultados);
  }, [busqueda]);

  useEffect(() => {
    if (!pacienteId || !hoy) {
      setReservas([]);
      return;
    }
    reservasDelPaciente(pacienteId, hoy).then(async (citas) => {
      const conFichas = await Promise.all(
        citas.map(async (cita) => {
          const ficha = await fichaDeLaCita(cita.id, hoy);
          return { ...cita, conFicha: Boolean(ficha), fichaId: ficha?.id };
        })
      );
      setReservas(conFichas);
    });
  }, [pacienteId, hoy]);

  function seleccionarPaciente(paciente: PacienteResuelto) {
    setReserva(paciente.id, `${paciente.nombre} ${paciente.apellido}`, "");
    setBusqueda("");
    setResultados([]);
  }

  function seleccionarReserva(cita: CitaResuelta) {
    setReserva(pacienteId!, pacienteNombre!, cita.id);
  }

  async function cambiarEstadoAAtendida(citaIdStr: string) {
    setCambiandoEstadoId(citaIdStr);
    try {
      const numId = parseInt(citaIdStr.replace(/\D/g, ""), 10);
      if (!isNaN(numId)) {
        await citaService.updateEstado(numId, "Atendida");
        if (pacienteId && hoy) {
          const citas = await reservasDelPaciente(pacienteId, hoy);
          const conFichas = await Promise.all(
            citas.map(async (cita) => {
              const ficha = await fichaDeLaCita(cita.id, hoy);
              return { ...cita, conFicha: Boolean(ficha), fichaId: ficha?.id };
            })
          );
          setReservas(conFichas);
          // Auto seleccionar
          setReserva(pacienteId, pacienteNombre!, citaIdStr);
        }
      }
    } catch (err) {
      console.error("Error al actualizar cita a Atendida:", err);
    } finally {
      setCambiandoEstadoId(null);
    }
  }

  const citaSeleccionada = reservas.find((r) => r.id === citaId);

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-[1fr_320px]">
      <div className="sm:col-span-2">
        <StepIndicator pasos={[{ etiqueta: "Reserva" }, { etiqueta: "Ficha" }]} pasoActivo={1} />
      </div>

      <Card>
        <h2 className="mb-1 text-lg font-bold text-panel-sidebar">¿A qué atención corresponde la ficha?</h2>
        <p className="mb-4 text-sm text-brand-muted">Busque al paciente y seleccione la reserva asociada.</p>

        <SearchInput placeholder="Buscar por nombre o RUT..." value={busqueda} onChange={setBusqueda} />

        {resultados.length > 0 && (
          <ul className="mt-2 space-y-1 rounded-lg border border-brand-border p-1">
            {resultados.map((paciente) => (
              <li key={paciente.id}>
                <button
                  type="button"
                  onClick={() => seleccionarPaciente(paciente)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-panel-fondo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar"
                >
                  <span>
                    {paciente.nombre} {paciente.apellido}
                  </span>
                  <span className="text-brand-muted">{paciente.rut}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {pacienteId && (
          <div className="mt-6">
            <p className="mb-2 inline-block rounded-full bg-panel-seleccion px-3 py-1 text-xs font-semibold uppercase tracking-wide text-panel-sidebar">
              Reservas de {pacienteNombre}
            </p>
            {reservas.length === 0 ? (
              <EmptyState titulo="Sin reservas" descripcion="Este paciente no tiene reservas registradas." />
            ) : (
              <ul className="space-y-3">
                {reservas.map((cita) => {
                  const seleccionada = cita.id === citaId;
                  const esAtendida = cita.estado === "atendida";
                  const deshabilitada = cita.conFicha || !esAtendida;

                  return (
                    <li key={cita.id} className="space-y-1">
                      <button
                        type="button"
                        disabled={deshabilitada}
                        onClick={() => seleccionarReserva(cita)}
                        title={
                          cita.conFicha
                            ? "Esta reserva ya tiene una ficha asociada"
                            : !esAtendida
                            ? "La cita debe estar en estado 'Atendida' para asociar una ficha clínica"
                            : undefined
                        }
                        className={`flex w-full items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar disabled:cursor-not-allowed disabled:opacity-75 ${
                          seleccionada
                            ? "border-panel-sidebar bg-panel-seleccion"
                            : "border-brand-border hover:border-panel-sidebar/40"
                        }`}
                      >
                        <div>
                          <p className="font-medium text-panel-sidebar">
                            {formatearFechaExtensa(cita.fecha)} · {formatearRangoHorario(cita.horaInicio, cita.horaTermino)}
                          </p>
                          <p className="text-sm text-brand-muted capitalize">
                            {cita.servicio} · {cita.especialista.nombre}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
                            cita.conFicha
                              ? "bg-emerald-100 text-emerald-800"
                              : esAtendida
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {cita.conFicha
                            ? "Con ficha"
                            : esAtendida
                            ? "Atendida (Lista para ficha)"
                            : `Estado: ${cita.estado}`}
                        </span>
                      </button>

                      {cita.conFicha && cita.fichaId && (
                        <button
                          type="button"
                          onClick={() => router.push(`/panel/fichas/${cita.fichaId}`)}
                          className="mt-1 text-xs text-panel-sidebar underline underline-offset-2 block"
                        >
                          Abrir la ficha existente
                        </button>
                      )}

                      {!esAtendida && !cita.conFicha && (
                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-800">
                          <span>
                            Esta cita está en estado <strong>&ldquo;{cita.estado}&rdquo;</strong>. Debe estar marcada como <strong>Atendida</strong> para poder asociarle una ficha.
                          </span>
                          <Button
                            variante="secundario"
                            disabled={cambiandoEstadoId === cita.id}
                            className="text-xs px-2.5 py-1"
                            onClick={() => cambiarEstadoAAtendida(cita.id)}
                          >
                            {cambiandoEstadoId === cita.id ? "Actualizando..." : "Marcar como Atendida"}
                          </Button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        <BottomActionBar
          abandono={
            <button
              type="button"
              onClick={() => {
                reiniciar();
                router.push("/panel/fichas");
              }}
              className="text-sm text-panel-sidebar underline underline-offset-2"
            >
              Cancelar
            </button>
          }
          avanzar={
            <Button
              variante="primario"
              disabled={!citaSeleccionada || citaSeleccionada.estado !== "atendida"}
              onClick={() => router.push("/panel/fichas/nueva/contenido")}
            >
              Continuar
            </Button>
          }
        />
      </Card>

      <SummaryPanel
        filas={[
          { etiqueta: "PACIENTE", valor: pacienteNombre ?? undefined },
          {
            etiqueta: "RESERVA",
            valor: citaSeleccionada
              ? `${formatearFechaExtensa(citaSeleccionada.fecha)} · ${formatearRangoHorario(citaSeleccionada.horaInicio, citaSeleccionada.horaTermino)}`
              : undefined,
          },
          { etiqueta: "TIPO DE FICHA", valor: undefined },
        ]}
      />
    </div>
  );
}
