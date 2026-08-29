export type TipoDocumentoClinico =
  | "FichaClinica"
  | "Recomendacion"
  | "Consentimiento";

export type OrigenFormato = "Constructor" | "Documento";

export type TipoCampoFormato =
  | "TextoCorto"
  | "TextoLargo"
  | "Numerico"
  | "Fecha"
  | "Seleccion"
  | "TextoInformativo";

export type CompletadoPor = "Profesional" | "Paciente";

export interface CampoFormato {
  id: string;
  nombre: string;
  tipo: TipoCampoFormato;
  obligatorio: boolean;
  ayuda?: string;
  opciones?: string[];
  completadoPor: CompletadoPor;
  orden: number;
}

export interface SeccionFormato {
  id: string;
  nombre: string;
  orden: number;
  campos: CampoFormato[];
}

/** Estructura del formato. Es lo que viaja dentro de `cuerpo`. */
export interface CuerpoFormato {
  secciones: SeccionFormato[];
}

export interface FormatoFichaResponse {
  id: number;
  nombre: string;
  tipo: TipoDocumentoClinico;
  /** Rótulo emitido por el servidor. Nunca deducirlo en el cliente. */
  tipoNombre: string;
  origen: OrigenFormato;
  /** Ausente en los formatos subidos como documento. */
  cuerpo?: CuerpoFormato;
  tieneArchivo: boolean;
  requiereFirmaPaciente: boolean;
  requiereFirmaProfesional: boolean;
  activo: boolean;
  fichasAsociadas: number;
  createdAt: string;
  updatedAt: string;
}
