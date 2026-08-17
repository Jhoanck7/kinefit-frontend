import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getFormato, guardarFormato, listFormatos } from "@/lib/formatos-ficha";
import { Formato } from "@/models/responses";

export const useGetFormatos = () => {
  return useQuery({
    queryKey: ["formatos"],
    queryFn: () => listFormatos(),
  });
};

export const useGetFormatoById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ["formatos", "detalle", id],
    queryFn: () => getFormato(id),
    enabled: enabled && Boolean(id),
  });
};

export const useGuardarFormatoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formato: Formato) => {
      guardarFormato(formato);
      return formato;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formatos"] });
    },
  });
};
