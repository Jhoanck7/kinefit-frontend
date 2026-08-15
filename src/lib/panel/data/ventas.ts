import {
  RepartoProfesionalResponse,
  TasaImpuestoResponse,
  TerminalPagoResponse,
  VentaResponse,
} from "@/models/responses";
import { ventaService } from "@/services";

import { formatearFechaHora } from "../domain/formato";

export type MetodoPago = "Efectivo" | "Transferencia" | "Debito" | "Credito";

export interface VentaItemResuelto {
  id: string;
  tipo: string;
  servicioId?: number;
  servicioNombre: string;
  descripcion?: string;
  monto: number;
}

export interface VentaResuelta {
  id: string;
  codigoDisplay: string;
  fecha: Date;
  fechaFormateada: string;
  citaId?: string;
  pacienteId?: string;
  pacienteNombre: string;
  metodoPago: MetodoPago;
  terminalPosId?: string;
  terminalNombre?: string;
  montoBruto: number;
  items: VentaItemResuelto[];
  comisionPosMonto: number;
  ivaMonto: number;
  montoNeto: number;
  baseReparticion: number;
  repartoConfigurado: boolean;
  porcentajeProfesionalAplicado?: number;
  pagoProfesional?: number;
  margenClinica?: number;
  motivoNoCalculable?: string;
  registradaPor?: string;
}

function mapVenta(dto: VentaResponse): VentaResuelta {
  const d = dto.desglose;
  const ivaMonto = d.impuesto ?? 0;
  const montoNeto = d.montoTotal - ivaMonto;
  const baseReparticion = montoNeto - d.comisionTerminal;
  const repartoConfigurado =
    d.montoProfesional !== undefined && d.montoCentro !== undefined;

  return {
    id: String(dto.id),
    codigoDisplay: `#${dto.id}`,
    fecha: new Date(dto.createdAt),
    fechaFormateada: formatearFechaHora(new Date(dto.createdAt)),
    citaId: dto.citaId ? String(dto.citaId) : undefined,
    pacienteId: dto.pacienteId ? String(dto.pacienteId) : undefined,
    pacienteNombre: dto.pacienteNombre || "Cliente sin registrar",
    metodoPago: dto.metodoPago as MetodoPago,
    terminalPosId: dto.terminalPagoId ? String(dto.terminalPagoId) : undefined,
    terminalNombre: dto.terminalNombre,
    montoBruto: d.montoTotal,
    items: dto.items.map(i => ({
      id: String(i.id),
      tipo: i.tipo,
      servicioId: i.servicioId,
      servicioNombre: i.servicioNombre || i.descripcion || "Ítem",
      descripcion: i.descripcion,
      monto: i.monto,
    })),
    comisionPosMonto: d.comisionTerminal,
    ivaMonto,
    montoNeto,
    baseReparticion,
    repartoConfigurado,
    porcentajeProfesionalAplicado: d.porcentajeProfesionalAplicado
      ? Number(d.porcentajeProfesionalAplicado)
      : undefined,
    pagoProfesional: d.montoProfesional,
    margenClinica: d.montoCentro,
    motivoNoCalculable: d.motivoNoCalculable,
    registradaPor: dto.creadoPorNombre,
  };
}

export interface FiltroVentas {
  fechaDesde?: string;
  fechaHasta?: string;
  metodoPago?: string;
  page?: number;
  pageSize?: number;
}

export async function listVentas(filtro: FiltroVentas = {}): Promise<{
  ventas: VentaResuelta[];
  total: number;
  montoTotalPeriodo: number;
}> {
  try {
    const res = await ventaService.getAll(filtro);
    const data = res.data.data;
    return {
      ventas: data.items.map(mapVenta),
      total: data.total,
      montoTotalPeriodo: data.montoTotalPeriodo,
    };
  } catch {
    return { ventas: [], total: 0, montoTotalPeriodo: 0 };
  }
}

export interface CrearVentaInput {
  citaId?: number;
  pacienteId?: number;
  metodoPago: MetodoPago;
  terminalPagoId?: number;
  descripcion: string;
  monto: number;
}

export async function crearVenta(
  input: CrearVentaInput
): Promise<VentaResuelta> {
  const res = await ventaService.create({
    citaId: input.citaId,
    pacienteId: input.pacienteId,
    metodoPago: input.metodoPago,
    terminalPagoId: input.terminalPagoId,
    items: [
      { tipo: "Servicio", descripcion: input.descripcion, monto: input.monto },
    ],
  });
  return mapVenta(res.data.data);
}

export interface TerminalResuelto {
  id: string;
  nombre: string;
  plazoAbonoDias: number;
  activo: boolean;
  comisionDebito?: number;
  cargoFijoDebito?: number;
  comisionCredito?: number;
  cargoFijoCredito?: number;
}

function mapTerminal(dto: TerminalPagoResponse): TerminalResuelto {
  const debito = dto.comisiones.find(c => c.metodoPago === "Debito");
  const credito = dto.comisiones.find(c => c.metodoPago === "Credito");
  return {
    id: String(dto.id),
    nombre: dto.nombre,
    plazoAbonoDias: dto.plazoAbonoDias,
    activo: dto.activo,
    comisionDebito: debito?.porcentaje,
    cargoFijoDebito: debito?.cargoFijo,
    comisionCredito: credito?.porcentaje,
    cargoFijoCredito: credito?.cargoFijo,
  };
}

export async function listTerminales(): Promise<TerminalResuelto[]> {
  try {
    const res = await ventaService.getTerminales();
    return res.data.data.map(mapTerminal);
  } catch {
    return [];
  }
}

export interface CrearTerminalInput {
  nombre: string;
  plazoAbonoDias: number;
  comisionDebito: number;
  cargoFijoDebito: number;
  comisionCredito: number;
  cargoFijoCredito: number;
}

export async function crearTerminal(
  input: CrearTerminalInput
): Promise<TerminalResuelto> {
  const res = await ventaService.createTerminal({
    nombre: input.nombre,
    plazoAbonoDias: input.plazoAbonoDias,
    comisiones: [
      {
        metodoPago: "Debito",
        porcentaje: input.comisionDebito,
        tipoModelo: input.cargoFijoDebito > 0 ? "Mixto" : "Porcentual",
        cargoFijo:
          input.cargoFijoDebito > 0 ? input.cargoFijoDebito : undefined,
      },
      {
        metodoPago: "Credito",
        porcentaje: input.comisionCredito,
        tipoModelo: input.cargoFijoCredito > 0 ? "Mixto" : "Porcentual",
        cargoFijo:
          input.cargoFijoCredito > 0 ? input.cargoFijoCredito : undefined,
      },
    ],
  });
  return mapTerminal(res.data.data);
}

export interface RepartoResuelto {
  id: string;
  especialistaId: string;
  especialistaNombre: string;
  porcentajeProfesional: number;
  porcentajeCentro: number;
  vigenteDesde: string;
}

function mapReparto(dto: RepartoProfesionalResponse): RepartoResuelto {
  return {
    id: String(dto.id),
    especialistaId: String(dto.especialistaId),
    especialistaNombre: dto.especialistaNombre || "Especialista",
    porcentajeProfesional: Number(dto.porcentajeProfesional),
    porcentajeCentro: Number(dto.porcentajeCentro),
    vigenteDesde: dto.vigenteDesde,
  };
}

export async function listRepartos(): Promise<RepartoResuelto[]> {
  try {
    const res = await ventaService.getRepartos();
    return res.data.data.map(mapReparto);
  } catch {
    return [];
  }
}

export async function crearReparto(input: {
  especialistaId: number;
  porcentajeProfesional: number;
  vigenteDesde: string;
}): Promise<RepartoResuelto> {
  const res = await ventaService.createReparto(input);
  return mapReparto(res.data.data);
}

export interface TasaIvaResuelta {
  id: string;
  porcentaje: number;
  vigenteDesde: string;
  vigenteHasta?: string;
}

function mapTasaIva(dto: TasaImpuestoResponse): TasaIvaResuelta {
  return {
    id: String(dto.id),
    porcentaje: Number(dto.porcentaje),
    vigenteDesde: dto.vigenteDesde,
    vigenteHasta: dto.vigenteHasta,
  };
}

export async function listTasasIva(): Promise<TasaIvaResuelta[]> {
  try {
    const res = await ventaService.getTasasImpuesto();
    return res.data.data.map(mapTasaIva);
  } catch {
    return [];
  }
}

export async function crearTasaIva(input: {
  porcentaje: number;
  vigenteDesde: string;
}): Promise<TasaIvaResuelta> {
  const res = await ventaService.createTasaImpuesto(input);
  return mapTasaIva(res.data.data);
}
