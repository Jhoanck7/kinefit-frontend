import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { contenidoService } from "@/services";

/** Obtiene el contenido institucional del sitio público */
export const useGetContenido = (enabled = true) => {
  return useQuery({
    queryKey: ["contenido"],
    queryFn: async () => {
      const res = await contenidoService.getAll();
      return res.data.data;
    },
    enabled,
  });
};

/** Actualiza el valor de una clave de contenido institucional */
export const useUpdateContenidoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clave, valor }: { clave: string; valor: string }) =>
      contenidoService.update(clave, { valor }).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contenido"] });
    },
  });
};
