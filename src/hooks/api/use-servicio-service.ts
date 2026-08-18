import { useQuery } from "@tanstack/react-query";

import { servicioService } from "@/services";

export const useGetServicios = (soloActivos = true) => {
  return useQuery({
    queryKey: ["servicios", soloActivos],
    queryFn: () =>
      servicioService.getAll(soloActivos).then(res => res.data.data),
  });
};
