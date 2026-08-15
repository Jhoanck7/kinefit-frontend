import { useQuery } from "@tanstack/react-query";

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
