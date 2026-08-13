"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useHoyPanel } from "@/lib/panel/reloj";
import { getFormato, guardarFormato } from "@/lib/panel/data/formatos";
import { TipoCampoFormato } from "@/lib/panel/domain/tipos";
import { Card } from "@/components/panel/primitives/Card";
import { Button } from "@/components/panel/primitives/Button";
import { TextField } from "@/components/panel/primitives/CamposFormulario";
import { SwitchField } from "@/components/panel/primitives/CamposFormulario";
import { Modal } from "@/components/panel/primitives/Modal";

interface CampoBorrador {
  id: string;
  nombre: string;
  tipo: TipoCampoFormato;
  obligatorio: boolean;
  opciones: string[];
}

interface SeccionBorrador {
  id: string;
  nombre: string;
  campos: CampoBorrador[];
}

let contadorId = 0;
function idUnico(prefijo: string): string {
  contadorId += 1;
  return `${prefijo}-${contadorId}`;
}

function campoNuevo(): CampoBorrador {
  return { id: idUnico("campo"), nombre: "", tipo: "texto_corto", obligatorio: false, opciones: [] };
}

function seccionNueva(): SeccionBorrador {
  return { id: idUnico("seccion"), nombre: "Nueva sección", campos: [campoNuevo()] };
}

const TIPOS_CAMPO: { valor: TipoCampoFormato; etiqueta: string }[] = [
  { valor: "texto_corto", etiqueta: "Texto corto" },
  { valor: "texto_largo", etiqueta: "Texto largo" },
  { valor: "numerico", etiqueta: "Numérico" },
  { valor: "fecha", etiqueta: "Fecha" },
  { valor: "seleccion", etiqueta: "Selección" },
];

function mover<T>(lista: T[], indice: number, direccion: -1 | 1): T[] {
  const destino = indice + direccion;
  if (destino < 0 || destino >= lista.length) return lista;
  const copia = [...lista];
  [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
  return copia;
}

function ConstructorFormatoContenido() {
  const router = useRouter();
  const [nombreFormato, setNombreFormato] = useState("");
  const [secciones, setSecciones] = useState<SeccionBorrador[]>([seccionNueva()]);
  const [errorNombre, setErrorNombre] = useState<string | undefined>();
  const [errorSecciones, setErrorSecciones] = useState<string | undefined>();
  const [seccionAEliminar, setSeccionAEliminar] = useState<string | null>(null);
  const [fichasDelFormatoEditado, setFichasDelFormatoEditado] = useState(0);

  // Drag and Drop States
  const [draggedCampo, setDraggedCampo] = useState<{ seccionId: string; index: number } | null>(null);
  const [draggedSeccionIndex, setDraggedSeccionIndex] = useState<number | null>(null);

  const searchParams = useSearchParams();
  const hoy = useHoyPanel();
  const idEditado = searchParams.get("editar");

  useEffect(() => {
    if (!hoy || !idEditado) return;
    getFormato(idEditado, hoy).then((formato) => {
      if (formato) {
        setFichasDelFormatoEditado(formato.fichasCreadas);
        setNombreFormato(formato.nombre);
        if (formato.secciones && formato.secciones.length > 0) {
          setSecciones(
            formato.secciones.map((s) => ({
              id: s.id,
              nombre: s.nombre,
              campos: s.campos.map((c) => ({
                id: c.id,
                nombre: c.nombre,
                tipo: c.tipo,
                obligatorio: c.obligatorio,
                opciones: c.opciones || [],
              })),
            }))
          );
        }
      }
    });
  }, [hoy, idEditado]);

  function actualizarSeccion(id: string, cambios: Partial<SeccionBorrador>) {
    setSecciones((prev) => prev.map((s) => (s.id === id ? { ...s, ...cambios } : s)));
  }

  function actualizarCampo(seccionId: string, campoId: string, cambios: Partial<CampoBorrador>) {
    setSecciones((prev) =>
      prev.map((s) =>
        s.id !== seccionId
          ? s
          : { ...s, campos: s.campos.map((c) => (c.id === campoId ? { ...c, ...cambios } : c)) }
      )
    );
  }

  function agregarCampo(seccionId: string) {
    setSecciones((prev) =>
      prev.map((s) => (s.id === seccionId ? { ...s, campos: [...s.campos, campoNuevo()] } : s))
    );
  }

  function quitarCampo(seccionId: string, campoId: string) {
    setSecciones((prev) =>
      prev.map((s) => (s.id === seccionId ? { ...s, campos: s.campos.filter((c) => c.id !== campoId) } : s))
    );
  }

  function moverCampo(seccionId: string, indice: number, direccion: -1 | 1) {
    setSecciones((prev) =>
      prev.map((s) => (s.id === seccionId ? { ...s, campos: mover(s.campos, indice, direccion) } : s))
    );
  }

  function moverSeccion(indice: number, direccion: -1 | 1) {
    setSecciones((prev) => mover(prev, indice, direccion));
  }

  function moverCampoDirecto(fromSeccionId: string, fromIndex: number, toSeccionId: string, toIndex: number) {
    setSecciones((prev) => {
      const copia = prev.map((s) => ({ ...s, campos: [...s.campos] }));
      const sourceSec = copia.find((s) => s.id === fromSeccionId);
      const destSec = copia.find((s) => s.id === toSeccionId);
      if (!sourceSec || !destSec) return prev;

      const [campoRemovido] = sourceSec.campos.splice(fromIndex, 1);
      if (!campoRemovido) return prev;

      destSec.campos.splice(toIndex, 0, campoRemovido);
      return copia;
    });
  }

  function moverSeccionDirecto(fromIndex: number, toIndex: number) {
    setSecciones((prev) => {
      if (fromIndex < 0 || fromIndex >= prev.length || toIndex < 0 || toIndex >= prev.length) return prev;
      const copia = [...prev];
      const [seccionRemovida] = copia.splice(fromIndex, 1);
      copia.splice(toIndex, 0, seccionRemovida);
      return copia;
    });
  }

  function eliminarSeccionConfirmado() {
    setSecciones((prev) => prev.filter((s) => s.id !== seccionAEliminar));
    setSeccionAEliminar(null);
  }

  function alGuardar() {
    let valido = true;
    if (!nombreFormato.trim()) {
      setErrorNombre("El formato debe tener un nombre.");
      valido = false;
    } else {
      setErrorNombre(undefined);
    }
    if (secciones.length === 0 || secciones.some((s) => s.campos.length === 0 || !s.nombre.trim())) {
      setErrorSecciones("Cada sección debe tener nombre y al menos un campo con nombre.");
      valido = false;
    } else if (secciones.some((s) => s.campos.some((c) => !c.nombre.trim()))) {
      setErrorSecciones("Todos los campos deben tener un nombre.");
      valido = false;
    } else {
      setErrorSecciones(undefined);
    }
    if (valido) {
      const formatoIdCalculado = idEditado || `fmt-${Date.now()}`;
      guardarFormato({
        id: formatoIdCalculado,
        nombre: nombreFormato.trim(),
        secciones: secciones.map((s) => ({
          id: s.id,
          nombre: s.nombre,
          campos: s.campos.map((c) => ({
            id: c.id,
            nombre: c.nombre,
            tipo: c.tipo,
            obligatorio: c.obligatorio,
            opciones: c.opciones,
          })),
        })),
        modificadoHaceDias: 0,
      });
      router.push("/panel/fichas/formatos");
    }
  }

  const seccionEnBorrado = secciones.find((s) => s.id === seccionAEliminar);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-start gap-3">
        <button
          type="button"
          onClick={() => router.push("/panel/fichas/formatos")}
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
            Configura los campos y secciones para las evaluaciones clínicas. Puedes arrastrar o usar las flechas para reordenar elementos.
          </p>
        </div>
      </div>

      {idEditado && fichasDelFormatoEditado > 0 && (
        <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 border border-amber-200">
          Este formato tiene <strong>{fichasDelFormatoEditado} ficha(s)</strong> ya creadas. Los cambios no
          alterarán esas fichas históricas: conservan la estructura vigente al momento de su creación.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[65fr_35fr]">
        <div className="space-y-4">
          <Card>
            <TextField
              etiqueta="Nombre del formato"
              placeholder="Ej: Ficha de Masoterapia / Ficha Kinesiológica"
              value={nombreFormato}
              onChange={(e) => setNombreFormato(e.target.value)}
              error={errorNombre}
            />
          </Card>

          {errorSecciones && <p className="text-sm font-semibold text-red-600">{errorSecciones}</p>}

          {secciones.map((seccion, indiceSeccion) => (
            <div
              key={seccion.id}
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                setDraggedSeccionIndex(indiceSeccion);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.stopPropagation();
                if (draggedSeccionIndex !== null && draggedSeccionIndex !== indiceSeccion) {
                  moverSeccionDirecto(draggedSeccionIndex, indiceSeccion);
                  setDraggedSeccionIndex(null);
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
                  onChange={(e) => actualizarSeccion(seccion.id, { nombre: e.target.value })}
                  placeholder="Nombre de la sección"
                  className="flex-1 bg-transparent text-base font-semibold text-panel-sidebar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar rounded px-2 py-0.5"
                  aria-label="Nombre de la sección"
                />

                {/* Botones de Reordenar Sección */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moverSeccion(indiceSeccion, -1)}
                    disabled={indiceSeccion === 0}
                    title="Mover sección arriba"
                    aria-label="Mover sección arriba"
                    className="flex h-7 w-7 items-center justify-center rounded bg-white/80 border border-brand-border text-xs font-bold text-panel-sidebar hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-colors"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => moverSeccion(indiceSeccion, 1)}
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
                  onClick={() => setSeccionAEliminar(seccion.id)}
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
                    onDragStart={(e) => {
                      e.stopPropagation();
                      setDraggedCampo({ seccionId: seccion.id, index: indiceCampo });
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.stopPropagation();
                      if (draggedCampo) {
                        moverCampoDirecto(draggedCampo.seccionId, draggedCampo.index, seccion.id, indiceCampo);
                        setDraggedCampo(null);
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
                        onChange={(e) => actualizarCampo(seccion.id, campo.id, { nombre: e.target.value })}
                        placeholder="Nombre del campo"
                        aria-label="Nombre del campo"
                        className="min-w-[140px] flex-1 rounded border border-brand-border px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar font-medium"
                      />

                      <select
                        value={campo.tipo}
                        onChange={(e) => actualizarCampo(seccion.id, campo.id, { tipo: e.target.value as TipoCampoFormato })}
                        aria-label="Tipo de dato"
                        className="rounded border border-brand-border px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar font-medium bg-white"
                      >
                        {TIPOS_CAMPO.map((t) => (
                          <option key={t.valor} value={t.valor}>
                            {t.etiqueta}
                          </option>
                        ))}
                      </select>

                      <SwitchField
                        id={`obligatorio-${seccion.id}-${campo.id}`}
                        etiqueta="Obligatorio"
                        checked={campo.obligatorio}
                        onChange={(v) => actualizarCampo(seccion.id, campo.id, { obligatorio: v })}
                      />

                      {/* Selector de Sección si hay múltiples */}
                      {secciones.length > 1 && (
                        <select
                          value={seccion.id}
                          onChange={(e) => moverCampoDirecto(seccion.id, indiceCampo, e.target.value, 0)}
                          title="Mover a otra sección"
                          className="rounded border border-brand-border bg-panel-fondo px-2 py-1 text-xs text-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar"
                        >
                          {secciones.map((sec) => (
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
                          onClick={() => moverCampo(seccion.id, indiceCampo, -1)}
                          disabled={indiceCampo === 0}
                          title="Subir posición del campo"
                          aria-label="Mover campo arriba"
                          className="flex h-7 w-7 items-center justify-center rounded border border-brand-border bg-panel-fondo text-xs font-bold text-panel-sidebar hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-colors"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => moverCampo(seccion.id, indiceCampo, 1)}
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
                        onClick={() => quitarCampo(seccion.id, campo.id)}
                        aria-label="Quitar campo"
                        title="Quitar este campo"
                        className="text-brand-muted hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar rounded px-1.5 py-0.5 text-base font-bold"
                      >
                        &times;
                      </button>
                    </div>

                    {campo.tipo === "seleccion" && (
                      <div className="mt-3 space-y-2 border-t border-brand-border pt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Opciones de selección</p>
                        {campo.opciones.map((opcion, indiceOpcion) => (
                          <div key={indiceOpcion} className="flex items-center gap-2">
                            <input
                              value={opcion}
                              onChange={(e) => {
                                const nuevas = [...campo.opciones];
                                nuevas[indiceOpcion] = e.target.value;
                                actualizarCampo(seccion.id, campo.id, { opciones: nuevas });
                              }}
                              placeholder={`Opción ${indiceOpcion + 1}`}
                              aria-label={`Opción ${indiceOpcion + 1}`}
                              className="flex-1 rounded border border-brand-border px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                actualizarCampo(seccion.id, campo.id, {
                                  opciones: campo.opciones.filter((_, i) => i !== indiceOpcion),
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
                            actualizarCampo(seccion.id, campo.id, { opciones: [...campo.opciones, ""] })
                          }
                          className="text-xs font-semibold text-panel-sidebar underline underline-offset-2"
                        >
                          + Agregar opción
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => agregarCampo(seccion.id)}
                  className="w-full rounded-lg border-2 border-dashed border-brand-border py-2 text-sm font-semibold text-panel-sidebar hover:border-panel-sidebar/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar bg-slate-50/50"
                >
                  + Agregar campo
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setSecciones((prev) => [...prev, seccionNueva()])}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-border py-4 font-semibold text-panel-sidebar hover:border-panel-sidebar/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar bg-white"
          >
            + Agregar sección
          </button>

          <div className="flex justify-end gap-3 border-t border-brand-border pt-6">
            <Button variante="secundario" onClick={() => router.push("/panel/fichas/formatos")}>
              Cancelar
            </Button>
            <Button variante="primario" onClick={alGuardar}>
              Guardar formato
            </Button>
          </div>
        </div>

        {/* Vista Previa en Vivo */}
        <div className="rounded-2xl border border-brand-border overflow-hidden h-fit sticky top-6 shadow-sm">
          <div className="flex items-center justify-between bg-panel-sidebar px-4 py-3 text-white">
            <span className="font-semibold">Vista Previa</span>
          </div>
          <div className="space-y-5 bg-white p-4">
            <p className="text-lg font-bold text-panel-sidebar">{nombreFormato || "Sin nombre"}</p>
            {secciones.map((seccion) => (
              <div key={seccion.id}>
                <p className="mb-2 border-b border-brand-border pb-1 font-semibold text-panel-sidebar">
                  {seccion.nombre || "Sin nombre"}
                </p>
                <div className="space-y-3">
                  {seccion.campos.map((campo) => (
                    <div key={campo.id}>
                      <label className="mb-1 block text-xs font-medium text-panel-sidebar">
                        {campo.nombre || "Sin nombre"}
                        {campo.obligatorio && <span className="ml-0.5 text-red-600">*</span>}
                      </label>
                      {campo.tipo === "texto_largo" ? (
                        <div className="h-16 rounded border border-brand-border bg-panel-fondo" />
                      ) : campo.tipo === "seleccion" ? (
                        <select disabled className="w-full rounded border border-brand-border bg-panel-fondo px-2 py-1 text-sm text-brand-muted">
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

      <Modal abierto={Boolean(seccionAEliminar)} onCerrar={() => setSeccionAEliminar(null)} ancho="max-w-sm">
        <div className="p-6">
          <h3 className="text-lg font-bold text-panel-sidebar">¿Eliminar esta sección?</h3>
          <p className="mt-2 text-sm text-brand-muted">
            Se perderán {seccionEnBorrado?.campos.length ?? 0} campo(s) de &ldquo;{seccionEnBorrado?.nombre}&rdquo;.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variante="secundario" onClick={() => setSeccionAEliminar(null)}>
              Volver
            </Button>
            <Button variante="peligro" onClick={eliminarSeccionConfirmado}>
              Eliminar sección
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function ConstructorFormatoPage() {
  return (
    <Suspense fallback={<div className="h-full" aria-hidden />}>
      <ConstructorFormatoContenido />
    </Suspense>
  );
}
