"use client";

import { useState } from "react";

import { Modal } from "@/components/shared";
import { Badge } from "@/components/ui";
import {
  useAbrirArchivoDocumentoMutation,
  useActualizarFichaMutation,
  useCerrarFichaMutation,
  useDescargarAdjuntoMutation,
  useDescargarArchivoDocumentoMutation,
  useEliminarAdjuntoMutation,
  useGetAuditoriaDocumento,
  useGetDocumentoDetalle,
  useGetPlantillaById,
  useSubirAdjuntoMutation,
} from "@/hooks/api";
import { handleApiError } from "@/lib/api";
import { formatearFechaCorta, formatearFechaHora } from "@/lib/formato";
import { CuerpoFormato } from "@/models/responses";

/** El nombre del campo lo da la plantilla; si ya no existe ahí, se muestra la clave legible. */
function etiquetaDeCampo(campoId: string, cuerpo?: CuerpoFormato): string {
  const campo = cuerpo?.secciones
    .flatMap(seccion => seccion.campos)
    .find(c => c.id === campoId);
  if (campo?.nombre.trim()) return campo.nombre.trim();
  return campoId.replace(/_/g, " ").replace(/^campo-\d+/i, "Campo");
}

const NOMBRE_TIPO: Record<string, string> = {
  FichaClinica: "Ficha clínica",
  Recomendacion: "Recomendación",
  Consentimiento: "Consentimiento informado",
};

interface DocumentoDetalleModalProps {
  documentoId: string | null;
  hoy: Date;
  onCerrar: () => void;
}

export function DocumentoDetalleModal({
  documentoId,
  onCerrar,
}: DocumentoDetalleModalProps) {
  const [editando, setEditando] = useState(false);
  const [contenidoEditado, setContenidoEditado] = useState<
    Record<string, string>
  >({});
  const [mostrarAuditoria, setMostrarAuditoria] = useState(false);
  const [confirmarCierre, setConfirmarCierre] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: doc = null } = useGetDocumentoDetalle(
    Number(documentoId),
    Boolean(documentoId)
  );
  const { data: plantilla } = useGetPlantillaById(
    doc?.plantillaId ?? 0,
    Boolean(doc?.plantillaId)
  );
  const { data: auditoria } = useGetAuditoriaDocumento(
    Number(documentoId),
    1,
    20,
    Boolean(documentoId) && mostrarAuditoria
  );

  const subirAdjuntoMutation = useSubirAdjuntoMutation();
  const eliminarAdjuntoMutation = useEliminarAdjuntoMutation();
  const descargarAdjuntoMutation = useDescargarAdjuntoMutation();
  const descargarArchivoMutation = useDescargarArchivoDocumentoMutation();
  const abrirArchivoMutation = useAbrirArchivoDocumentoMutation();
  const actualizarFichaMutation = useActualizarFichaMutation();
  const cerrarFichaMutation = useCerrarFichaMutation();

  if (!doc) {
    return (
      <Modal abierto={Boolean(documentoId)} onCerrar={onCerrar}>
        <div className="p-10 text-center font-sans text-xs text-slate-500">
          Cargando documento…
        </div>
      </Modal>
    );
  }

  const esFicha = doc.tipo === "FichaClinica";
  const esConsentimiento = doc.tipo === "Consentimiento";
  const puedeEditar = esFicha && doc.estado === "Borrador";

  function handleIniciarEdicion() {
    setContenidoEditado(doc!.contenido ?? {});
    setEditando(true);
  }

  async function handleGuardarEdicion() {
    setErrorMsg(null);
    try {
      await actualizarFichaMutation.mutateAsync({
        id: doc!.id,
        data: { contenido: contenidoEditado },
      });
      setEditando(false);
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  }

  async function handleCerrarFicha() {
    setErrorMsg(null);
    try {
      await cerrarFichaMutation.mutateAsync(doc!.id);
      setConfirmarCierre(false);
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  }

  function handleSubirAdjunto(e: React.ChangeEvent<HTMLInputElement>) {
    if (!doc || !e.target.files || e.target.files.length === 0) return;
    const archivo = e.target.files[0];
    e.target.value = "";
    subirAdjuntoMutation.mutate({ documentoId: doc.id, archivo });
  }

  async function handleVerAdjunto(adjuntoId: number) {
    const blob = await descargarAdjuntoMutation.mutateAsync(adjuntoId);
    window.open(URL.createObjectURL(blob), "_blank");
  }

  async function handleDescargarAdjunto(adjuntoId: number, nombre: string) {
    const blob = await descargarAdjuntoMutation.mutateAsync(adjuntoId);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nombre;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleAbrirArchivo() {
    setErrorMsg(null);
    try {
      const blob = await abrirArchivoMutation.mutateAsync(doc!.id);
      window.open(URL.createObjectURL(blob), "_blank");
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  }

  async function handleDescargarArchivo() {
    const blob = await descargarArchivoMutation.mutateAsync(doc!.id);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${doc!.nombre}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleImprimir() {
    setErrorMsg(null);
    if (!doc!.tieneArchivo) {
      window.print();
      return;
    }
    try {
      const blob = await descargarArchivoMutation.mutateAsync(doc!.id);
      const url = URL.createObjectURL(blob);
      const ventana = window.open(url, "_blank");
      ventana?.addEventListener("load", () => ventana.print());
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  }

  const contenidoAMostrar = editando ? contenidoEditado : doc.contenido;

  return (
    <Modal abierto={Boolean(documentoId)} onCerrar={onCerrar}>
      <div className="bg-white text-slate-900 font-sans shadow-none rounded-none">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900">
                {doc.nombre}
              </h2>
              <Badge className="rounded-none border-slate-200 bg-slate-50 text-[11px] font-medium text-slate-700">
                {NOMBRE_TIPO[doc.tipo] ?? doc.tipo}
              </Badge>
              <Badge className="rounded-none border-slate-200 bg-slate-50 text-[11px] font-medium text-slate-700">
                {doc.estado}
              </Badge>
            </div>
            <p className="font-sans text-xs text-slate-500 mt-0.5">
              {doc.pacienteNombre} · RUT{" "}
              <span className="text-slate-700 font-medium">
                {doc.pacienteRut || "—"}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar modal"
            className="p-1 font-sans text-sm text-slate-400 hover:text-slate-900 rounded-none focus:outline-none"
          >
            ✕
          </button>
        </div>

        {doc.motivoCierre && (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-xs text-amber-800">
            Cerrado: {doc.motivoCierre}
          </div>
        )}

        {errorMsg && (
          <div className="border-b border-rose-200 bg-rose-50 px-6 py-2 text-xs text-rose-800">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          <div className="md:col-span-2 p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {doc.tieneArchivo ? (
              <div>
                <h3 className="border-b border-slate-200 pb-1 font-sans text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-3">
                  ARCHIVO
                </h3>
                <button
                  type="button"
                  onClick={handleAbrirArchivo}
                  className="font-sans text-xs font-bold uppercase tracking-wider text-panel-sidebar underline underline-offset-2"
                >
                  Ver PDF
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="border-b border-slate-200 pb-1 font-sans text-[10px] font-medium uppercase tracking-widest text-slate-400">
                    CONTENIDO REGISTRADO
                  </h3>
                  {puedeEditar && !editando && (
                    <button
                      type="button"
                      onClick={handleIniciarEdicion}
                      className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-700 hover:text-slate-950"
                    >
                      Editar
                    </button>
                  )}
                </div>

                {!contenidoAMostrar ||
                Object.keys(contenidoAMostrar).length === 0 ? (
                  <p className="font-sans text-xs text-slate-400 italic py-2">
                    Sin respuestas escritas en este documento.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(contenidoAMostrar).map(([clave, valor]) => (
                      <div key={clave}>
                        <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                          {etiquetaDeCampo(clave, plantilla?.cuerpo)}
                        </span>
                        {editando ? (
                          <textarea
                            value={contenidoEditado[clave] ?? ""}
                            onChange={e =>
                              setContenidoEditado(prev => ({
                                ...prev,
                                [clave]: e.target.value,
                              }))
                            }
                            className="mt-1 w-full rounded-none border border-slate-200 px-2 py-1.5 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                          />
                        ) : (
                          <p className="font-sans font-medium text-sm text-slate-900 mt-0.5 whitespace-pre-wrap">
                            {String(valor || "—")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {editando && (
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={handleGuardarEdicion}
                      disabled={actualizarFichaMutation.isPending}
                      className="font-sans text-xs font-bold uppercase tracking-wider px-3 py-1.5 bg-[#003366] hover:bg-[#002244] text-white"
                    >
                      {actualizarFichaMutation.isPending
                        ? "Guardando…"
                        : "Guardar borrador"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditando(false)}
                      className="font-sans text-xs font-bold uppercase tracking-wider px-3 py-1.5 border border-slate-200"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            )}

            {esConsentimiento && (
              <div className="pt-4 border-t border-slate-200">
                <h3 className="border-b border-slate-200 pb-1 font-sans text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-3">
                  FIRMA
                </h3>
                <div className="space-y-1 text-xs text-slate-700">
                  <p>
                    Paciente:{" "}
                    {doc.firmaPacienteLista
                      ? `firmado el ${formatearFechaHora(new Date(doc.firmadoPacienteEn!))}`
                      : "pendiente"}
                  </p>
                  {doc.requiereFirmaProfesional && (
                    <p>
                      Profesional:{" "}
                      {doc.firmaProfesionalLista
                        ? `firmado el ${formatearFechaHora(new Date(doc.firmadoProfesionalEn!))}`
                        : "pendiente"}
                    </p>
                  )}
                  {doc.cargadoEnPapelEn && (
                    <p>
                      Cargado en papel el{" "}
                      {formatearFechaHora(new Date(doc.cargadoEnPapelEn))}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Archivos Adjuntos de Respaldo
                </span>
                <label className="cursor-pointer font-sans text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-950">
                  {subirAdjuntoMutation.isPending ? "Subiendo..." : "Adjuntar"}
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleSubirAdjunto}
                    disabled={subirAdjuntoMutation.isPending}
                    className="hidden"
                  />
                </label>
              </div>

              {doc.adjuntos.length === 0 ? (
                <p className="font-sans text-xs text-slate-400 italic">
                  Sin archivos adjuntos.
                </p>
              ) : (
                <ul className="divide-y divide-slate-200 border border-slate-200 rounded-none bg-slate-50/50">
                  {doc.adjuntos.map(adjunto => (
                    <li
                      key={adjunto.id}
                      className="flex items-center justify-between p-2.5 text-xs font-sans font-medium text-slate-800"
                    >
                      <span>{adjunto.nombreOriginal}</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleVerAdjunto(adjunto.id)}
                          className="text-panel-sidebar underline underline-offset-2"
                        >
                          Ver
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDescargarAdjunto(
                              adjunto.id,
                              adjunto.nombreOriginal
                            )
                          }
                          className="text-panel-sidebar underline underline-offset-2"
                        >
                          Descargar
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            eliminarAdjuntoMutation.mutate(adjunto.id)
                          }
                          className="text-rose-600 underline underline-offset-2"
                        >
                          Eliminar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setMostrarAuditoria(prev => !prev)}
                className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-700 hover:text-slate-950"
              >
                {mostrarAuditoria
                  ? "Ocultar auditoría"
                  : "Ver la auditoría del documento"}
              </button>
              {mostrarAuditoria && (
                <ul className="mt-3 space-y-2">
                  {(auditoria?.items ?? []).length === 0 ? (
                    <p className="font-sans text-xs text-slate-400 italic">
                      Sin eventos registrados.
                    </p>
                  ) : (
                    auditoria!.items.map(evento => (
                      <li key={evento.id} className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-800">
                          {evento.accion}
                        </span>{" "}
                        · {evento.usuarioNombre ?? evento.tipoActor} ·{" "}
                        {formatearFechaHora(new Date(evento.createdAt))}
                        {evento.detalle ? ` — ${evento.detalle}` : ""}
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          </div>

          <div className="md:col-span-1 bg-slate-50/80 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="border-b border-slate-200 pb-1 font-sans text-[10px] font-medium uppercase tracking-widest text-slate-400">
                DATOS DE LA ATENCIÓN
              </h3>

              <div>
                <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Paciente
                </span>
                <p className="font-sans font-medium text-sm text-slate-900 mt-0.5">
                  {doc.pacienteNombre}
                </p>
              </div>

              <div>
                <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Servicio y atención
                </span>
                <p className="font-sans font-medium text-sm text-slate-900 mt-0.5">
                  {doc.servicio}
                </p>
                <p className="font-sans text-xs text-slate-500">
                  {formatearFechaCorta(
                    new Date(`${doc.fechaAtencion}T00:00:00`)
                  )}{" "}
                  · {doc.horaAtencion.slice(0, 5)}
                </p>
              </div>

              <div>
                <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Especialista
                </span>
                <p className="font-sans font-medium text-sm text-slate-900 mt-0.5">
                  {doc.especialistaNombre}
                </p>
              </div>

              {doc.plantillaNombre && (
                <div>
                  <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                    Plantilla
                  </span>
                  <p className="font-sans font-medium text-sm text-slate-900 mt-0.5">
                    {doc.plantillaNombre}
                  </p>
                </div>
              )}

              <div>
                <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Origen
                </span>
                <p className="font-sans font-medium text-sm text-slate-900 mt-0.5">
                  {doc.creadoPorTipoActor}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50/60 p-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleImprimir}
            className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 rounded-none shadow-none"
          >
            IMPRIMIR
          </button>
          {doc.tieneArchivo && (
            <button
              type="button"
              onClick={handleDescargarArchivo}
              className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 rounded-none shadow-none"
            >
              DESCARGAR
            </button>
          )}
          <button
            type="button"
            onClick={onCerrar}
            className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 rounded-none shadow-none"
          >
            CERRAR
          </button>
          {puedeEditar && !confirmarCierre && (
            <button
              type="button"
              onClick={() => setConfirmarCierre(true)}
              className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white rounded-none shadow-none"
            >
              CERRAR FICHA
            </button>
          )}
          {confirmarCierre && (
            <div className="flex items-center gap-2">
              <span className="font-sans text-xs text-slate-700">
                Una vez cerrada no se puede volver a editar. ¿Confirmás?
              </span>
              <button
                type="button"
                onClick={() => setConfirmarCierre(false)}
                className="font-sans text-xs font-bold uppercase tracking-wider px-3 py-2 border border-slate-200"
              >
                No
              </button>
              <button
                type="button"
                onClick={handleCerrarFicha}
                disabled={cerrarFichaMutation.isPending}
                className="font-sans text-xs font-bold uppercase tracking-wider px-3 py-2 bg-rose-700 hover:bg-rose-800 text-white"
              >
                {cerrarFichaMutation.isPending ? "Cerrando…" : "Sí, cerrar"}
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
