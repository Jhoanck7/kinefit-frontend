import { useQuery } from "@tanstack/react-query";

import { empresaService } from "@/services";

export const useGetEmpresas = (soloActivos = true) => {
  return useQuery({
    queryKey: ["empresas", soloActivos],
    queryFn: () =>
      empresaService.getAll(soloActivos).then(res => res.data.data),
  });
};
