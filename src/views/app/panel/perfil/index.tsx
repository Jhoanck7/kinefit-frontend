"use client";

import { Card } from "@/components/ui";
import { useGetMiPerfil } from "@/hooks/api";

export default function PerfilView() {
  const { data: perfil, isLoading } = useGetMiPerfil();
  if (isLoading || !perfil) {
    return <p className="p-6 font-sans text-xs text-slate-500">Cargando…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="font-sans text-lg font-bold text-slate-900">
          Mi perfil
        </h1>
        <p className="font-sans text-xs text-slate-500">
          Datos de tu cuenta en el panel
        </p>
      </div>

      <Card className="border border-border p-6">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="font-sans text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Nombre
            </dt>
            <dd className="mt-0.5 font-sans text-sm text-slate-900">
              {perfil.nombre}
            </dd>
          </div>
          <div>
            <dt className="font-sans text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Correo
            </dt>
            <dd className="mt-0.5 font-sans text-sm text-slate-900">
              {perfil.email}
            </dd>
          </div>
          <div>
            <dt className="font-sans text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Rol
            </dt>
            <dd className="mt-0.5 font-sans text-sm text-slate-900">
              {perfil.rol}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
