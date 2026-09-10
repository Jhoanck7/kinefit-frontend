export type TipoDocumentoClinico =
  "FichaClinica" | "Recomendacion" | "Consentimiento";

export type OrigenFormato = "Constructor" | "Documento";

export type TipoCampoFormato =
  | "TextoCorto"
  | "TextoLargo"
  | "Numerico"
  | "Fecha"
  | "Seleccion"
  | "TextoInformativo"
  | "Firma";

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

export interface CuerpoFormato {
  secciones: SeccionFormato[];
}

export interface PlantillaResponse {
  id: number;
  nombre: string;
  tipo: TipoDocumentoClinico;
  tipoNombre: string;
  origen: OrigenFormato;
  cuerpo?: CuerpoFormato;
  tieneArchivo: boolean;
  requiereFirmaPaciente: boolean;
  requiereFirmaProfesional: boolean;
  activo: boolean;
  documentosAsociados: number;
  serviciosAsignados: number;
  createdAt: string;
  updatedAt: string;
}
