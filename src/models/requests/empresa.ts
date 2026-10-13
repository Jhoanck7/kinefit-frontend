/** Descuento pactado con una empresa convenio para un servicio */
export interface ConvenioDescuentoRequest {
  servicioId: number;
  porcentaje: number;
}

/** Datos para crear una empresa convenio */
export interface CreateEmpresaRequest {
  nombre: string;
  vigenteDesde?: string;
  vigenteHasta?: string;
  convenios: ConvenioDescuentoRequest[];
}

/** Datos para actualizar una empresa convenio */
export interface UpdateEmpresaRequest {
  nombre: string;
  vigenteDesde?: string;
  vigenteHasta?: string;
  convenios: ConvenioDescuentoRequest[];
}
