"use client";

import Image from "next/image";

import { Alerta, TextField } from "@/components/shared";
import { Button } from "@/components/ui";

import { useAcceso } from "./hooks";

export default function AccesoView() {
  const { cargando, errorMsg, actions } = useAcceso();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 font-sans">
      <div className="w-full max-w-sm border border-slate-200 bg-white p-8 rounded-none shadow-none font-sans">
        <div className="flex flex-col items-center gap-3 mb-6">
          <Image
            src="/Kinefit Negro ver.png"
            alt="Kinefit Logo"
            width={280}
            height={100}
            className="h-16 w-full object-contain"
            priority
          />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 font-sans">
            Panel Administrativo
          </p>
        </div>

        {errorMsg && (
          <Alerta tono="error" className="mb-4">
            {errorMsg}
          </Alerta>
        )}

        <form onSubmit={actions.alEnviar} className="space-y-4 font-sans">
          <TextField
            etiqueta="Correo electrónico"
            type="email"
            name="correo"
            placeholder="admin@kinefit.cl"
            required
          />
          <TextField
            etiqueta="Contraseña"
            type="password"
            name="contrasena"
            placeholder="••••••••"
            required
          />
          <Button type="submit" className="w-full mt-2" disabled={cargando}>
            {cargando ? "INICIANDO SESIÓN..." : "INGRESAR AL PANEL"}
          </Button>
        </form>
      </div>
    </div>
  );
}
