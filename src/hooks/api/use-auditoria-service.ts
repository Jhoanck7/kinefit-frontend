import { useQuery } from "@tanstack/react-query";

import { auditoriaService } from "@/services";

export const useGetAuditoriaCita = (citaId: number, enabled = true) => {
  return useQuery({
    queryKey: ["auditoria-cita", citaId],
    queryFn: () =>
      auditoriaService.getByCitaId(citaId).then(res => res.data.data),
    enabled: enabled && Boolean(citaId),
  });
};
