import { jwtDecode } from "jwt-decode";

interface KineFitJwtClaims {
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

export function extractUserFromJwt(token: string) {
  const decoded = jwtDecode<KineFitJwtClaims>(token);

  if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token JWT expirado");
  }

  const user = {
    id: decoded.usuario_id,
    email:
      decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
      ],
    nombre:
      decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
    rol: decoded.rol,
    especialistaId: decoded.especialista_id,
    exp: decoded.exp,
  };

  if (!user.id || !user.email || !user.rol) {
    throw new Error("Claims requeridas faltantes en el JWT del panel");
  }

  return user;
}

export function isSessionExpired(
  session: { customExp?: number } | null | undefined
): boolean {
  if (!session?.customExp) return true;
  return Math.floor(Date.now() / 1000) >= session.customExp;
}

export function isTokenExpired(
  token: { customExp?: number } | null | undefined
): boolean {
  if (!token?.customExp) return true;
  return Math.floor(Date.now() / 1000) >= token.customExp;
}
