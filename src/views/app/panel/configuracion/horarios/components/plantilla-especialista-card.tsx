"use client";

import { Alerta } from "@/components/shared";
import { Card } from "@/components/ui";
import {
  useCreatePlantillaHorarioMutation,
  useDeletePlantillaHorarioMutation,
  useGetPlantillaHorario,
} from "@/hooks/api";
import { handleApiError } from "@/lib/api";
import { EspecialistaResponse } from "@/models/responses";

import { BloquesSemanaEditor } from "./bloques-semana-editor";

interface PlantillaEspecialistaCardProps {
  especialista: EspecialistaResponse;
}

export function PlantillaEspecialistaCard({
  especialista,
}: PlantillaEspecialistaCardProps) {
  const { data: plantilla = [], isLoading } = useGetPlantillaHorario(
    especialista.id
  );
  const crearMutation = useCreatePlantillaHorarioMutation();
  const eliminarMutation = useDeletePlantillaHorarioMutation();

  const handleAgregar = async (
    diaSemana: number,
    horaInicio: string,
    horaFin: string
  ) => {
    try {
      await crearMutation.mutateAsync({
        especialistaId: especialista.id,
        diaSemana,
        horaInicio,
        horaFin,
      });
    } catch {
      // El error se refleja abajo vía crearMutation.error
    }
  };

  const handleEliminar = (id: number) => {
    eliminarMutation.mutate(id);
  };

  return (
    <Card className="rounded-none border-slate-200 shadow-none p-5">
      <p className="mb-3 font-sans font-medium text-sm text-slate-900 border-b border-slate-200 pb-2">
        {especialista.nombre}{" "}
        <span className="font-normal text-slate-500">
          · {especialista.cargo}
        </span>
      </p>

      {crearMutation.isError && (
        <Alerta tono="error" className="mb-3">
          {handleApiError(crearMutation.error).message}
        </Alerta>
      )}
      {eliminarMutation.isError && (
        <Alerta tono="error" className="mb-3">
          {handleApiError(eliminarMutation.error).message}
        </Alerta>
      )}

      {isLoading ? (
        <p className="font-sans text-xs text-slate-400">
          Cargando plantilla horaria...
        </p>
      ) : (
        <BloquesSemanaEditor
          bloques={plantilla}
          onAgregar={handleAgregar}
          onEliminar={handleEliminar}
          eliminandoId={
            eliminarMutation.isPending ? eliminarMutation.variables : null
          }
        />
      )}
    </Card>
  );
}
