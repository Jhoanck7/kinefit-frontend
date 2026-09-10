import { CuerpoFormato } from "../responses/plantilla";

/**
 * La asignación a servicios ya se configura aparte, del lado del servicio
 * (documentos-servicio-selector.tsx). Al crear la plantilla siempre se manda
 * vacío; el backend lo acepta sin problema.
 */
export interface CreatePlantillaFichaRequest {
  nombre: string;
  cuerpo: CuerpoFormato;
}

export interface CreatePlantillaConsentimientoRequest {
  nombre: string;
  cuerpo: CuerpoFormato;
  requiereFirmaPaciente: boolean;
  requiereFirmaProfesional: boolean;
  servicios: [];
}

export interface CreatePlantillaRecomendacionRequest {
  nombre: string;
  cuerpo: CuerpoFormato;
  servicios: [];
}

export interface UpdatePlantillaRequest {
  nombre: string;
  cuerpo?: CuerpoFormato;
  requiereFirmaPaciente: boolean;
  requiereFirmaProfesional: boolean;
}
