import { useQuery } from "@tanstack/react-query";

import {
  FiltrosReporteComisiones,
  FiltrosReporteReservas,
  FiltrosReporteVentas,
  reporteService,
} from "@/services";

export const useGetReporteVentas = (filtros?: FiltrosReporteVentas) => {
  return useQuery({
    queryKey: ["reporte-ventas", filtros],
    queryFn: () =>
      reporteService.getReporteVentas(filtros).then(res => res.data.data),
  });
};

export const useGetReporteReservas = (filtros?: FiltrosReporteReservas) => {
  return useQuery({
    queryKey: ["reporte-reservas", filtros],
    queryFn: () =>
      reporteService.getReporteReservas(filtros).then(res => res.data.data),
  });
};

export const useGetReporteComisiones = (filtros?: FiltrosReporteComisiones) => {
  return useQuery({
    queryKey: ["reporte-comisiones", filtros],
    queryFn: () =>
      reporteService.getReporteComisiones(filtros).then(res => res.data.data),
  });
};
