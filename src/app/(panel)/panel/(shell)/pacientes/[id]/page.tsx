"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useHoyPanel } from "@/lib/panel/reloj";
import { getPaciente, PacienteResuelto } from "@/lib/panel/data/pacientes";
import { historialPaciente, contadoresPaciente, CitaResuelta } from "@/lib/panel/data/citas";
import { fichasDelPaciente, FichaResuelta } from "@/lib/panel/data/fichas";
import { definicionEstado } from "@/lib/panel/domain/estados";
import { formatearFechaCorta, formatearRangoHorario } from "@/lib/panel/domain/formato";
import { Card } from "@/components/panel/primitives/Card";
import { Button } from "@/components/panel/primitives/Button";
import { StatusPill } from "@/components/panel/primitives/StatusPill";
import { OriginBadge } from "@/components/panel/primitives/OriginBadge";
import { EmptyState } from "@/components/panel/primitives/EmptyState";

export default function PerfilPacientePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const hoy = useHoyPanel();

  const [paciente, setPaciente] = useState<PacienteResuelto | null | undefined>(undefined);
  const [historial, setHistorial] = useState<CitaResuelta[]>([]);
  const [contadores, setContadores] = useState({ atendidas: 0, canceladas: 0, noAsistidas: 0 });
  const [fichas, setFichas] = useState<FichaResuelta[]>([]);

  useEffect(() => {
    if (!hoy) return;
    getPaciente(id).then(setPaciente);
    historialPaciente(id, hoy).then(setHistorial);
    contadoresPaciente(id, hoy).then(setContadores);
    fichasDelPaciente(id, hoy).then(setFichas);
  }, [id, hoy]);

  if (!hoy || paciente === undefined) return <div aria-hidden />;

  if (paciente === null) {
    return (
      <EmptyState
        titulo="Paciente no encontrado"
        descripcion="No existe ningún paciente con ese identificador."
        accion={
          <Button variante="secundario" onClick={() => router.push("/panel/pacientes")}>
            Volver a Pacientes
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-panel-sidebar">
              {paciente.nombre} {paciente.apellido}
            </h2>
            <p className="text-sm text-brand-muted">RUT: {paciente.rut}</p>
            <p className="mt-2 text-sm text-brand-muted">{paciente.telefono}</p>
            <p className="text-sm text-brand-muted">{paciente.correo}</p>
            <p className="mt-2 text-sm text-brand-muted">
              Convenio: {paciente.convenio?.nombre ?? "—"}
            </p>
            <p className="mt-1 text-xs text-brand-muted">
              Registrado {paciente.origenRegistro === "web" ? "desde la web" : "por el personal"}
            </p>
          </div>
          <Button
            variante="primario"
            onClick={() => router.push(`/panel/nueva-reserva/horario?pacienteId=${paciente.id}`)}
          >
            + Agendar cita
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-panel-sidebar">{contadores.atendidas}</p>
          <p className="text-xs uppercase tracking-wide text-brand-muted">Atendidas</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-panel-sidebar">{contadores.canceladas}</p>
          <p className="text-xs uppercase tracking-wide text-brand-muted">Canceladas</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-panel-sidebar">{contadores.noAsistidas}</p>
          <p className="text-xs uppercase tracking-wide text-brand-muted">No asistidas</p>
        </Card>
      </div>

      <Card>
        <p className="mb-4 font-bold text-panel-sidebar">Historial de citas</p>
        {historial.length === 0 ? (
          <EmptyState titulo="Sin citas registradas" descripcion="Este paciente aún no tiene citas en el sistema." />
        ) : (
          <ul className="divide-y divide-brand-border">
            {historial.map((cita) => {
              const definicion = definicionEstado(cita.estado);
              return (
                <li key={cita.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <div>
                    <p className="font-medium text-panel-sidebar">
                      {formatearFechaCorta(cita.fecha)} · {formatearRangoHorario(cita.horaInicio, cita.horaTermino)}
                    </p>
                    <p className="text-xs text-brand-muted capitalize">
                      {cita.servicio} · {cita.especialista.nombre}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <OriginBadge origen={cita.origen} />
                    <StatusPill etiqueta={definicion.etiqueta} colorRol={definicion.colorRol} conTrama={definicion.conTrama} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card>
        <p className="mb-4 font-bold text-panel-sidebar">Fichas clínicas</p>
        {fichas.length === 0 ? (
          <EmptyState titulo="Sin fichas" descripcion="Este paciente aún no tiene fichas clínicas registradas." />
        ) : (
          <ul className="divide-y divide-brand-border">
            {fichas.map((ficha) => (
              <li key={ficha.id}>
                <button
                  type="button"
                  onClick={() => router.push(`/panel/fichas/${ficha.id}`)}
                  className="flex w-full items-center justify-between gap-2 py-3 text-left text-sm hover:bg-panel-fondo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar rounded"
                >
                  <span className="font-medium text-panel-sidebar">{ficha.tipo}</span>
                  <span className="text-brand-muted">{formatearFechaCorta(ficha.cita.fecha)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
