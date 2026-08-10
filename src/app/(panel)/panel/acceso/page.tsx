"use client";

import { FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { usePanelSessionStore } from "@/lib/store/usePanelSessionStore";
import { TextField } from "@/components/panel/primitives/CamposFormulario";
import { Button } from "@/components/panel/primitives/Button";

/**
 * Acceso del personal (#1 / E.7). Sin autenticación real (DD-3): cualquier
 * envío entra y fija a Franchesca Astudillo como usuaria de la sesión.
 * No hay guardia de rutas: quien escriba una URL profunda del panel entra
 * igual, con el usuario por defecto.
 */
export default function AccesoPage() {
  const router = useRouter();
  const entrar = usePanelSessionStore((s) => s.entrar);

  function alEnviar(evento: FormEvent) {
    evento.preventDefault();
    entrar();
    router.push("/panel/agenda");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-panel-fondo px-4">
      <div className="w-full max-w-sm rounded-2xl border border-brand-border bg-white p-8">
        <div className="flex flex-col items-center gap-3 mb-8">
          <Image
            src="/Kinefit Negro ver.png"
            alt="Kinefit Logo"
            width={280}
            height={100}
            className="h-20 w-full object-contain"
            priority
          />
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
            Panel Administrativo
          </p>
        </div>

        <form onSubmit={alEnviar} className="space-y-4">
          <TextField etiqueta="Correo electrónico" type="email" name="correo" placeholder="nombre@kinefitchile.com" required />
          <TextField etiqueta="Contraseña" type="password" name="contrasena" placeholder="••••••••" required />
          <Button type="submit" variante="primario" className="w-full mt-2">
            Ingresar
          </Button>
        </form>
      </div>
    </div>
  );
}
