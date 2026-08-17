export type TipoCampoFormato =
  | "texto_corto"
  | "texto_largo"
  | "numerico"
  | "fecha"
  | "seleccion";

export interface CampoFormato {
  id: string;
  nombre: string;
  tipo: TipoCampoFormato;
  obligatorio: boolean;
  placeholder?: string;
  ayuda?: string;
  opciones?: string[];
}

export interface SeccionFormato {
  id: string;
  nombre: string;
  campos: CampoFormato[];
}

export interface Formato {
  id: string;
  nombre: string;
  secciones: SeccionFormato[];
}

export interface FormatoResuelto extends Formato {
  modificadoEn: Date;
  fichasCreadas: number;
}
