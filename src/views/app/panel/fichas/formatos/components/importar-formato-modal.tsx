"use client";

import { useState } from "react";

import { Alerta, Modal } from "@/components/shared";
import { Button } from "@/components/ui";
import { useImportarFormatoMutation } from "@/hooks/api";
import { handleApiError } from "@/lib/api";
import { TipoDocumentoClinico } from "@/models/responses";
import { TIPOS_DOCUMENTO } from "@/views/app/panel/fichas/formatos/nuevo/hooks/use-constructor-formato";

export function ImportarFormatoModal() {
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<TipoDocumentoClinico>("Consentimiento");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [requiereFirmaProfesional, setRequiereFirmaProfesional] =
    useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const importarMutation = useImportarFormatoMutation();

  function cerrar() {
    setAbierto(false);
    setNombre("");
    setTipo("Consentimiento");
    setArchivo(null);
    setRequiereFirmaProfesional(false);
    setErrorMsg(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !archivo) return;

    setErrorMsg(null);
    try {
      await importarMutation.mutateAsync({
        archivo,
        nombre: nombre.trim(),
        tipo,
        requiereFirmaProfesional,
      });

      cerrar();
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setAbierto(true)}>
        Importar documento
      </Button>

      <Modal abierto={abierto} onCerrar={cerrar} ancho="sm:max-w-lg">
        <div className="bg-white text-slate-900 font-sans shadow-none rounded-none">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm px-6 py-4">
            <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900">
              Importar documento
            </h3>
            <button
              type="button"
              onClick={cerrar}
              aria-label="Cerrar modal"
              className="p-1 font-sans text-sm text-slate-400 hover:text-slate-900 rounded-none focus:outline-none"
            >
              ✕
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-4 font-sans text-xs"
          >
            <p className="text-slate-500">
              Carga un PDF y quedará como cuerpo fijo del formato, sin
              constructor de campos. Solo se aceptan archivos PDF por ahora.
            </p>

            {errorMsg && <Alerta tono="error">{errorMsg}</Alerta>}

            <div>
              <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Nombre del formato
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Tipo de documento
              </label>
              <select
                value={tipo}
                onChange={e => setTipo(e.target.value as TipoDocumentoClinico)}
                className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
              >
                {TIPOS_DOCUMENTO.map(t => (
                  <option key={t.valor} value={t.valor}>
                    {t.etiqueta}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Archivo PDF
              </label>
              <input
                type="file"
                required
                accept="application/pdf"
                onChange={e => setArchivo(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-slate-700"
              />
            </div>

            <label className="flex items-center gap-2 text-slate-700">
              <input
                type="checkbox"
                checked={requiereFirmaProfesional}
                onChange={e => setRequiereFirmaProfesional(e.target.checked)}
                className="h-4 w-4"
              />
              Requiere firma del profesional además de la del paciente
            </label>

            <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
              <button
                type="button"
                onClick={cerrar}
                className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 rounded-none shadow-none"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={
                  importarMutation.isPending || !nombre.trim() || !archivo
                }
                className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white rounded-none shadow-none disabled:opacity-50"
              >
                {importarMutation.isPending ? "Subiendo..." : "Importar"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
