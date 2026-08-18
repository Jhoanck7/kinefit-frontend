export interface KineFitJwtClaims {
  sub: string;
  tipo_sujeto: string;
  usuario_id: string;
  rol: string;
  especialista_id?: string;
  emitido_en: string;
  exp: number;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": string;
}
