import { jwtDecode } from "jwt-decode";

import { KineFitJwtClaims } from "@/models/generics";

/** Decodifica el JWT del panel y valida que no esté expirado ni le falten claims requeridas */
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

/** Indica si la sesión ya superó su fecha de expiración */
export function isSessionExpired(
  session: { customExp?: number } | null | undefined
): boolean {
  if (!session?.customExp) return true;
  return Math.floor(Date.now() / 1000) >= session.customExp;
}

/** Indica si el token ya superó su fecha de expiración */
export function isTokenExpired(
  token: { customExp?: number } | null | undefined
): boolean {
  if (!token?.customExp) return true;
  return Math.floor(Date.now() / 1000) >= token.customExp;
}

/** Indica si el usuario en sesión puede gestionar el recurso de un especialista dado, por ser administrador o el propio especialista */
export function puedeGestionarRecursoDeEspecialista(
  session:
    { user: { rol: string; especialistaId?: string } } | null | undefined,
  especialistaId: number
): boolean {
  return (
    session?.user.rol === "Administrador" ||
    session?.user.especialistaId === String(especialistaId)
  );
}
