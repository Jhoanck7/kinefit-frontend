"use client";

import { useRef, useState } from "react";

import { Button, Card } from "@/components/ui";
import { useGetMiPerfil, useGuardarFirmaMutation } from "@/hooks/api";
import SignaturePad, {
  SignaturePadHandle,
} from "@/views/app/(documentos)/documentos/components/signature-pad";

export default function PerfilView() {
  const { data: perfil, isLoading } = useGetMiPerfil();
  const guardarFirma = useGuardarFirmaMutation();
  const firmaRef = useRef<SignaturePadHandle>(null);
  const [firmaVacia, setFirmaVacia] = useState(true);

  const handleGuardarFirma = async () => {
    const base64 = firmaRef.current?.exportarBase64();
    if (!base64) return;
    await guardarFirma.mutateAsync({ firmaBase64: base64 });
    firmaRef.current?.limpiar();
  };

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

      <Card className="border border-border p-6">
        <h2 className="mb-1 font-sans text-sm font-bold text-slate-900">
          Firma
        </h2>
        <p className="mb-4 font-sans text-xs text-slate-500">
          {perfil.tieneFirma
            ? "Ya tenés una firma guardada. Dibujá una nueva para reemplazarla."
            : "Dibujá tu firma una vez: se va a estampar en cada documento que firmes desde el panel."}
        </p>
        <SignaturePad ref={firmaRef} onCambiar={setFirmaVacia} />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => firmaRef.current?.limpiar()}
            className="font-sans text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900"
          >
            Borrar
          </button>
          <Button
            disabled={firmaVacia || guardarFirma.isPending}
            onClick={handleGuardarFirma}
          >
            {guardarFirma.isPending ? "Guardando…" : "Guardar firma"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
