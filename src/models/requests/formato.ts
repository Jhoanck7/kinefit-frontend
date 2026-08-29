import { CuerpoFormato, TipoDocumentoClinico } from "../responses/formato";

export interface CreateFormatoFichaRequest {
  nombre: string;
  tipo: TipoDocumentoClinico;
  cuerpo: CuerpoFormato;
  requiereFirmaPaciente: boolean;
  requiereFirmaProfesional: boolean;
}

export interface UpdateFormatoFichaRequest {
  nombre: string;
  tipo: TipoDocumentoClinico;
  /** Se omite en los formatos subidos como documento: conservan su PDF. */
  cuerpo?: CuerpoFormato;
  requiereFirmaPaciente: boolean;
  requiereFirmaProfesional: boolean;
}
