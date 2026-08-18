import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { CreateBloqueoAgendaRequest } from "@/models/requests";
import { agendaService } from "@/services";

const agendaKey = (especialistaIds: number[], desde: string, hasta: string) =>
  ["agenda", { especialistaIds, desde, hasta }] as const;

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
