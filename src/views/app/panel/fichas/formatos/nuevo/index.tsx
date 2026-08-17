"use client";

import { Suspense } from "react";

import { Modal, SwitchField, TextField } from "@/components/shared";
import { Button, Card } from "@/components/ui";

import { TIPOS_CAMPO, useConstructorFormato } from "./hooks";

function ConstructorFormatoContenido() {
  const {
    nombreFormato,
    secciones,
    errorNombre,
    errorSecciones,
    seccionAEliminar,
    fichasDelFormatoEditado,
    draggedCampo,
    draggedSeccionIndex,
    idEditado,
    seccionEnBorrado,
    actions,
  } = useConstructorFormato();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-start gap-3">
        <button
          type="button"
          onClick={actions.handleVolver}
          aria-label="Volver"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-border text-panel-sidebar hover:bg-panel-fondo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar"
        >
          ←
        </button>
        <div>
          <h2 className="text-xl font-bold text-panel-sidebar">
            {idEditado ? "Editar formato de ficha" : "Nuevo formato de ficha"}
          </h2>
          <p className="text-sm text-brand-muted">
            Configura los campos y secciones para las evaluaciones clínicas.
            Puedes arrastrar o usar las flechas para reordenar elementos.
          </p>
        </div>
      </div>

      {idEditado && fichasDelFormatoEditado > 0 && (
        <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 border border-amber-200">
          Este formato tiene <strong>{fichasDelFormatoEditado} ficha(s)</strong>{" "}
          ya creadas. Los cambios no alterarán esas fichas históricas: conservan
          la estructura vigente al momento de su creación.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[65fr_35fr]">
        <div className="space-y-4">
          <Card>
            <TextField
              etiqueta="Nombre del formato"
              placeholder="Ej: Ficha de Masoterapia / Ficha Kinesiológica"
              value={nombreFormato}
              onChange={e => actions.setNombreFormato(e.target.value)}
              error={errorNombre}
            />
          </Card>

          {errorSecciones && (
            <p className="text-sm font-semibold text-red-600">
              {errorSecciones}
            </p>
          )}

          {secciones.map((seccion, indiceSeccion) => (
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
              className="rounded-2xl border border-brand-border overflow-hidden bg-white shadow-sm transition-all"
            >
              {/* Encabezado de Sección */}
              <div className="flex items-center gap-2 bg-panel-seleccion px-4 py-3 border-b border-brand-border">
                <span
                  title="Arrastra para reordenar esta sección"
                  className="cursor-grab active:cursor-grabbing text-brand-muted hover:text-panel-sidebar select-none font-bold text-lg px-1"
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
                  className="flex-1 bg-transparent text-base font-semibold text-panel-sidebar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar rounded px-2 py-0.5"
                  aria-label="Nombre de la sección"
                />

                {/* Botones de Reordenar Sección */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => actions.moverSeccion(indiceSeccion, -1)}
                    disabled={indiceSeccion === 0}
                    title="Mover sección arriba"
                    aria-label="Mover sección arriba"
                    className="flex h-7 w-7 items-center justify-center rounded bg-white/80 border border-brand-border text-xs font-bold text-panel-sidebar hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-colors"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => actions.moverSeccion(indiceSeccion, 1)}
                    disabled={indiceSeccion === secciones.length - 1}
                    title="Mover sección abajo"
                    aria-label="Mover sección abajo"
                    className="flex h-7 w-7 items-center justify-center rounded bg-white/80 border border-brand-border text-xs font-bold text-panel-sidebar hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-colors"
                  >
                    ▼
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => actions.setSeccionAEliminar(seccion.id)}
                  aria-label="Eliminar sección"
                  className="ml-2 text-xs font-bold text-red-600 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar rounded px-2 py-1 bg-red-50 border border-red-200"
                >
                  Eliminar
                </button>
              </div>

              {/* Lista de Campos */}
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
                    className="rounded-lg border border-brand-border p-3 bg-white hover:border-panel-sidebar/40 transition-all shadow-2xs"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        title="Arrastra para reordenar este campo"
                        className="cursor-grab active:cursor-grabbing text-brand-muted hover:text-panel-sidebar select-none font-bold text-base px-1"
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
                        className="min-w-[140px] flex-1 rounded border border-brand-border px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar font-medium"
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
                        className="rounded border border-brand-border px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar font-medium bg-white"
                      >
                        {TIPOS_CAMPO.map(t => (
                          <option key={t.valor} value={t.valor}>
                            {t.etiqueta}
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

                      {/* Selector de Sección si hay múltiples */}
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
                          className="rounded border border-brand-border bg-panel-fondo px-2 py-1 text-xs text-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar"
                        >
                          {secciones.map(sec => (
                            <option key={sec.id} value={sec.id}>
                              Mover a: {sec.nombre || "Sección"}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* Botones para Subir/Bajar Posición del Campo */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            actions.moverCampo(seccion.id, indiceCampo, -1)
                          }
                          disabled={indiceCampo === 0}
                          title="Subir posición del campo"
                          aria-label="Mover campo arriba"
                          className="flex h-7 w-7 items-center justify-center rounded border border-brand-border bg-panel-fondo text-xs font-bold text-panel-sidebar hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-colors"
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
                          className="flex h-7 w-7 items-center justify-center rounded border border-brand-border bg-panel-fondo text-xs font-bold text-panel-sidebar hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-colors"
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
                        className="text-brand-muted hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar rounded px-1.5 py-0.5 text-base font-bold"
                      >
                        &times;
                      </button>
                    </div>

                    {campo.tipo === "seleccion" && (
                      <div className="mt-3 space-y-2 border-t border-brand-border pt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
                          Opciones de selección
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
                                actions.actualizarCampo(seccion.id, campo.id, {
                                  opciones: nuevas,
                                });
                              }}
                              placeholder={`Opción ${indiceOpcion + 1}`}
                              aria-label={`Opción ${indiceOpcion + 1}`}
                              className="flex-1 rounded border border-brand-border px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                actions.actualizarCampo(seccion.id, campo.id, {
                                  opciones: campo.opciones.filter(
                                    (_, i) => i !== indiceOpcion
                                  ),
                                })
                              }
                              aria-label="Quitar opción"
                              className="text-brand-muted hover:text-red-600 font-bold px-1"
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
                          className="text-xs font-semibold text-panel-sidebar underline underline-offset-2"
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
                  className="w-full rounded-lg border-2 border-dashed border-brand-border py-2 text-sm font-semibold text-panel-sidebar hover:border-panel-sidebar/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar bg-slate-50/50"
                >
                  Agregar campo
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={actions.agregarSeccion}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-border py-4 font-semibold text-panel-sidebar hover:border-panel-sidebar/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar bg-white"
          >
            Agregar sección
          </button>

          <div className="flex justify-end gap-3 border-t border-brand-border pt-6">
            <Button variant="outline" onClick={actions.handleCancelar}>
              Cancelar
            </Button>
            <Button onClick={actions.alGuardar}>Guardar formato</Button>
          </div>
        </div>

        {/* Vista Previa en Vivo */}
        <div className="rounded-2xl border border-brand-border overflow-hidden h-fit sticky top-6 shadow-sm">
          <div className="flex items-center justify-between bg-panel-sidebar px-4 py-3 text-white">
            <span className="font-semibold">Vista Previa</span>
          </div>
          <div className="space-y-5 bg-white p-4">
            <p className="text-lg font-bold text-panel-sidebar">
              {nombreFormato || "Sin nombre"}
            </p>
            {secciones.map(seccion => (
              <div key={seccion.id}>
                <p className="mb-2 border-b border-brand-border pb-1 font-semibold text-panel-sidebar">
                  {seccion.nombre || "Sin nombre"}
                </p>
                <div className="space-y-3">
                  {seccion.campos.map(campo => (
                    <div key={campo.id}>
                      <label className="mb-1 block text-xs font-medium text-panel-sidebar">
                        {campo.nombre || "Sin nombre"}
                        {campo.obligatorio && (
                          <span className="ml-0.5 text-red-600">*</span>
                        )}
                      </label>
                      {campo.tipo === "texto_largo" ? (
                        <div className="h-16 rounded border border-brand-border bg-panel-fondo" />
                      ) : campo.tipo === "seleccion" ? (
                        <select
                          disabled
                          className="w-full rounded border border-brand-border bg-panel-fondo px-2 py-1 text-sm text-brand-muted"
                        >
                          <option>Seleccionar…</option>
                          {campo.opciones.map((o, i) => (
                            <option key={i}>{o}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="h-8 rounded border border-brand-border bg-panel-fondo" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        abierto={Boolean(seccionAEliminar)}
        onCerrar={() => actions.setSeccionAEliminar(null)}
        ancho="max-w-sm"
      >
        <div className="p-6">
          <h3 className="text-lg font-bold text-panel-sidebar">
            ¿Eliminar esta sección?
          </h3>
          <p className="mt-2 text-sm text-brand-muted">
            Se perderán {seccionEnBorrado?.campos.length ?? 0} campo(s) de
            &ldquo;{seccionEnBorrado?.nombre}&rdquo;.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => actions.setSeccionAEliminar(null)}
            >
              Volver
            </Button>
            <Button
              variant="destructive"
              onClick={actions.eliminarSeccionConfirmado}
            >
              Eliminar sección
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function ConstructorFormatoView() {
  return (
    <Suspense fallback={<div className="h-full" aria-hidden />}>
      <ConstructorFormatoContenido />
    </Suspense>
  );
}
