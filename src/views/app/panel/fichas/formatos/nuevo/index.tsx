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
  useConstructorFormato,
} from "./hooks";

function ConstructorFormatoContenido() {
  const {
    nombreFormato,
    tipoDocumento,
    requiereFirmaPaciente,
    requiereFirmaProfesional,
    secciones,
    errorNombre,
    errorSecciones,
    errorGuardado,
    confirmacionPendiente,
    seccionAEliminar,
    fichasDelFormatoEditado,
    draggedCampo,
    draggedSeccionIndex,
    idEditado,
    seccionEnBorrado,
    actions,
  } = useConstructorFormato();

  return (
    <div className="mx-auto max-w-6xl font-sans shadow-none">
      <div className="mb-6 flex items-start gap-3">
        <button
          type="button"
          onClick={actions.handleVolver}
          aria-label="Volver"
          className="flex h-9 w-9 items-center justify-center rounded-none border border-slate-200 text-slate-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-900"
        >
          ←
        </button>
        <div>
          <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900">
            {idEditado ? "Editar formato de ficha" : "Nuevo formato de ficha"}
          </h2>
          <p className="font-sans text-xs text-slate-500 mt-0.5">
            Configura los campos y secciones para las evaluaciones clínicas.
            Puedes arrastrar o usar las flechas para reordenar elementos.
          </p>
        </div>
      </div>

      {idEditado && fichasDelFormatoEditado > 0 && (
        <Alerta tono="advertencia" className="mb-4">
          Este formato tiene <strong>{fichasDelFormatoEditado} ficha(s)</strong>{" "}
          ya creadas. Los cambios no alterarán esas fichas históricas: conservan
          la estructura vigente al momento de su creación.
        </Alerta>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[65fr_35fr]">
        <div className="space-y-4">
          <Card className="rounded-none border-slate-200 shadow-none p-4">
            <TextField
              etiqueta="Nombre del formato"
              placeholder="Ej: Ficha de Masoterapia / Ficha Kinesiológica"
              value={nombreFormato}
              onChange={e => actions.setNombreFormato(e.target.value)}
              error={errorNombre}
            />

            <div className="mt-4">
              <SelectField
                etiqueta="Tipo de documento"
                value={tipoDocumento}
                onChange={e =>
                  actions.setTipoDocumento(
                    e.target.value as typeof tipoDocumento
                  )
                }
                ayuda="Decide cómo se rotula el documento y quién debe firmarlo."
              >
                {TIPOS_DOCUMENTO.map(t => (
                  <option key={t.valor} value={t.valor}>
                    {t.etiqueta}
                  </option>
                ))}
              </SelectField>
            </div>

            <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Firmas requeridas
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
          </Card>

          {errorSecciones && <Alerta tono="error">{errorSecciones}</Alerta>}
          {errorGuardado && <Alerta tono="error">{errorGuardado}</Alerta>}

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
                  className="ml-2 text-xs font-bold text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-900 rounded-none px-2 py-1"
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
                        <p className="font-sans text-[11px] font-semibold uppercase tracking-wider text-slate-400">
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
                              className="flex-1 rounded-none border border-slate-200 px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-900"
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

          <button
            type="button"
            onClick={actions.agregarSeccion}
            className="flex w-full items-center justify-center gap-2 rounded-none border border-dashed border-slate-300 py-4 font-semibold text-slate-700 hover:border-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-900 bg-white"
          >
            Agregar sección
          </button>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
            <Button variant="outline" onClick={actions.handleCancelar}>
              Cancelar
            </Button>
            <Button onClick={actions.alGuardar}>Guardar formato</Button>
          </div>
        </div>

        <div className="border border-slate-200 rounded-none h-fit sticky top-6">
          <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
            <span className="font-sans text-xs font-bold uppercase tracking-wider">
              Vista Previa
            </span>
          </div>
          <div className="space-y-5 bg-white p-4">
            <p className="font-sans text-sm font-bold text-slate-900">
              {nombreFormato || "Sin nombre"}
            </p>
            {secciones.map(seccion => (
              <div key={seccion.id}>
                <p className="mb-2 border-b border-slate-200 pb-1 font-sans text-xs font-bold uppercase tracking-wider text-slate-400">
                  {seccion.nombre || "Sin nombre"}
                </p>
                <div className="space-y-3">
                  {seccion.campos.map(campo => (
                    <div key={campo.id}>
                      <label className="mb-1 block font-sans text-[11px] font-medium uppercase tracking-wider text-slate-400">
                        {campo.nombre || "Sin nombre"}
                        {campo.obligatorio && (
                          <span className="ml-0.5 text-red-700">*</span>
                        )}
                      </label>
                      {campo.tipo === "TextoLargo" ? (
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
      </div>

      <Modal
        abierto={Boolean(seccionAEliminar)}
        onCerrar={() => actions.setSeccionAEliminar(null)}
      >
        <div className="p-6">
          <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900">
            ¿Eliminar esta sección?
          </h3>
          <p className="mt-2 font-sans text-xs text-slate-500">
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
            <Button onClick={actions.eliminarSeccionConfirmado}>
              Eliminar sección
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        abierto={Boolean(confirmacionPendiente)}
        onCerrar={() => actions.setConfirmacionPendiente(null)}
      >
        <div className="p-6">
          <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900">
            ¿Guardar los cambios?
          </h3>
          <p className="mt-2 font-sans text-xs text-slate-500">
            {confirmacionPendiente} Las fichas ya creadas conservan lo que se
            respondió en ellas.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => actions.setConfirmacionPendiente(null)}
            >
              Volver
            </Button>
            <Button onClick={actions.confirmarGuardado}>
              Guardar de todas formas
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
