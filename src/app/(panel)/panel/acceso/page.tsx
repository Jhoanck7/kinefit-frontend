"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

import { Button } from "@/components/panel/primitives/Button";
import { TextField } from "@/components/panel/primitives/CamposFormulario";
import { authService } from "@/lib/services/auth.service";
import { usePanelSessionStore } from "@/lib/store/usePanelSessionStore";

export default function AccesoPage() {
  const router = useRouter();
  const entrar = usePanelSessionStore(s => s.entrar);
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // La redirección si ya hay sesión la maneja middleware.ts en el servidor.

  async function alEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErrorMsg(null);
    setCargando(true);

    const formData = new FormData(evento.currentTarget);
    const correo = (formData.get("correo") as string)?.trim();
    const contrasena = (formData.get("contrasena") as string)?.trim();

    try {
      const res = await authService.loginPersonal({
        email: correo,
        password: contrasena,
      });

      if (res?.usuario && res?.token) {
        const sesion = await signIn("credentials", {
          email: res.usuario.email,
          token: res.token,
          redirect: false,
        });

        if (sesion?.error) {
          setErrorMsg(
            "No se pudo establecer la sesión del panel. Intenta nuevamente."
          );
          return;
        }

        entrar({
          nombre: res.usuario.nombre,
          rol:
            res.usuario.rol === "Administrador"
              ? "Administrador"
              : "Especialista",
          cargo:
            res.usuario.rol === "Administrador"
              ? "Administrador General"
              : "Especialista",
          especialistaId: res.usuario.especialistaId
            ? String(res.usuario.especialistaId)
            : undefined,
        });
        router.push("/panel/agenda");
        return;
      } else {
        setErrorMsg(
          "Credenciales incorrectas o usuario no encontrado en la base de datos."
        );
      }
    } catch (err: unknown) {
      console.error("Error al iniciar sesión en Backend:", err);
      setErrorMsg(
        "No se pudo iniciar sesión. Verifica el correo y contraseña (ej: admin@kinefit.cl / KineFit2026!)."
      );
    } finally {
      setCargando(false);
    }
  }

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
          <div className="mb-4 border border-red-300 bg-red-50 p-3 text-xs font-semibold text-red-800 rounded-none font-sans">
            {errorMsg}
          </div>
        )}

        <form onSubmit={alEnviar} className="space-y-4 font-sans">
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
          <Button
            type="submit"
            variante="primario"
            className="w-full mt-2"
            disabled={cargando}
          >
            {cargando ? "INICIANDO SESIÓN..." : "INGRESAR AL PANEL"}
          </Button>
        </form>
      </div>
    </div>
  );
}
