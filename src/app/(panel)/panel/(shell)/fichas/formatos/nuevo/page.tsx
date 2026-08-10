"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useHoyPanel } from "@/lib/panel/reloj";
import { getFormato } from "@/lib/panel/data/formatos";
import { TipoCampoFormato } from "@/lib/panel/domain/tipos";
import { Card } from "@/components/panel/primitives/Card";
import { Button } from "@/components/panel/primitives/Button";
import { TextField, SelectField } from "@/components/panel/primitives/CamposFormulario";
import { SwitchField } from "@/components/panel/primitives/CamposFormulario";
import { Modal } from "@/components/panel/primitives/Modal";
import { SimulatedActionNotice } from "@/components/panel/primitives/SimulatedActionNotice";

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

export default function ConstructorFormatoPage() {
  const router = useRouter();
  const [nombreFormato, setNombreFormato] = useState("Ficha de Masoterapia");
  const [secciones, setSecciones] = useState<SeccionBorrador[]>([seccionNueva()]);
  const [errorNombre, setErrorNombre] = useState<string | undefined>();
  const [errorSecciones, setErrorSecciones] = useState<string | undefined>();
  const [seccionAEliminar, setSeccionAEliminar] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [fichasDelFormatoEditado, setFichasDelFormatoEditado] = useState(0);

  const searchParams = useSearchParams();
  const hoy = useHoyPanel();
  const idEditado = searchParams.get("editar");

  useEffect(() => {
    if (!hoy || !idEditado) return;
    getFormato(idEditado, hoy).then((formato) => {
      if (formato) setFichasDelFormatoEditado(formato.fichasCreadas);
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
    if (valido) setGuardado(true);
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
          <h2 className="text-xl font-bold text-panel-sidebar">Nuevo formato de ficha</h2>
          <p className="text-sm text-brand-muted">Configura los campos y secciones para las evaluaciones clínicas.</p>
        </div>
      </div>

      {idEditado && fichasDelFormatoEditado > 0 && (
        <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          Este formato tiene <strong>{fichasDelFormatoEditado} ficha(s)</strong> ya creadas. Los cambios no
          alterarán esas fichas históricas: conservan la estructura vigente al momento de su creación.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[65fr_35fr]">
        <div className="space-y-4">
          <Card>
            <TextField
              etiqueta="Nombre del formato"
              value={nombreFormato}
              onChange={(e) => setNombreFormato(e.target.value)}
              error={errorNombre}
            />
          </Card>

          {errorSecciones && <p className="text-sm text-red-600">{errorSecciones}</p>}

          {secciones.map((seccion, indiceSeccion) => (
            <div key={seccion.id} className="rounded-2xl border border-brand-border overflow-hidden">
              <div className="flex items-center gap-2 bg-panel-seleccion px-4 py-3">
                <span className="text-brand-muted" aria-hidden>⠿</span>
                <input
                  value={seccion.nombre}
                  onChange={(e) => actualizarSeccion(seccion.id, { nombre: e.target.value })}
                  className="flex-1 bg-transparent text-base font-semibold text-panel-sidebar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar rounded"
                  aria-label="Nombre de la sección"
                />
                <button
                  type="button"
                  onClick={() => moverSeccion(indiceSeccion, -1)}
                  disabled={indiceSeccion === 0}
                  aria-label="Mover sección arriba"
                  className="text-panel-sidebar disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar rounded"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moverSeccion(indiceSeccion, 1)}
                  disabled={indiceSeccion === secciones.length - 1}
                  aria-label="Mover sección abajo"
                  className="text-panel-sidebar disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar rounded"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => setSeccionAEliminar(seccion.id)}
                  aria-label="Eliminar sección"
                  className="text-xs font-semibold text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar rounded"
                >
                  Eliminar
                </button>
              </div>

              <div className="space-y-2 bg-white p-4">
                {seccion.campos.map((campo, indiceCampo) => (
                  <div key={campo.id} className="rounded-lg border border-brand-border p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-brand-muted" aria-hidden>⠿</span>
                      <input
                        value={campo.nombre}
                        onChange={(e) => actualizarCampo(seccion.id, campo.id, { nombre: e.target.value })}
                        placeholder="Nombre del campo"
                        aria-label="Nombre del campo"
                        className="min-w-[140px] flex-1 rounded border border-brand-border px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar"
                      />
                      <select
                        value={campo.tipo}
                        onChange={(e) => actualizarCampo(seccion.id, campo.id, { tipo: e.target.value as TipoCampoFormato })}
                        aria-label="Tipo de dato"
                        className="rounded border border-brand-border px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar"
                      >
                        {TIPOS_CAMPO.map((t) => (
                          <option key={t.valor} value={t.valor}>
                            {t.etiqueta}
                          </option>
                        ))}
                      </select>
                      <SwitchField
                        etiqueta="Obligatorio"
                        checked={campo.obligatorio}
                        onChange={(v) => actualizarCampo(seccion.id, campo.id, { obligatorio: v })}
                      />
                      <button
                        type="button"
                        onClick={() => moverCampo(seccion.id, indiceCampo, -1)}
                        disabled={indiceCampo === 0}
                        aria-label="Mover campo arriba"
                        className="text-panel-sidebar disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar rounded"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moverCampo(seccion.id, indiceCampo, 1)}
                        disabled={indiceCampo === seccion.campos.length - 1}
                        aria-label="Mover campo abajo"
                        className="text-panel-sidebar disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar rounded"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => quitarCampo(seccion.id, campo.id)}
                        aria-label="Quitar campo"
                        className="text-brand-muted hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar rounded"
                      >
                        &times;
                      </button>
                    </div>

                    {campo.tipo === "seleccion" && (
                      <div className="mt-3 space-y-2 border-t border-brand-border pt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Opciones</p>
                        {campo.opciones.map((opcion, indiceOpcion) => (
                          <div key={indiceOpcion} className="flex items-center gap-2">
                            <input
                              value={opcion}
                              onChange={(e) => {
                                const nuevas = [...campo.opciones];
                                nuevas[indiceOpcion] = e.target.value;
                                actualizarCampo(seccion.id, campo.id, { opciones: nuevas });
                              }}
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
                              className="text-brand-muted hover:text-red-600"
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
                          className="text-xs text-panel-sidebar underline underline-offset-2"
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
                  className="w-full rounded-lg border-2 border-dashed border-brand-border py-2 text-sm text-panel-sidebar hover:border-panel-sidebar/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar"
                >
                  + Agregar campo
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setSecciones((prev) => [...prev, seccionNueva()])}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-border py-4 text-panel-sidebar hover:border-panel-sidebar/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar"
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

        <div className="rounded-2xl border border-brand-border overflow-hidden h-fit sticky top-6">
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

      <SimulatedActionNotice
        abierto={guardado}
        onCerrar={() => router.push("/panel/fichas/formatos")}
        titulo="Formato guardado"
        descripcion="El formato quedó disponible para usarse al crear nuevas fichas."
      />
    </div>
  );
}
