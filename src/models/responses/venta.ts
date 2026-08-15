export interface VentaItemResponse {
  id: number;
  tipo: string;
  servicioId?: number;
  servicioNombre?: string;
  descripcion?: string;
  monto: number;
}

export interface DesgloseCobroResponse {
  montoTotal: number;
  impuesto?: number;
  tasaIvaAplicada?: number;
  comisionTerminal: number;
  porcentajeComisionAplicado?: number;
  cargoFijoAplicado?: number;
  montoProfesional?: number;
  montoCentro?: number;
  porcentajeProfesionalAplicado?: number;
  motivoNoCalculable?: string;
}

export interface VentaResponse {
  id: number;
  citaId?: number;
  pacienteId?: number;
  pacienteNombre?: string;
  metodoPago: string;
  terminalPagoId?: number;
  terminalNombre?: string;
  montoTotal: number;
  creadoPorUsuarioId: number;
  creadoPorNombre?: string;
  createdAt: string;
  items: VentaItemResponse[];
  desglose: DesgloseCobroResponse;
}

export interface VentasPaginadasResponse {
  total: number;
  page: number;
  pageSize: number;
  montoTotalPeriodo: number;
  items: VentaResponse[];
}

export interface ComisionTerminalResponse {
  metodoPago: string;
  porcentaje: number;
  tipoModelo: string;
  cargoFijo?: number;
  vigenteDesde: string;
  vigenteHasta?: string;
}

export interface TerminalPagoResponse {
  id: number;
  nombre: string;
  plazoAbonoDias: number;
  activo: boolean;
  comisiones: ComisionTerminalResponse[];
}

export interface RepartoProfesionalResponse {
  id: number;
  especialistaId: number;
  especialistaNombre?: string;
  porcentajeProfesional: number;
  porcentajeCentro: number;
  vigenteDesde: string;
  vigenteHasta?: string;
}

export interface TasaImpuestoResponse {
  id: number;
  porcentaje: number;
  vigenteDesde: string;
  vigenteHasta?: string;
}
