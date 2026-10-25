"use client";

import { useState } from "react";

import {
  Alerta,
  Modal,
  ModalCloseButton,
  TextAreaField,
  TextField,
} from "@/components/shared";
import { Button } from "@/components/ui";
import { useGetContenido, useUpdateContenidoMutation } from "@/hooks/api";
import { handleApiError } from "@/lib/api";
import {
  leerSeccionesDocumentoLegal,
  SeccionDocumentoLegal,
} from "@/lib/documento-legal";

const DOCUMENTOS = [
  { clave: "terminos", titulo: "Términos y Condiciones" },
  { clave: "privacidad", titulo: "Política de Privacidad" },
];

type SeccionesPorClave = Record<string, SeccionDocumentoLegal[]>;

interface DocumentosLegalesModalProps {
  abierto: boolean;
  onCerrar: () => void;
}

/** Modal para editar por secciones los Términos y Condiciones y la Política de Privacidad del sitio público */
export function DocumentosLegalesModal({
  abierto,
  onCerrar,
}: DocumentosLegalesModalProps) {
  const { data: contenido, isLoading } = useGetContenido(abierto);

  const iniciales: SeccionesPorClave = Object.fromEntries(
    DOCUMENTOS.map(d => [
      d.clave,
      leerSeccionesDocumentoLegal(
        contenido?.find(c => c.clave === d.clave)?.valor
      ),
    ])
  );

  return (
    <Modal abierto={abierto} onCerrar={onCerrar}>
      <div className="bg-white text-foreground font-sans shadow-none rounded-overlay">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm px-6 py-4">
          <h2 className="font-sans text-section-title font-bold text-foreground">
            Configuración: Documentos Legales
          </h2>
          <ModalCloseButton onClick={onCerrar} />
        </div>

        {isLoading || !contenido ? (
          <p className="text-sm text-slate-500 py-8 text-center">
            Cargando documentos…
          </p>
        ) : (
          <FormularioDocumentosLegales
            iniciales={iniciales}
            onCerrar={onCerrar}
          />
        )}
      </div>
    </Modal>
  );
}

function FormularioDocumentosLegales({
  iniciales,
  onCerrar,
}: {
  iniciales: SeccionesPorClave;
  onCerrar: () => void;
}) {
  const [secciones, setSecciones] = useState<SeccionesPorClave>(iniciales);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const actualizarMutation = useUpdateContenidoMutation();

  const cambios = DOCUMENTOS.filter(
    d =>
      JSON.stringify(secciones[d.clave]) !== JSON.stringify(iniciales[d.clave])
  );
  const incompletas = DOCUMENTOS.some(d =>
    secciones[d.clave].some(s => !s.titulo.trim() || !s.texto.trim())
  );

  function actualizar(
    clave: string,
    cambio: (lista: SeccionDocumentoLegal[]) => SeccionDocumentoLegal[]
  ) {
    setSecciones(prev => ({ ...prev, [clave]: cambio(prev[clave]) }));
  }

  function handleAgregar(clave: string) {
    actualizar(clave, lista => [...lista, { titulo: "", texto: "" }]);
  }

  function handleCambiar(
    clave: string,
    index: number,
    campo: keyof SeccionDocumentoLegal,
    valor: string
  ) {
    actualizar(clave, lista =>
      lista.map((s, i) => (i === index ? { ...s, [campo]: valor } : s))
    );
  }

  function handleMover(clave: string, index: number, destino: number) {
    actualizar(clave, lista => {
      if (destino < 0 || destino >= lista.length) return lista;
      const copia = [...lista];
      [copia[index], copia[destino]] = [copia[destino], copia[index]];
      return copia;
    });
  }

  function handleEliminar(clave: string, index: number) {
    actualizar(clave, lista => lista.filter((_, i) => i !== index));
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    try {
      for (const documento of cambios) {
        await actualizarMutation.mutateAsync({
          clave: documento.clave,
          valor: JSON.stringify(
            secciones[documento.clave].map(s => ({
              titulo: s.titulo.trim(),
              texto: s.texto.trim(),
            }))
          ),
        });
      }
      fetch("/api/revalidate", { method: "POST" }).catch(() => {});
      onCerrar();
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  }

  return (
    <form
      onSubmit={handleGuardar}
      className="max-h-[75vh] overflow-y-auto p-6 space-y-6"
    >
      {DOCUMENTOS.map((documento, idxDocumento) => (
        <div
          key={documento.clave}
          className={`space-y-4 ${idxDocumento > 0 ? "pt-6 border-t border-slate-200" : ""}`}
        >
          <div className="flex justify-between items-center">
            <h3 className="font-sans text-label font-bold text-foreground">
              {documento.titulo}
            </h3>
            <Button
              type="button"
              variant="outline"
              className="rounded-overlay"
              onClick={() => handleAgregar(documento.clave)}
            >
              Agregar Sección
            </Button>
          </div>

          {secciones[documento.clave].map((seccion, idx) => (
            <div
              key={idx}
              className="rounded-none border border-slate-200 bg-white p-4 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-800">
                  Sección #{idx + 1}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMover(documento.clave, idx, idx - 1)}
                    className="text-xs text-primary font-bold hover:underline disabled:opacity-30 disabled:no-underline"
                  >
                    Subir
                  </button>
                  <button
                    type="button"
                    disabled={idx === secciones[documento.clave].length - 1}
                    onClick={() => handleMover(documento.clave, idx, idx + 1)}
                    className="text-xs text-primary font-bold hover:underline disabled:opacity-30 disabled:no-underline"
                  >
                    Bajar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEliminar(documento.clave, idx)}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              <TextField
                etiqueta="Título de la Sección"
                value={seccion.titulo}
                onChange={e =>
                  handleCambiar(documento.clave, idx, "titulo", e.target.value)
                }
                obligatorio
              />
              <TextAreaField
                etiqueta="Texto"
                value={seccion.texto}
                onChange={e =>
                  handleCambiar(documento.clave, idx, "texto", e.target.value)
                }
                rows={5}
                obligatorio
              />
            </div>
          ))}

          {secciones[documento.clave].length === 0 && (
            <p className="text-xs text-slate-400 italic text-center py-4 border border-dashed border-slate-200">
              No hay secciones configuradas. Haz clic en &ldquo;Agregar
              Sección&rdquo;.
            </p>
          )}
        </div>
      ))}

      {errorMsg && <Alerta tono="error">{errorMsg}</Alerta>}

      <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          className="rounded-overlay"
          onClick={onCerrar}
        >
          Cerrar sin Guardar
        </Button>
        <Button
          type="submit"
          className="rounded-overlay"
          disabled={
            actualizarMutation.isPending || cambios.length === 0 || incompletas
          }
        >
          {actualizarMutation.isPending ? "Guardando…" : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
}
