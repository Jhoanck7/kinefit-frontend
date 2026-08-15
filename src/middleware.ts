import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { isTokenExpired } from "@/lib/auth";

const RUTA_ACCESO = "/panel/acceso";

// Coincide con [Authorize(Policy = PolicyNames.SoloAdministrador)] del backend
// para las secciones del panel que ya existen como página.
const RUTAS_SOLO_ADMINISTRADOR = [
  "/panel/especialistas",
  "/panel/landing",
  "/panel/ventas",
  "/panel/reportes",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
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
