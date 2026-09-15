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
        <p className="font-sans text-xs text-slate-500">
          Datos de tu cuenta en el panel
        </p>
      </div>

      <Card className="border border-border p-6">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="font-sans text-label font-medium text-muted-foreground">
              Nombre
            </dt>
            <dd className="mt-0.5 font-sans text-value text-foreground">
              {perfil.nombre}
            </dd>
          </div>
          <div>
            <dt className="font-sans text-label font-medium text-muted-foreground">
              Correo
            </dt>
            <dd className="mt-0.5 font-sans text-value text-foreground">
              {perfil.email}
            </dd>
          </div>
          <div>
            <dt className="font-sans text-label font-medium text-muted-foreground">
              Rol
            </dt>
            <dd className="mt-0.5 font-sans text-value text-foreground">
              {perfil.rol}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
