import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  CreateBloqueoAgendaRequest,
  CreateBloqueoAgendaTodosRequest,
} from "@/models/requests";
import { agendaService } from "@/services";

const agendaKey = (especialistaIds: number[], desde: string, hasta: string) =>
  ["agenda", { especialistaIds, desde, hasta }] as const;

/** Obtiene los bloques de agenda de los especialistas en un rango de fechas */
export const useGetAgenda = (
  especialistaIds: number[],
  desde: string,
  hasta: string,
  enabled = true
) => {
  return useQuery({
    queryKey: agendaKey(especialistaIds, desde, hasta),
    queryFn: async () => {
      const response = await agendaService.getAgenda(
        especialistaIds,
        desde,
        hasta
      );
      return response.data.data;
    },
    enabled,
  });
};

/** Obtiene los bloqueos de agenda de un especialista */
export const useGetBloqueos = (especialistaId?: number, enabled = true) => {
  return useQuery({
    queryKey: ["bloqueos-agenda", especialistaId],
    queryFn: async () => {
      const response = await agendaService.getBloqueos(
        especialistaId as number
      );
      return response.data.data;
    },
    enabled: enabled && Boolean(especialistaId),
  });
};

/** Crea un bloqueo de agenda para un especialista */
export const useCreateBloqueoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBloqueoAgendaRequest) =>
      agendaService.createBloqueo(data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bloqueos-agenda"] });
      queryClient.invalidateQueries({ queryKey: ["agenda"] });
    },
  });
};

/** Crea un bloqueo de agenda para todos los especialistas */
export const useCreateBloqueoParaTodosMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBloqueoAgendaTodosRequest) =>
      agendaService.createBloqueoParaTodos(data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bloqueos-agenda"] });
      queryClient.invalidateQueries({ queryKey: ["agenda"] });
    },
  });
};

/** Revierte un bloqueo de agenda */
export const useRevertirBloqueoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      agendaService.revertirBloqueo(id).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bloqueos-agenda"] });
      queryClient.invalidateQueries({ queryKey: ["agenda"] });
    },
  });
};
