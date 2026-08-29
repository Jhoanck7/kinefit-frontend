import { CuerpoFormato } from "./formato";

/** Lo mínimo para que el paciente lea y firme, sin ningún id interno */
export interface DocumentoPublicoResponse {
  nombreFormato: string;
  tipo: string;
  origen: string;
  cuerpo?: CuerpoFormato;
  tieneArchivo: boolean;
  servicio: string;
  fecha: string;
  hora: string;
  estado: string;
  huellaMostrada: string;
}

export interface DocumentoPacienteResponse {
  id: number;
  nombreFormato: string;
  tipo: string;
  origen: string;
  estado: string;
  firmaPacienteLista: boolean;
  firmadoPacienteEn?: string;
  firmaProfesionalLista: boolean;
  firmadoProfesionalEn?: string;
  requiereFirmaProfesional: boolean;
  reutilizado: boolean;
  vigenteDesde?: string;
  vigenteHasta?: string;
  createdAt: string;
}
