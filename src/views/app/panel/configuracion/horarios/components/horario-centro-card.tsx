"use client";

import { Alerta } from "@/components/shared";
import { Card } from "@/components/ui";
import {
  useCreateHorarioCentroMutation,
  useDeleteHorarioCentroMutation,
  useGetHorarioCentro,
} from "@/hooks/api";
import { handleApiError } from "@/lib/api";

import { BloquesSemanaEditor } from "./bloques-semana-editor";

export function HorarioCentroCard() {
  const { data: horarioCentro = [], isLoading } = useGetHorarioCentro();
  const crearMutation = useCreateHorarioCentroMutation();
  const eliminarMutation = useDeleteHorarioCentroMutation();

  const handleAgregar = async (
    diaSemana: number,
    horaInicio: string,
    horaFin: string
  ) => {
    try {
      await crearMutation.mutateAsync({ diaSemana, horaInicio, horaFin });
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
        Horario del Centro
      </p>
      <p className="mb-3 font-sans text-xs text-slate-500">
        Franjas en las que la clínica atiende, independiente del especialista.
        La generación de agenda solo crea bloques dentro de estas franjas.
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
          Cargando horario del centro...
        </p>
      ) : (
        <BloquesSemanaEditor
          bloques={horarioCentro}
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
