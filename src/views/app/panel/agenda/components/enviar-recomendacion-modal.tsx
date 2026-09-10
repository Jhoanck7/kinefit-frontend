"use client";

import { useState } from "react";

import {
  Alerta,
  CollapsibleSection,
  Modal,
  NumberField,
  OptionSelector,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/shared";
import { Button } from "@/components/ui";
import {
  useAdjuntarRecomendacionMutation,
  useEnviarRecomendacionMutation,
  useGetPlantillas,
} from "@/hooks/api";
import { handleApiError } from "@/lib/api";

type Paso = "preguntar" | "elegir" | "personalizada" | "adjuntar" | "plantilla";

interface EnviarRecomendacionModalProps {
  citaId: number | null;
  onCerrar: () => void;
}

export function EnviarRecomendacionModal({
  citaId,
  onCerrar,
}: EnviarRecomendacionModalProps) {
  const [paso, setPaso] = useState<Paso>("preguntar");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [nombre, setNombre] = useState("");
  const [plantillaId, setPlantillaId] = useState<number | null>(null);
  const [contenido, setContenido] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [enviado, setEnviado] = useState<string | null>(null);

  const enviarMutation = useEnviarRecomendacionMutation();
  const adjuntarMutation = useAdjuntarRecomendacionMutation();
  const { data: plantillasDisponibles = [] } = useGetPlantillas();
  const plantillasRecomendacion = plantillasDisponibles.filter(
    p => p.tipo === "Recomendacion"
  );
  const plantillaElegida =
    plantillasRecomendacion.find(p => p.id === plantillaId) ?? null;

  function reiniciarYCerrar() {
    setPaso("preguntar");
    setArchivo(null);
    setNombre("");
    setPlantillaId(null);
    setContenido({});
    setErrorMsg(null);
    setEnviado(null);
    onCerrar();
  }

  async function handleNoEnviar() {
    if (!citaId) return;
    try {
      await enviarMutation.mutateAsync({
        citaId,
        data: { enviar: false, tipo: "Estandar" },
      });
    } finally {
      reiniciarYCerrar();
    }
  }

  async function handleEstandar() {
    if (!citaId) return;
    setErrorMsg(null);
    try {
      const respuesta = await enviarMutation.mutateAsync({
        citaId,
        data: { enviar: true, tipo: "Estandar" },
      });
      setEnviado(respuesta.message ?? "Recomendación enviada.");
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  }

  async function handleAdjuntarPersonalizada() {
    if (!citaId || !archivo) return;
    setErrorMsg(null);
    try {
      const respuesta = await adjuntarMutation.mutateAsync({
        citaId,
        archivo,
        nombre: nombre.trim() || undefined,
      });
      setEnviado(respuesta.message ?? "Recomendación enviada.");
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  }

  async function handleEnviarPersonalizadaPlantilla() {
    if (!citaId || !plantillaId) return;
    setErrorMsg(null);
    try {
      const respuesta = await enviarMutation.mutateAsync({
        citaId,
        data: {
          enviar: true,
          tipo: "Personalizada",
          plantillaId,
          contenido,
        },
      });
      setEnviado(respuesta.message ?? "Recomendación enviada.");
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  }

  function handleCambiarCampo(campoId: string, valor: string) {
    setContenido(prev => ({ ...prev, [campoId]: valor }));
  }

  const enviando = enviarMutation.isPending || adjuntarMutation.isPending;

  return (
    <Modal
      abierto={Boolean(citaId)}
      onCerrar={reiniciarYCerrar}
      ancho={paso === "plantilla" ? "sm:max-w-2xl" : "sm:max-w-md"}
    >
      <div className="bg-white text-slate-900 font-sans p-6 space-y-4">
        {enviado ? (
          <>
            <p className="font-sans text-sm font-bold text-slate-900">
              {enviado}
            </p>
            <div className="flex justify-end">
              <Button onClick={reiniciarYCerrar}>Listo</Button>
            </div>
          </>
        ) : paso === "preguntar" ? (
          <>
            <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900">
              ¿Enviar una recomendación?
            </h3>
            <p className="font-sans text-xs text-slate-500">
              Se manda por correo al paciente. Si no respondés ahora, no se
              envía nada.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleNoEnviar}
                className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-2 border border-slate-200"
              >
                No
              </button>
              <Button onClick={() => setPaso("elegir")}>Sí</Button>
            </div>
          </>
        ) : paso === "elegir" ? (
          <>
            <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900">
              ¿Cuál recomendación?
            </h3>
            {errorMsg && <Alerta tono="error">{errorMsg}</Alerta>}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleEstandar}
                disabled={enviando}
                className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-3 border border-slate-200 hover:bg-slate-50 text-left"
              >
                La estándar del servicio
              </button>
              <button
                type="button"
                onClick={() => setPaso("personalizada")}
                className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-3 border border-slate-200 hover:bg-slate-50 text-left"
              >
                Personalizada
              </button>
            </div>
          </>
        ) : paso === "personalizada" ? (
          <>
            <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900">
              ¿Cómo se arma?
            </h3>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setPaso("plantilla")}
                className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-3 border border-slate-200 hover:bg-slate-50 text-left"
              >
                Completar una plantilla de recomendación
              </button>
              <button
                type="button"
                onClick={() => setPaso("adjuntar")}
                className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-3 border border-slate-200 hover:bg-slate-50 text-left"
              >
                Adjuntar un PDF
              </button>
            </div>
            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => setPaso("elegir")}
                className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-2 border border-slate-200"
              >
                Volver
              </button>
            </div>
          </>
        ) : paso === "plantilla" ? (
          <>
            <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900">
              Completar plantilla de recomendación
            </h3>
            {errorMsg && <Alerta tono="error">{errorMsg}</Alerta>}

            {plantillasRecomendacion.length === 0 ? (
              <p className="font-sans text-xs text-slate-500">
                No hay plantillas de recomendación creadas todavía.
              </p>
            ) : (
              <OptionSelector
                opciones={plantillasRecomendacion.map(p => ({
                  id: String(p.id),
                  titulo: p.nombre,
                }))}
                seleccionId={plantillaId === null ? null : String(plantillaId)}
                onSeleccionar={id => {
                  setPlantillaId(Number(id));
                  setContenido({});
                }}
                orientacion="horizontal"
              />
            )}

            {plantillaElegida && (
              <div className="max-h-[50vh] space-y-4 overflow-y-auto">
                {(plantillaElegida.cuerpo?.secciones ?? []).map(seccion => (
                  <CollapsibleSection key={seccion.id} titulo={seccion.nombre}>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {seccion.campos.map(campo => {
                        const comun = {
                          etiqueta: campo.nombre,
                          obligatorio: campo.obligatorio,
                          value: contenido[campo.id] ?? "",
                          onChange: (
                            e: React.ChangeEvent<
                              | HTMLInputElement
                              | HTMLTextAreaElement
                              | HTMLSelectElement
                            >
                          ) => handleCambiarCampo(campo.id, e.target.value),
                        };
                        if (campo.tipo === "TextoInformativo") {
                          return (
                            <p
                              key={campo.id}
                              className="sm:col-span-2 font-sans text-xs leading-relaxed text-slate-700 whitespace-pre-line"
                            >
                              {campo.nombre}
                            </p>
                          );
                        }
                        if (campo.tipo === "Numerico") {
                          return <NumberField key={campo.id} {...comun} />;
                        }
                        if (campo.tipo === "TextoLargo") {
                          return (
                            <div key={campo.id} className="sm:col-span-2">
                              <TextAreaField {...comun} />
                            </div>
                          );
                        }
                        if (campo.tipo === "Fecha") {
                          return (
                            <TextField key={campo.id} type="date" {...comun} />
                          );
                        }
                        if (campo.tipo === "Seleccion") {
                          return (
                            <SelectField key={campo.id} {...comun}>
                              <option value="">Seleccionar…</option>
                              {(campo.opciones ?? []).map(opcion => (
                                <option key={opcion} value={opcion}>
                                  {opcion}
                                </option>
                              ))}
                            </SelectField>
                          );
                        }
                        return <TextField key={campo.id} {...comun} />;
                      })}
                    </div>
                  </CollapsibleSection>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPaso("personalizada")}
                className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-2 border border-slate-200"
              >
                Volver
              </button>
              <Button
                onClick={handleEnviarPersonalizadaPlantilla}
                disabled={!plantillaId || enviando}
              >
                {enviando ? "Enviando…" : "Enviar"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900">
              Adjuntar recomendación personalizada
            </h3>
            {errorMsg && <Alerta tono="error">{errorMsg}</Alerta>}
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Nombre (opcional)"
              className="w-full rounded-none border border-slate-200 px-2.5 py-2 text-sm focus:border-slate-900 focus:outline-none"
            />
            <input
              type="file"
              accept="application/pdf"
              onChange={e => setArchivo(e.target.files?.[0] ?? null)}
              className="text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPaso("personalizada")}
                className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-2 border border-slate-200"
              >
                Volver
              </button>
              <Button
                onClick={handleAdjuntarPersonalizada}
                disabled={!archivo || enviando}
              >
                {enviando ? "Enviando…" : "Enviar"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
