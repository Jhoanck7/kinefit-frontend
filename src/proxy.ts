import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { isTokenExpired } from "@/lib/auth";

const RUTA_ACCESO = "/panel/acceso";
const RUTA_CAMBIAR_PASSWORD = "/panel/cambiar-password";

// Mismas rutas que exige el backend con Policy SoloAdministrador
const RUTAS_SOLO_ADMINISTRADOR = [
  "/panel/especialistas",
  "/panel/landing",
  "/panel/reportes",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });
  const autenticado = Boolean(token) && !isTokenExpired(token);

  if (pathname === RUTA_ACCESO) {
    if (autenticado) {
      return NextResponse.redirect(new URL("/panel/agenda", request.url));
    }
    return NextResponse.next();
  }

  if (!autenticado) {
    return NextResponse.redirect(new URL(RUTA_ACCESO, request.url));
  }

  if (token?.debeCambiarPassword) {
    if (pathname !== RUTA_CAMBIAR_PASSWORD) {
      return NextResponse.redirect(new URL(RUTA_CAMBIAR_PASSWORD, request.url));
    }
    return NextResponse.next();
  }

  if (pathname === RUTA_CAMBIAR_PASSWORD) {
    return NextResponse.redirect(new URL("/panel/agenda", request.url));
  }

  const requiereAdministrador = RUTAS_SOLO_ADMINISTRADOR.some(ruta =>
    pathname.startsWith(ruta)
  );
  if (requiereAdministrador && token?.rol !== "Administrador") {
    return NextResponse.redirect(new URL("/panel/agenda", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*"],
};
