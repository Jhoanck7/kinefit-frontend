"use client";

import { useState } from "react";

import {
  useFirmarProfesionalMutation,
  useGetDocumentosPorCita,
  useReemitirTokenMutation,
  useSubirEscaneoMutation,
} from "@/hooks/api";

export function DocumentosTab({ citaId }: { citaId: number }) {
  const { data: documentos, isLoading } = useGetDocumentosPorCita(citaId);
  const firmarProfesional = useFirmarProfesionalMutation();
  const subirEscaneo = useSubirEscaneoMutation();
  const reemitirToken = useReemitirTokenMutation();
  const [enlaceCopiadoId, setEnlaceCopiadoId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <p className="p-6 font-sans text-xs text-slate-500">
        Cargando documentos…
      </p>
    );
  }

  if (!documentos || documentos.length === 0) {
    return (
      <p className="p-6 font-sans text-xs text-slate-500">
        Este servicio no exige documentos.
      </p>
    );
  }

  const handleReemitir = async (id: number) => {
    const resultado = await reemitirToken.mutateAsync(id);
    await navigator.clipboard.writeText(resultado.url);
    setEnlaceCopiadoId(id);
    setTimeout(() => setEnlaceCopiadoId(null), 2000);
  };

  const handleSubirEscaneo = (
    id: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const archivo = e.target.files?.[0];
    if (archivo) subirEscaneo.mutate({ id, archivo });
    e.target.value = "";
  };

  return (
    <div className="divide-y divide-slate-200 p-6">
      {documentos.map(doc => (
        <div
          key={doc.id}
          className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-sans text-sm font-semibold text-slate-900">
              {doc.nombreFormato}
            </p>
            <p className="font-sans text-xs text-slate-500">
              {doc.estado}
              {doc.reutilizado ? " · cubierto por una firma anterior" : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {doc.estado === "Pendiente" && !doc.firmaPacienteLista && (
              <>
                <button
                  type="button"
                  onClick={() => handleReemitir(doc.id)}
                  className="font-sans text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900"
                >
                  {enlaceCopiadoId === doc.id
                    ? "Enlace copiado"
                    : "Copiar enlace"}
                </button>
                <label className="cursor-pointer font-sans text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900">
                  Cargar escaneo
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={e => handleSubirEscaneo(doc.id, e)}
                  />
                </label>
              </>
            )}
            {doc.requiereFirmaProfesional &&
              doc.firmaPacienteLista &&
              !doc.firmaProfesionalLista && (
                <button
                  type="button"
                  onClick={() => firmarProfesional.mutate(doc.id)}
                  className="font-sans text-xs font-bold uppercase tracking-wider text-[#003366] hover:underline"
                >
                  Estampar mi firma
                </button>
              )}
          </div>
        </div>
      ))}
    </div>
  );
}
