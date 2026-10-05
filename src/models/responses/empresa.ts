/** Descuento pactado con una empresa convenio para un servicio */
export interface ConvenioDescuentoResponse {
  servicioId: number;
  servicioNombre: string;
  porcentaje: number;
  activo: boolean;
}

/** Una empresa convenio */
export interface EmpresaResponse {
  id: number;
  nombre: string;
  activo: boolean;
  vigenteDesde?: string;
  vigenteHasta?: string;
  convenios: ConvenioDescuentoResponse[];
}

/** Datos públicos de una empresa convenio */
export interface EmpresaPublicaResponse {
  id: number;
  nombre: string;
}
