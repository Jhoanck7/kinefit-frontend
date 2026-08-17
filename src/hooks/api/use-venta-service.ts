import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  CreateRepartoProfesionalRequest,
  CreateTasaImpuestoRequest,
  CreateTerminalPagoRequest,
  CreateVentaRequest,
} from "@/models/requests";
import { FiltrosVentas, ventaService } from "@/services";

export const useGetVentas = (filtros?: FiltrosVentas) => {
  return useQuery({
    queryKey: ["ventas", filtros],
    queryFn: () => ventaService.getAll(filtros).then(res => res.data.data),
  });
};

export const useGetVentaById = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ["ventas", "detalle", id],
    queryFn: () => ventaService.getById(id).then(res => res.data.data),
    enabled: enabled && Boolean(id),
  });
};

export const useCreateVentaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVentaRequest) =>
      ventaService.create(data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ventas"] });
    },
  });
};

export const useGetTerminales = () => {
  return useQuery({
    queryKey: ["terminales-pago"],
    queryFn: () => ventaService.getTerminales().then(res => res.data.data),
  });
};

export const useCreateTerminalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTerminalPagoRequest) =>
      ventaService.createTerminal(data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["terminales-pago"] });
    },
  });
};

export const useGetRepartos = () => {
  return useQuery({
    queryKey: ["repartos-profesionales"],
    queryFn: () => ventaService.getRepartos().then(res => res.data.data),
  });
};

export const useCreateRepartoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRepartoProfesionalRequest) =>
      ventaService.createReparto(data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repartos-profesionales"] });
    },
  });
};

export const useGetTasasImpuesto = () => {
  return useQuery({
    queryKey: ["tasas-impuesto"],
    queryFn: () => ventaService.getTasasImpuesto().then(res => res.data.data),
  });
};

export const useCreateTasaImpuestoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTasaImpuestoRequest) =>
      ventaService.createTasaImpuesto(data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasas-impuesto"] });
    },
  });
};
