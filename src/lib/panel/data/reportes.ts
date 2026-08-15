import {
  ConteoResponse,
  RankingItemResponse,
  ReporteComisionesResponse,
  ReporteReservasResponse,
  ReporteVentasResponse,
} from "@/models/responses";
import { reporteService } from "@/services";

import { formatearFechaHora } from "../domain/formato";

export interface MetricaKpi {
  reservasTotales: number;
  porcentajeOcupacion: number;
  tasaInasistencias: number;
  variacionReservasTotales?: number;
  variacionPorcentajeOcupacion?: number;
  variacionTasaInasistencias?: number;
}

export interface PuntoEvolucionTemporal {
  periodo: string;
  reservas: number;
  ingresos: number;
}

export interface FrecuenciaHora {
  hora: string;
  cantidad: number;
}

export interface FrecuenciaDiaSemana {
  dia: string;
  cantidad: number;
}

export interface DistribucionEstado {
  estado: string;
  cantidad: number;
  porcentaje: number;
}

export interface DistribucionOrigen {
  origen: "Web" | "Manual";
  cantidad: number;
  porcentaje: number;
}

export interface ItemRanking {
  id: string;
  nombre: string;
  cantidad: number;
}

export interface RetencionClientes {
  nuevos: number;
  recurrentes: number;
  porcentajeNuevos: number;
  porcentajeRecurrentes: number;
}

export interface ReporteReservasResuelto {
  kpi: MetricaKpi;
  evolucionTemporal: PuntoEvolucionTemporal[];
  distribucionPorHora: FrecuenciaHora[];
  distribucionPorDiaSemana: FrecuenciaDiaSemana[];
  distribucionPorEstado: DistribucionEstado[];
  origen: DistribucionOrigen[];
  rankingServicios: ItemRanking[];
  rankingProfesionales: ItemRanking[];
  rankingClientes: ItemRanking[];
  retencion: RetencionClientes;
}

const REPORTE_RESERVAS_VACIO: ReporteReservasResuelto = {
  kpi: { reservasTotales: 0, porcentajeOcupacion: 0, tasaInasistencias: 0 },
  evolucionTemporal: [],
  distribucionPorHora: [],
  distribucionPorDiaSemana: [],
  distribucionPorEstado: [],
  origen: [],
  rankingServicios: [],
  rankingProfesionales: [],
  rankingClientes: [],
  retencion: {
    nuevos: 0,
    recurrentes: 0,
    porcentajeNuevos: 0,
    porcentajeRecurrentes: 0,
  },
};

function conPorcentaje(
  items: ConteoResponse[]
): { etiqueta: string; cantidad: number; porcentaje: number }[] {
  const total = items.reduce((acc, i) => acc + i.cantidad, 0) || 1;
  return items.map(i => ({
    etiqueta: i.etiqueta,
    cantidad: i.cantidad,
    porcentaje: Math.round((i.cantidad / total) * 100),
  }));
}

function mapRanking(items: RankingItemResponse[]): ItemRanking[] {
  return items.map(i => ({
    id: String(i.id),
    nombre: i.nombre,
    cantidad: i.cantidad,
  }));
}

function mapReservas(dto: ReporteReservasResponse): ReporteReservasResuelto {
  const totalClientes = dto.clientesNuevos + dto.clientesRecurrentes || 1;
  const totalOrigen = dto.origen.web + dto.origen.manual || 1;

  return {
    kpi: {
      reservasTotales: dto.indicadores.reservasTotales,
      porcentajeOcupacion: Number(dto.indicadores.porcentajeOcupacion),
      tasaInasistencias: Number(dto.indicadores.tasaInasistencias),
      variacionReservasTotales: dto.comparacion?.variacionReservasTotales
        ? Number(dto.comparacion.variacionReservasTotales)
        : undefined,
      variacionPorcentajeOcupacion: dto.comparacion
        ?.variacionPorcentajeOcupacion
        ? Number(dto.comparacion.variacionPorcentajeOcupacion)
        : undefined,
      variacionTasaInasistencias: dto.comparacion?.variacionTasaInasistencias
        ? Number(dto.comparacion.variacionTasaInasistencias)
        : undefined,
    },
    evolucionTemporal: dto.evolucionTemporal.map(p => ({
      periodo: p.periodo,
      reservas: p.reservas,
      ingresos: p.ingresos,
    })),
    distribucionPorHora: conPorcentaje(dto.distribucionPorHora).map(c => ({
      hora: c.etiqueta,
      cantidad: c.cantidad,
    })),
    distribucionPorDiaSemana: conPorcentaje(dto.distribucionPorDiaSemana).map(
      c => ({
        dia: c.etiqueta,
        cantidad: c.cantidad,
      })
    ),
    distribucionPorEstado: conPorcentaje(dto.distribucionPorEstado).map(c => ({
      estado: c.etiqueta,
      cantidad: c.cantidad,
      porcentaje: c.porcentaje,
    })),
    origen: [
      {
        origen: "Web",
        cantidad: dto.origen.web,
        porcentaje: Math.round((dto.origen.web / totalOrigen) * 100),
      },
      {
        origen: "Manual",
        cantidad: dto.origen.manual,
        porcentaje: Math.round((dto.origen.manual / totalOrigen) * 100),
      },
    ],
    rankingServicios: mapRanking(dto.rankingServicios),
    rankingProfesionales: mapRanking(dto.rankingProfesionales),
    rankingClientes: mapRanking(dto.rankingClientes),
    retencion: {
      nuevos: dto.clientesNuevos,
      recurrentes: dto.clientesRecurrentes,
      porcentajeNuevos: Math.round((dto.clientesNuevos / totalClientes) * 100),
      porcentajeRecurrentes: Math.round(
        (dto.clientesRecurrentes / totalClientes) * 100
      ),
    },
  };
}

export interface FiltroReporte {
  fechaDesde?: string;
  fechaHasta?: string;
}

export async function getReporteReservas(
  filtro: FiltroReporte & { compararCon?: boolean; vista?: string } = {}
): Promise<ReporteReservasResuelto> {
  try {
    const res = await reporteService.getReporteReservas(filtro);
    return mapReservas(res.data.data);
  } catch {
    return REPORTE_RESERVAS_VACIO;
  }
}

export interface MovimientoVentaReporte {
  id: string;
  codigo: string;
  fecha: string;
  monto: number;
  pacienteId?: string;
  pacienteNombre: string;
  metodoPago: string;
}

export interface ReporteVentasResuelto {
  totalVentas: number;
  montoTotalPeriodo: number;
  page: number;
  pageSize: number;
  movimientos: MovimientoVentaReporte[];
}

function mapVentasReporte(dto: ReporteVentasResponse): ReporteVentasResuelto {
  return {
    totalVentas: dto.totalVentas,
    montoTotalPeriodo: dto.montoTotalPeriodo,
    page: dto.page,
    pageSize: dto.pageSize,
    movimientos: dto.movimientos.map(m => ({
      id: String(m.id),
      codigo: `#${m.id}`,
      fecha: formatearFechaHora(new Date(m.fecha)),
      monto: m.monto,
      pacienteId: m.pacienteId ? String(m.pacienteId) : undefined,
      pacienteNombre: m.pacienteNombre || "Cliente sin registrar",
      metodoPago: m.metodoPago,
    })),
  };
}

export async function getReporteVentas(
  filtro: FiltroReporte & { page?: number; pageSize?: number } = {}
): Promise<ReporteVentasResuelto> {
  try {
    const res = await reporteService.getReporteVentas(filtro);
    return mapVentasReporte(res.data.data);
  } catch {
    return {
      totalVentas: 0,
      montoTotalPeriodo: 0,
      page: 1,
      pageSize: 8,
      movimientos: [],
    };
  }
}

export async function descargarReporteVentasCsv(
  filtro: FiltroReporte = {}
): Promise<void> {
  const res = await reporteService.descargarReporteVentasCsv(filtro);
  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = "reporte-ventas.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export interface DesgloseProfesionalComision {
  especialistaId: string;
  especialistaNombre: string;
  totalVentas: number;
  montoTotalCobrado: number;
  impuesto: number;
  comisionTerminal: number;
  ventasSinTasaVigente: number;
  ventasSinRepartoVigente: number;
  porcentajeProfesionalVigente?: number;
  montoProfesional?: number;
  montoCentro?: number;
  motivoNoCalculable?: string;
}

export interface ReporteComisionesResuelto {
  generadoEl: string;
  profesionales: DesgloseProfesionalComision[];
}

function mapComisiones(
  dto: ReporteComisionesResponse
): ReporteComisionesResuelto {
  return {
    generadoEl: formatearFechaHora(new Date(dto.generadoEl)),
    profesionales: dto.profesionales.map(p => ({
      especialistaId: String(p.especialistaId),
      especialistaNombre: p.especialistaNombre,
      totalVentas: p.totalVentas,
      montoTotalCobrado: p.montoTotalCobrado,
      impuesto: p.impuesto ?? 0,
      comisionTerminal: p.comisionTerminal,
      ventasSinTasaVigente: p.ventasSinTasaVigente,
      ventasSinRepartoVigente: p.ventasSinRepartoVigente,
      porcentajeProfesionalVigente: p.porcentajeProfesionalVigente
        ? Number(p.porcentajeProfesionalVigente)
        : undefined,
      montoProfesional: p.montoProfesional,
      montoCentro: p.montoCentro,
      motivoNoCalculable: p.motivoNoCalculable,
    })),
  };
}

export async function getReporteComisiones(
  filtro: FiltroReporte & { especialistaId?: number } = {}
): Promise<ReporteComisionesResuelto> {
  try {
    const res = await reporteService.getReporteComisiones(filtro);
    return mapComisiones(res.data.data);
  } catch {
    return { generadoEl: "", profesionales: [] };
  }
}
