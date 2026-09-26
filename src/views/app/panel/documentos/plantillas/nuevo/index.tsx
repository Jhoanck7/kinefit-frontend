"use client";

import { Suspense } from "react";

import {
  Alerta,
  Modal,
  SelectField,
  SwitchField,
  TextField,
} from "@/components/shared";
import { Button, Card } from "@/components/ui";

import {
  COMPLETADO_POR,
  TIPOS_CAMPO,
  TIPOS_DOCUMENTO,
  useConstructorPlantilla,
} from "./hooks";

function ConstructorPlantillaContenido() {
  const {
    nombrePlantilla,
    tipoDocumento,
    modo,
    archivo,
    errorArchivo,
    requiereFirmaPaciente,
    requiereFirmaProfesional,
    secciones,
    errorNombre,
    errorSecciones,
    errorGuardado,
    confirmacionPendiente,
    seccionAEliminar,
    documentosDeLaPlantillaEditada,
    draggedCampo,
    draggedSeccionIndex,
    idEditado,
    seccionEnBorrado,
    urlArchivoActual,
    actions,
  } = useConstructorPlantilla();

  return (
    <div className="mx-auto max-w-6xl font-sans shadow-none">
      <div className="mb-6 flex items-start gap-3">
        <button
          type="button"
          onClick={actions.handleVolver}
          className="flex h-9 items-center justify-center rounded-overlay border border-slate-200 px-3 font-sans text-xs font-bold text-foreground hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-900"
        >
          Volver
        </button>
        <div>
          <h2 className="font-sans text-section-title font-bold text-foreground">
            {idEditado ? "Editar Plantilla" : "Nueva Plantilla"}
          </h2>
          <p className="font-sans text-xs text-slate-500 mt-0.5">
            Configura los campos y secciones para el documento clínico. Puedes
            arrastrar o usar las flechas para reordenar elementos.
          </p>
        </div>
      </div>

      {idEditado && documentosDeLaPlantillaEditada > 0 && (
        <Alerta tono="advertencia" className="mb-4">
          Esta plantilla tiene{" "}
          <strong>
            {documentosDeLaPlantillaEditada}{" "}
            {documentosDeLaPlantillaEditada === 1 ? "documento" : "documentos"}
          </strong>{" "}
          ya creados. Los cambios no alterarán esos documentos históricos:
          conservan la estructura vigente al momento de su creación.
        </Alerta>
      )}

      <div
        className={
          modo === "campos"
            ? "grid grid-cols-1 gap-6 md:grid-cols-[62fr_38fr]"
            : "mx-auto max-w-2xl"
        }
      >
        <div className="space-y-4">
          <Card className="rounded-none border-slate-200 shadow-none p-4">
            <TextField
              etiqueta="Nombre de la plantilla"
              placeholder="Ej: Ficha de Masoterapia / Ficha Kinesiológica"
              value={nombrePlantilla}
              onChange={e => actions.setNombrePlantilla(e.target.value)}
              error={errorNombre}
            />

            <div className="mt-4">
              <SelectField
                etiqueta="Tipo de documento"
                value={tipoDocumento}
                disabled={Boolean(idEditado)}
                onChange={e =>
                  actions.cambiarTipoDocumento(
                    e.target.value as typeof tipoDocumento
                  )
                }
                ayuda={
                  idEditado
                    ? "El tipo no se puede cambiar una vez creada la plantilla."
                    : "Decide cómo se rotula el documento y quién debe firmarlo."
                }
              >
                {TIPOS_DOCUMENTO.map(t => (
                  <option key={t.valor} value={t.valor}>
                    {t.etiqueta}
                  </option>
                ))}
              </SelectField>

              {!idEditado &&
                tipoDocumento !== "FichaClinica" &&
                modo !== "elegir" && (
                  <button
                    type="button"
                    onClick={() => actions.elegirModo("elegir")}
                    className="mt-1.5 font-sans text-label font-bold text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  >
                    Cambiar Forma de Armado
                  </button>
                )}
            </div>

            {tipoDocumento === "Consentimiento" && modo !== "elegir" && (
              <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
                <p className="font-sans text-label font-semibold text-muted-foreground">
                  Firmas Requeridas
                </p>
                <SwitchField
                  etiqueta="Requiere firma del paciente"
                  checked={requiereFirmaPaciente}
                  onChange={actions.setRequiereFirmaPaciente}
                />
                <SwitchField
                  etiqueta="Requiere firma de la profesional"
                  checked={requiereFirmaProfesional}
                  onChange={actions.setRequiereFirmaProfesional}
                />
              </div>
            )}
          </Card>

          {modo === "elegir" && (
            <Card className="rounded-none border-slate-200 shadow-none p-6">
              <p className="mb-4 font-sans text-label font-semibold text-muted-foreground">
                ¿Cómo se arma este documento?
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => actions.elegirModo("campos")}
                  className="rounded-none border border-slate-200 p-4 text-left hover:border-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-900"
                >
                  <span className="block font-sans text-value font-bold text-foreground">
                    Con Campos
                  </span>
                  <span className="mt-1 block font-sans text-xs text-slate-500">
                    Arma el documento sección por sección con el constructor.
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => actions.elegirModo("archivo")}
                  className="rounded-none border border-slate-200 p-4 text-left hover:border-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-900"
                >
                  <span className="block font-sans text-value font-bold text-foreground">
                    Documento Externo
                  </span>
                  <span className="mt-1 block font-sans text-xs text-slate-500">
                    Sube un PDF ya redactado.
                  </span>
                </button>
              </div>
            </Card>
          )}

          {modo === "archivo" && idEditado && (
            <Card className="rounded-none border-slate-200 shadow-none p-4">
              <label className="font-sans text-label font-semibold text-muted-foreground">
                Archivo Actual
              </label>
              <div className="mt-2 flex items-center gap-4">
                <button
                  type="button"
                  onClick={actions.handleAbrirArchivoActual}
                  className="font-sans text-xs font-bold text-panel-sidebar underline underline-offset-2"
                >
                  Abrir en Otra Pestaña
                </button>
                <button
                  type="button"
                  onClick={actions.handleVerArchivoActualAqui}
                  className="font-sans text-xs font-bold text-panel-sidebar underline underline-offset-2"
                >
                  {urlArchivoActual ? "Ocultar Visor" : "Ver Aquí"}
                </button>
              </div>
              {urlArchivoActual && (
                <iframe
                  src={urlArchivoActual}
                  title="Archivo de la plantilla"
                  className="mt-3 h-[70vh] w-full rounded-overlay border border-slate-200"
                />
              )}
            </Card>
          )}

          {modo === "archivo" && !idEditado && (
            <Card className="rounded-none border-slate-200 shadow-none p-4">
              <label className="font-sans text-label font-semibold text-muted-foreground">
                Archivo PDF
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={e => actions.setArchivo(e.target.files?.[0] ?? null)}
                className="mt-1 w-full text-xs"
              />
              {archivo && (
                <p className="mt-2 font-sans text-xs text-slate-500">
                  {archivo.name}
                </p>
              )}
              {errorArchivo && (
                <p className="mt-2 font-sans text-xs text-red-700">
                  {errorArchivo}
                </p>
              )}
            </Card>
          )}

          {modo !== "elegir" && errorGuardado && (
            <Alerta tono="error">{errorGuardado}</Alerta>
          )}

          {modo === "campos" && errorSecciones && (
            <Alerta tono="error">{errorSecciones}</Alerta>
          )}

          {modo === "campos" &&
            secciones.map((seccion, indiceSeccion) => (
              <div
                key={seccion.id}
                draggable
                onDragStart={e => {
                  e.stopPropagation();
                  actions.setDraggedSeccionIndex(indiceSeccion);
                }}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.stopPropagation();
                  if (
                    draggedSeccionIndex !== null &&
                    draggedSeccionIndex !== indiceSeccion
                  ) {
                    actions.moverSeccionDirecto(
                      draggedSeccionIndex,
                      indiceSeccion
                    );
                    actions.setDraggedSeccionIndex(null);
                  }
                }}
                className="border border-slate-200 rounded-none bg-white"
              >
                <div className="flex items-center gap-2 bg-slate-50/80 px-4 py-3 border-b border-slate-200">
                  <span
                    title="Arrastra para reordenar esta sección"
                    className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-900 select-none font-bold text-lg px-1"
                  >
                    ⠿
                  </span>
                  <input
                    value={seccion.nombre}
                    onChange={e =>
                      actions.actualizarSeccion(seccion.id, {
                        nombre: e.target.value,
                      })
                    }
                    placeholder="Nombre de la sección"
                    className="flex-1 bg-transparent font-sans text-sm font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-900 rounded-none px-2 py-0.5"
                    aria-label="Nombre de la sección"
                  />

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => actions.moverSeccion(indiceSeccion, -1)}
                      disabled={indiceSeccion === 0}
                      title="Mover sección arriba"
                      aria-label="Mover sección arriba"
                      className="flex h-7 w-7 items-center justify-center rounded-none border border-slate-200 bg-white text-xs font-bold text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-none transition-colors"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => actions.moverSeccion(indiceSeccion, 1)}
                      disabled={indiceSeccion === secciones.length - 1}
                      title="Mover sección abajo"
                      aria-label="Mover sección abajo"
                      className="flex h-7 w-7 items-center justify-center rounded-none border border-slate-200 bg-white text-xs font-bold text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-none transition-colors"
                    >
                      ▼
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => actions.setSeccionAEliminar(seccion.id)}
                    aria-label="Eliminar sección"
                    className="ml-2 text-xs font-bold text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-900 rounded-overlay px-2 py-1"
                  >
                    Eliminar
                  </button>
                </div>

                <div className="space-y-3 bg-white p-4">
                  {seccion.campos.map((campo, indiceCampo) => (
                    <div
                      key={campo.id}
                      draggable
                      onDragStart={e => {
                        e.stopPropagation();
                        actions.setDraggedCampo({
                          seccionId: seccion.id,
                          index: indiceCampo,
                        });
                      }}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => {
                        e.stopPropagation();
                        if (draggedCampo) {
                          actions.moverCampoDirecto(
                            draggedCampo.seccionId,
                            draggedCampo.index,
                            seccion.id,
                            indiceCampo
                          );
                          actions.setDraggedCampo(null);
                        }
                      }}
                      className="border border-slate-200 rounded-none p-3 bg-white hover:border-slate-400 transition-colors"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          title="Arrastra para reordenar este campo"
                          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-900 select-none font-bold text-base px-1"
                        >
                          ⠿
                        </span>

                        <input
                          value={campo.nombre}
                          onChange={e =>
                            actions.actualizarCampo(seccion.id, campo.id, {
                              nombre: e.target.value,
                            })
                          }
                          placeholder="Nombre del campo"
                          aria-label="Nombre del campo"
                          className="min-w-[140px] flex-1 rounded-none border border-slate-200 px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-900 font-medium"
                        />

                        <select
                          value={campo.tipo}
                          onChange={e =>
                            actions.actualizarCampo(seccion.id, campo.id, {
                              tipo: e.target
                                .value as (typeof TIPOS_CAMPO)[number]["valor"],
                            })
                          }
                          aria-label="Tipo de dato"
                          className="rounded-none border border-slate-200 px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-900 font-medium bg-white"
                        >
                          {TIPOS_CAMPO.map(t => (
                            <option key={t.valor} value={t.valor}>
                              {t.etiqueta}
                            </option>
                          ))}
                          {!TIPOS_CAMPO.some(t => t.valor === campo.tipo) && (
                            <option value={campo.tipo}>
                              {campo.tipo} (en desuso)
                            </option>
                          )}
                        </select>

                        <select
                          value={campo.completadoPor}
                          onChange={e =>
                            actions.actualizarCampo(seccion.id, campo.id, {
                              completadoPor: e.target
                                .value as typeof campo.completadoPor,
                            })
                          }
                          title="Quién completa este campo"
                          className="rounded-none border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-900"
                        >
                          {COMPLETADO_POR.map(c => (
                            <option key={c.valor} value={c.valor}>
                              Completa: {c.etiqueta}
                            </option>
                          ))}
                        </select>

                        <SwitchField
                          id={`obligatorio-${seccion.id}-${campo.id}`}
                          etiqueta="Obligatorio"
                          checked={campo.obligatorio}
                          onChange={v =>
                            actions.actualizarCampo(seccion.id, campo.id, {
                              obligatorio: v,
                            })
                          }
                        />

                        {secciones.length > 1 && (
                          <select
                            value={seccion.id}
                            onChange={e =>
                              actions.moverCampoDirecto(
                                seccion.id,
                                indiceCampo,
                                e.target.value,
                                0
                              )
                            }
                            title="Mover a otra sección"
                            className="rounded-none border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-900"
                          >
                            {secciones.map(sec => (
                              <option key={sec.id} value={sec.id}>
                                Mover a: {sec.nombre || "Sección"}
                              </option>
                            ))}
                          </select>
                        )}

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              actions.moverCampo(seccion.id, indiceCampo, -1)
                            }
                            disabled={indiceCampo === 0}
                            title="Subir posición del campo"
                            aria-label="Mover campo arriba"
                            className="flex h-7 w-7 items-center justify-center rounded-none border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed shadow-none transition-colors"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              actions.moverCampo(seccion.id, indiceCampo, 1)
                            }
                            disabled={indiceCampo === seccion.campos.length - 1}
                            title="Bajar posición del campo"
                            aria-label="Mover campo abajo"
                            className="flex h-7 w-7 items-center justify-center rounded-none border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed shadow-none transition-colors"
                          >
                            ▼
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            actions.quitarCampo(seccion.id, campo.id)
                          }
                          aria-label="Quitar campo"
                          title="Quitar este campo"
                          className="text-slate-400 hover:text-red-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-900 rounded-none px-1.5 py-0.5 text-base font-bold"
                        >
                          &times;
                        </button>
                      </div>

                      {campo.tipo === "Seleccion" && (
                        <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
                          <p className="font-sans text-label font-semibold text-muted-foreground">
                            Opciones de Selección
                          </p>
                          {campo.opciones.map((opcion, indiceOpcion) => (
                            <div
                              key={indiceOpcion}
                              className="flex items-center gap-2"
                            >
                              <input
                                value={opcion}
                                onChange={e => {
                                  const nuevas = [...campo.opciones];
                                  nuevas[indiceOpcion] = e.target.value;
                                  actions.actualizarCampo(
                                    seccion.id,
                                    campo.id,
                                    {
                                      opciones: nuevas,
                                    }
                                  );
                                }}
                                placeholder={`Opción ${indiceOpcion + 1}`}
                                aria-label={`Opción ${indiceOpcion + 1}`}
                                className="flex-1 rounded-none border border-slate-200 px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-900"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  actions.actualizarCampo(
                                    seccion.id,
                                    campo.id,
                                    {
                                      opciones: campo.opciones.filter(
                                        (_, i) => i !== indiceOpcion
                                      ),
                                    }
                                  )
                                }
                                aria-label="Quitar opción"
                                className="text-slate-400 hover:text-red-700 font-bold px-1"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              actions.actualizarCampo(seccion.id, campo.id, {
                                opciones: [...campo.opciones, ""],
                              })
                            }
                            className="font-sans text-xs font-bold text-slate-700 hover:text-slate-950 underline underline-offset-2"
                          >
                            Agregar opción
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => actions.agregarCampo(seccion.id)}
                    className="w-full rounded-none border border-dashed border-slate-300 py-2 text-sm font-semibold text-slate-700 hover:border-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-900 bg-slate-50/50"
                  >
                    Agregar campo
                  </button>
                </div>
              </div>
            ))}

          {modo === "campos" && (
            <button
              type="button"
              onClick={actions.agregarSeccion}
              className="flex w-full items-center justify-center gap-2 rounded-none border border-dashed border-slate-300 py-4 font-semibold text-slate-700 hover:border-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-900 bg-white"
            >
              Agregar sección
            </button>
          )}

          {modo !== "elegir" && (
            <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
              <Button
                variant="outline"
                className="rounded-overlay"
                onClick={actions.handleCancelar}
              >
                Cancelar
              </Button>
              <Button className="rounded-overlay" onClick={actions.alGuardar}>
                Guardar Plantilla
              </Button>
            </div>
          )}
        </div>

        {modo === "campos" && (
          <div className="border border-slate-200 rounded-none h-fit md:sticky md:top-6">
            <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
              <span className="font-sans text-xs font-bold">Vista Previa</span>
            </div>
            <div className="space-y-5 bg-white p-4">
              <p className="font-sans text-value font-bold text-foreground">
                {nombrePlantilla || "Sin Nombre"}
              </p>
              {secciones.map(seccion => (
                <div key={seccion.id}>
                  <p className="mb-2 border-b border-slate-200 pb-1 font-sans text-label font-bold text-muted-foreground">
                    {seccion.nombre || "Sin Nombre"}
                  </p>
                  <div className="space-y-3">
                    {seccion.campos.map(campo => (
                      <div key={campo.id}>
                        <label className="mb-1 block font-sans text-label font-medium text-muted-foreground">
                          {campo.nombre || "Sin Nombre"}
                          {campo.obligatorio && (
                            <span className="ml-0.5 text-red-700">*</span>
                          )}
                          {campo.tipo !== "TextoInformativo" && (
                            <span className="ml-1 font-normal text-slate-400">
                              {campo.completadoPor === "Paciente"
                                ? "· paciente"
                                : "· profesional"}
                            </span>
                          )}
                        </label>
                        {campo.tipo === "TextoInformativo" ? (
                          <p className="whitespace-pre-line font-sans text-xs leading-relaxed text-slate-600">
                            {campo.nombre || "Texto informativo"}
                          </p>
                        ) : campo.tipo === "Firma" ? (
                          <div className="rounded-none border border-dashed border-slate-300 bg-slate-50 px-2 py-4 text-center font-sans text-xs text-slate-500">
                            Recuadro de firma
                          </div>
                        ) : campo.tipo === "TextoLargo" ? (
                          <div className="h-16 rounded-none border border-slate-200 bg-slate-50" />
                        ) : campo.tipo === "Seleccion" ? (
                          <select
                            disabled
                            className="w-full rounded-none border border-slate-200 bg-slate-50 px-2 py-1 text-sm text-slate-500"
                          >
                            <option>Seleccionar…</option>
                            {campo.opciones.map((o, i) => (
                              <option key={i}>{o}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="h-8 rounded-none border border-slate-200 bg-slate-50" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal
        abierto={Boolean(seccionAEliminar)}
        onCerrar={() => actions.setSeccionAEliminar(null)}
      >
        <div className="p-6">
          <h3 className="font-sans text-section-title font-bold text-foreground">
            ¿Eliminar esta sección?
          </h3>
          <p className="mt-2 font-sans text-xs text-slate-500">
            Se perderá{(seccionEnBorrado?.campos.length ?? 0) === 1 ? "" : "n"}{" "}
            {seccionEnBorrado?.campos.length ?? 0}{" "}
            {(seccionEnBorrado?.campos.length ?? 0) === 1 ? "campo" : "campos"}{" "}
            de &ldquo;{seccionEnBorrado?.nombre}&rdquo;.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              className="rounded-overlay"
              onClick={() => actions.setSeccionAEliminar(null)}
            >
              Volver
            </Button>
            <Button
              className="rounded-overlay"
              onClick={actions.eliminarSeccionConfirmado}
            >
              Eliminar Sección
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        abierto={Boolean(confirmacionPendiente)}
        onCerrar={() => actions.setConfirmacionPendiente(null)}
      >
        <div className="p-6">
          <h3 className="font-sans text-section-title font-bold text-foreground">
            ¿Guardar los cambios?
          </h3>
          <p className="mt-2 font-sans text-xs text-slate-500">
            {confirmacionPendiente} Los documentos ya creados conservan lo que
            se respondió en ellos.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              className="rounded-overlay"
              onClick={() => actions.setConfirmacionPendiente(null)}
            >
              Volver
            </Button>
            <Button
              className="rounded-overlay"
              onClick={actions.confirmarGuardado}
            >
              Guardar de Todas Formas
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function ConstructorPlantillaView() {
  return (
    <Suspense fallback={<div className="h-full" aria-hidden />}>
      <ConstructorPlantillaContenido />
    </Suspense>
  );
}
