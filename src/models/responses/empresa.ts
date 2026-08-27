export interface ConvenioDescuentoResponse {
  servicioId: number;
  servicioNombre: string;
  porcentaje: number;
  activo: boolean;
}

export interface EmpresaResponse {
  id: number;
  nombre: string;
  activo: boolean;
  vigenteDesde?: string;
  vigenteHasta?: string;
  convenios: ConvenioDescuentoResponse[];
}
