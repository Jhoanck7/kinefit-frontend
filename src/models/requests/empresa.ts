export interface ConvenioDescuentoRequest {
  servicioId: number;
  porcentaje: number;
}

export interface CreateEmpresaRequest {
  nombre: string;
  vigenteDesde?: string;
  vigenteHasta?: string;
  convenios: ConvenioDescuentoRequest[];
}

export interface UpdateEmpresaRequest {
  nombre: string;
  vigenteDesde?: string;
  vigenteHasta?: string;
  convenios: ConvenioDescuentoRequest[];
}
