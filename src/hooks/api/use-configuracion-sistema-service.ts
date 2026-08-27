import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { UpdateConfiguracionSistemaRequest } from "@/models/requests";
import { configuracionSistemaService } from "@/services";

export const useGetConfiguracionSistema = () => {
  return useQuery({
    queryKey: ["configuracion-sistema"],
    queryFn: async () => {
      const res = await configuracionSistemaService.getConfig();
      return res.data.data;
    },
  });
};

export const useUpdateConfiguracionSistemaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateConfiguracionSistemaRequest) =>
      configuracionSistemaService.updateConfig(data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configuracion-sistema"] });
    },
  });
};
