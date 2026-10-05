import { CuerpoFormato } from "../responses/plantilla";

/** Datos para crear una plantilla de ficha clínica */
export interface CreatePlantillaFichaRequest {
  nombre: string;
  cuerpo: CuerpoFormato;
}

/** Datos para crear una plantilla de consentimiento */
export interface CreatePlantillaConsentimientoRequest {
  nombre: string;
  cuerpo: CuerpoFormato;
  requiereFirmaPaciente: boolean;
  requiereFirmaProfesional: boolean;
  // la asignación a servicios se configura del lado del servicio, acá siempre va vacío
  servicios: [];
}

/** Datos para crear una plantilla de recomendación */
export interface CreatePlantillaRecomendacionRequest {
  nombre: string;
  cuerpo: CuerpoFormato;
  // la asignación a servicios se configura del lado del servicio, acá siempre va vacío
  servicios: [];
}

/** Datos para actualizar una plantilla */
export interface UpdatePlantillaRequest {
  nombre: string;
  cuerpo?: CuerpoFormato;
  requiereFirmaPaciente: boolean;
  requiereFirmaProfesional: boolean;
}
