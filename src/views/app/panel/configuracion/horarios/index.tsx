"use client";

import { useSession } from "next-auth/react";

import {
  GenerarAgendaForm,
  HorarioCentroCard,
  PlantillaEspecialistaCard,
} from "./components";
import { useHorarios } from "./hooks";

export default function HorariosView() {
  const { data: session } = useSession();
  const esAdministrador = session?.user.rol === "Administrador";
  const { especialistas, isLoading } = useHorarios();

  if (isLoading) {
    return (
      <div className="p-4 text-xs font-sans text-slate-500">
        Cargando plantilla de horarios…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 font-sans shadow-none">
      <div>
        <h2 className="font-sans text-section-title font-bold text-foreground mb-0.5">
          Horarios y Generación de Agenda
        </h2>
        <p className="font-sans text-xs text-slate-500">
          Administra el horario del centro, la plantilla semanal de cada
          profesional, y genera los bloques de agenda a partir de ambos.
        </p>
      </div>

      {esAdministrador && <HorarioCentroCard />}

      <div>
        <h3 className="font-sans text-xs font-bold text-foreground mb-3">
          Plantilla por Especialista
        </h3>
        <div className="space-y-4">
          {especialistas.length === 0 ? (
            <p className="font-sans text-xs text-slate-400">
              No hay especialistas registrados.
            </p>
          ) : (
            especialistas.map(especialista => (
              <PlantillaEspecialistaCard
                key={especialista.id}
                especialista={especialista}
              />
            ))
          )}
        </div>
      </div>

      <GenerarAgendaForm />
    </div>
  );
}
