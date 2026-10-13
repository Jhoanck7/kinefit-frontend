/** Tipos de documento clínico que puede generar una plantilla */
export type TipoDocumentoClinico =
  "FichaClinica" | "Recomendacion" | "Consentimiento";

/** Origen del formato de una plantilla: armado en el constructor o subido como documento */
export type OrigenFormato = "Constructor" | "Documento";

/** Tipos de campo disponibles al construir una plantilla */
export type TipoCampoFormato =
  | "TextoCorto"
  | "TextoLargo"
  | "Numerico"
  | "Fecha"
  | "Seleccion"
  | "TextoInformativo"
  | "Firma";

/** Quién debe completar un campo de una plantilla */
export type CompletadoPor = "Profesional" | "Paciente";

/** Un campo dentro de una sección de una plantilla */
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

/** Una sección del cuerpo de una plantilla, con sus campos */
export interface SeccionFormato {
  id: string;
  nombre: string;
  orden: number;
  campos: CampoFormato[];
}

/** Cuerpo completo de una plantilla armada en el constructor */
export interface CuerpoFormato {
  secciones: SeccionFormato[];
}

/** Una plantilla de documento clínico */
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
