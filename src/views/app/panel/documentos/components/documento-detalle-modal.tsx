"use client";

import { useEffect, useRef, useState } from "react";

import { Alerta, Modal, ModalCloseButton } from "@/components/shared";
import { Badge } from "@/components/ui";
import {
  useAbrirArchivoDocumentoMutation,
  useActualizarFichaMutation,
  useCerrarFichaMutation,
  useDescargarAdjuntoMutation,
  useEliminarAdjuntoMutation,
  useGetAuditoriaDocumento,
  useGetDocumentoDetalle,
  useGetPlantillaById,
  useSubirAdjuntoMutation,
} from "@/hooks/api";
import { handleApiError } from "@/lib/api";
import { COLOR_ROL } from "@/lib/color-rol";
import {
  conValoresActualizados,
  cuerpoConNombresCongelados,
  etiquetaDeCampo,
  soloValores,
  valorDeRespuesta,
} from "@/lib/documento-contenido";
import { generarPdfDesdeConstructor } from "@/lib/documento-pdf";
import {
  CATALOGO_ESTADOS_DOCUMENTO,
  CodigoEstadoDocumento,
  documentoCerrado,
  etiquetaTipoDocumento,
} from "@/lib/estados-documento";
import { formatearFechaCorta, formatearFechaHora } from "@/lib/formato";

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
  const [visorInline, setVisorInline] = useState<{
    id: number;
    url: string;
  } | null>(null);
  const archivoDescargado = useRef<{ id: number; url: string } | null>(null);

  useEffect(() => {
    return () => {
      if (archivoDescargado.current) {
        URL.revokeObjectURL(archivoDescargado.current.url);
        archivoDescargado.current = null;
      }
    };
  }, []);

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

  const urlVisorInline = visorInline?.id === doc.id ? visorInline.url : null;
  const esFicha = doc.tipo === "FichaClinica";
  const esConsentimiento = doc.tipo === "Consentimiento";
  const puedeEditar = esFicha && doc.estado === "Borrador";
  const estaCerrado = documentoCerrado(doc.estado);
  const defEstado =
    CATALOGO_ESTADOS_DOCUMENTO[doc.estado as CodigoEstadoDocumento];
  const colorEstado = COLOR_ROL[defEstado?.colorRol ?? "gris"];

  function handleIniciarEdicion() {
    setContenidoEditado(soloValores(doc!.contenido ?? {}));
    setEditando(true);
  }

  async function handleGuardarEdicion() {
    setErrorMsg(null);
    try {
      await actualizarFichaMutation.mutateAsync({
        id: doc!.id,
        data: {
          contenido: conValoresActualizados(
            doc!.contenido ?? {},
            contenidoEditado,
            plantilla?.cuerpo
          ),
        },
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

  async function handleSubirAdjunto(e: React.ChangeEvent<HTMLInputElement>) {
    if (!doc || !e.target.files || e.target.files.length === 0) return;
    const archivo = e.target.files[0];
    e.target.value = "";
    setErrorMsg(null);
    try {
      await subirAdjuntoMutation.mutateAsync({ documentoId: doc.id, archivo });
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
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

  async function obtenerUrlArchivo(id: number) {
    const descargado = archivoDescargado.current;
    if (descargado?.id === id) return descargado.url;
    if (descargado) URL.revokeObjectURL(descargado.url);
    const blob = await abrirArchivoMutation.mutateAsync(id);
    const url = URL.createObjectURL(blob);
    archivoDescargado.current = { id, url };
    return url;
  }

  async function handleAbrirArchivo() {
    setErrorMsg(null);
    try {
      window.open(await obtenerUrlArchivo(doc!.id), "_blank");
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  }

  async function handleVerArchivoAqui() {
    if (urlVisorInline) {
      setVisorInline(null);
      return;
    }
    setErrorMsg(null);
    try {
      setVisorInline({ id: doc!.id, url: await obtenerUrlArchivo(doc!.id) });
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  }

  async function urlDelDocumento() {
    if (doc!.tieneArchivo) return obtenerUrlArchivo(doc!.id);
    const bytes = await generarPdfDesdeConstructor({
      nombre: doc!.nombre,
      servicio: doc!.servicio,
      fecha: formatearFechaCorta(new Date(`${doc!.fechaAtencion}T00:00:00`)),
      cuerpo: cuerpoConNombresCongelados(
        plantilla?.cuerpo,
        doc!.contenido ?? {}
      ),
      contenido: soloValores(doc!.contenido ?? {}),
    });
    const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
    return URL.createObjectURL(blob);
  }

  async function handleDescargarArchivo() {
    setErrorMsg(null);
    try {
      const link = document.createElement("a");
      link.href = await urlDelDocumento();
      link.download = `${doc!.nombre}.pdf`;
      link.click();
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  }

  async function handleImprimir() {
    setErrorMsg(null);
    try {
      const ventana = window.open(await urlDelDocumento(), "_blank");
      ventana?.addEventListener("load", () => ventana.print());
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  }

  const contenidoAMostrar = editando ? contenidoEditado : doc.contenido;

  return (
    <Modal abierto={Boolean(documentoId)} onCerrar={onCerrar}>
      <div className="bg-white text-foreground font-sans shadow-none rounded-overlay">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-sans text-section-title font-bold text-foreground">
                {doc.nombre}
              </h2>
              <Badge className="rounded-overlay border-0 bg-slate-700 text-[11px] font-medium text-white">
                {etiquetaTipoDocumento(doc.tipo)}
              </Badge>
              <Badge
                className="rounded-overlay border-0 text-[11px] font-medium text-white"
                style={{ backgroundColor: colorEstado.fondoSolido }}
              >
                {defEstado?.etiqueta ?? doc.estado}
              </Badge>
            </div>
            <p className="font-sans text-xs text-slate-500 mt-0.5">
              {doc.pacienteNombre}, RUT{" "}
              <span className="text-slate-700 font-medium">
                {doc.pacienteRut || "—"}
              </span>
            </p>
          </div>
          <ModalCloseButton onClick={onCerrar} />
        </div>

        {(esFicha || esConsentimiento) && (
          <Alerta tono="advertencia" className="mx-6 mt-4">
            Contenido privado. No visible para el paciente.
          </Alerta>
        )}

        {doc.motivoCierre && (
          <Alerta tono="advertencia" className="mx-6 mt-4">
            Cerrado: {doc.motivoCierre}
          </Alerta>
        )}

        {errorMsg && (
          <Alerta tono="error" className="mx-6 mt-4">
            {errorMsg}
          </Alerta>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          <div className="md:col-span-2 p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {doc.tieneArchivo ? (
              <div>
                <h3 className="border-b border-slate-200 pb-1 font-sans text-micro-header font-medium text-muted-foreground mb-3">
                  Archivo
                </h3>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handleAbrirArchivo}
                    disabled={abrirArchivoMutation.isPending}
                    className="font-sans text-xs font-bold text-panel-sidebar underline underline-offset-2 disabled:opacity-50"
                  >
                    {abrirArchivoMutation.isPending
                      ? "Abriendo…"
                      : "Abrir en Otra Pestaña"}
                  </button>
                  <button
                    type="button"
                    onClick={handleVerArchivoAqui}
                    disabled={abrirArchivoMutation.isPending}
                    className="font-sans text-xs font-bold text-panel-sidebar underline underline-offset-2 disabled:opacity-50"
                  >
                    {abrirArchivoMutation.isPending
                      ? "Abriendo…"
                      : urlVisorInline
                        ? "Ocultar Visor"
                        : "Ver Aquí"}
                  </button>
                </div>
                {urlVisorInline && (
                  <iframe
                    src={urlVisorInline}
                    title={doc.nombre}
                    className="mt-3 h-[70vh] w-full rounded-overlay border border-slate-200"
                  />
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="border-b border-slate-200 pb-1 font-sans text-micro-header font-medium text-muted-foreground">
                    Contenido Registrado
                  </h3>
                  {puedeEditar && !editando && (
                    <button
                      type="button"
                      onClick={handleIniciarEdicion}
                      className="font-sans text-[11px] font-bold text-muted-foreground hover:text-foreground"
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
                        <span className="font-sans text-label font-medium text-muted-foreground block">
                          {etiquetaDeCampo(
                            clave,
                            doc.contenido?.[clave],
                            plantilla?.cuerpo
                          )}
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
                            className="mt-1 w-full rounded-none border border-slate-200 px-2 py-1.5 text-sm text-foreground focus:border-slate-900 focus:outline-none"
                          />
                        ) : (
                          <p className="font-sans font-medium text-value text-foreground mt-0.5 whitespace-pre-wrap">
                            {valorDeRespuesta(valor) || "—"}
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
                      className="font-sans text-xs font-bold px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-overlay"
                    >
                      {actualizarFichaMutation.isPending
                        ? "Guardando…"
                        : "Guardar Borrador"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditando(false)}
                      className="font-sans text-xs font-bold px-3 py-1.5 border border-slate-200 rounded-overlay"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            )}

            {esConsentimiento && (
              <div className="pt-4 border-t border-slate-200">
                <h3 className="border-b border-slate-200 pb-1 font-sans text-micro-header font-medium text-muted-foreground mb-3">
                  Firma
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
                <span className="font-sans text-label font-medium text-muted-foreground block">
                  Archivos Adjuntos de Respaldo
                </span>
                {estaCerrado ? (
                  <span className="font-sans text-xs text-slate-400">
                    Documento cerrado: no admite nuevos respaldos
                  </span>
                ) : (
                  <label className="cursor-pointer font-sans text-xs font-bold text-muted-foreground hover:text-foreground">
                    {subirAdjuntoMutation.isPending
                      ? "Subiendo..."
                      : "Adjuntar"}
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleSubirAdjunto}
                      disabled={subirAdjuntoMutation.isPending}
                      className="hidden"
                    />
                  </label>
                )}
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
                        {!estaCerrado && (
                          <button
                            type="button"
                            onClick={() =>
                              eliminarAdjuntoMutation.mutate(adjunto.id)
                            }
                            className="text-rose-600 underline underline-offset-2"
                          >
                            Eliminar
                          </button>
                        )}
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
                className="font-sans text-[11px] font-bold text-muted-foreground hover:text-foreground"
              >
                {mostrarAuditoria
                  ? "Ocultar Auditoría"
                  : "Ver la Auditoría del Documento"}
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
                        </span>
                        , {evento.usuarioNombre ?? evento.tipoActor},{" "}
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
              <h3 className="border-b border-slate-200 pb-1 font-sans text-micro-header font-medium text-muted-foreground">
                Datos de la Atención
              </h3>

              <div>
                <span className="font-sans text-label font-medium text-muted-foreground block">
                  Paciente
                </span>
                <p className="font-sans font-medium text-value text-foreground mt-0.5">
                  {doc.pacienteNombre}
                </p>
              </div>

              <div>
                <span className="font-sans text-label font-medium text-muted-foreground block">
                  Servicio
                </span>
                <p className="font-sans font-medium text-value text-foreground mt-0.5">
                  {doc.servicio}
                </p>
              </div>

              <div>
                <span className="font-sans text-label font-medium text-muted-foreground block">
                  Fecha y Horario
                </span>
                <p className="font-sans font-medium text-value text-foreground mt-0.5">
                  {formatearFechaCorta(
                    new Date(`${doc.fechaAtencion}T00:00:00`)
                  )}
                  , {doc.horaAtencion.slice(0, 5)}
                </p>
              </div>

              <div>
                <span className="font-sans text-label font-medium text-muted-foreground block">
                  Especialista
                </span>
                <p className="font-sans font-medium text-value text-foreground mt-0.5">
                  {doc.especialistaNombre}
                </p>
              </div>

              {doc.plantillaNombre && (
                <div>
                  <span className="font-sans text-label font-medium text-muted-foreground block">
                    Plantilla
                  </span>
                  <p className="font-sans font-medium text-value text-foreground mt-0.5">
                    {doc.plantillaNombre}
                  </p>
                </div>
              )}

              <div>
                <span className="font-sans text-label font-medium text-muted-foreground block">
                  Creada por
                </span>
                <p className="font-sans font-medium text-value text-foreground mt-0.5">
                  {doc.creadoPorNombre
                    ? `${doc.creadoPorNombre} (${doc.creadoPorTipoActor})`
                    : doc.creadoPorTipoActor}
                </p>
              </div>

              <div>
                <span className="font-sans text-label font-medium text-muted-foreground block">
                  Fecha de Creación
                </span>
                <p className="font-sans font-medium text-value text-foreground mt-0.5">
                  {formatearFechaHora(new Date(doc.createdAt))}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50/60 p-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleImprimir}
            disabled={abrirArchivoMutation.isPending}
            className="font-sans text-xs font-bold px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-foreground rounded-overlay shadow-none disabled:opacity-50"
          >
            {abrirArchivoMutation.isPending ? "Preparando…" : "Imprimir"}
          </button>
          <button
            type="button"
            onClick={handleDescargarArchivo}
            disabled={abrirArchivoMutation.isPending}
            className="font-sans text-xs font-bold px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-foreground rounded-overlay shadow-none disabled:opacity-50"
          >
            {abrirArchivoMutation.isPending ? "Preparando…" : "Descargar"}
          </button>
          {puedeEditar && !confirmarCierre && (
            <button
              type="button"
              onClick={() => setConfirmarCierre(true)}
              className="font-sans text-xs font-bold px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-overlay shadow-none"
            >
              Cerrar Ficha
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
                className="font-sans text-xs font-bold px-3 py-2 border border-slate-200 rounded-overlay"
              >
                No
              </button>
              <button
                type="button"
                onClick={handleCerrarFicha}
                disabled={cerrarFichaMutation.isPending}
                className="font-sans text-xs font-bold px-3 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-overlay"
              >
                {cerrarFichaMutation.isPending ? "Cerrando…" : "Sí, Cerrar"}
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
