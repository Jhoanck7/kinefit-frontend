export interface CreateVentaItemRequest {
  tipo: "Servicio" | "Producto" | "Propina";
  servicioId?: number;
  descripcion?: string;
  monto: number;
}

export interface CreateVentaRequest {
  citaId?: number;
  pacienteId?: number;
  metodoPago: "Efectivo" | "Transferencia" | "Debito" | "Credito";
  terminalPagoId?: number;
  items: CreateVentaItemRequest[];
}

export interface CreateComisionTerminalRequest {
  metodoPago: "Debito" | "Credito";
  porcentaje: number;
  tipoModelo?: "Porcentual" | "Mixto";
  cargoFijo?: number;
}

export interface CreateTerminalPagoRequest {
  nombre: string;
  plazoAbonoDias: number;
  comisiones: CreateComisionTerminalRequest[];
}

export interface CreateRepartoProfesionalRequest {
  especialistaId: number;
  porcentajeProfesional: number;
  vigenteDesde: string;
}

export interface CreateTasaImpuestoRequest {
  porcentaje: number;
  vigenteDesde: string;
}
