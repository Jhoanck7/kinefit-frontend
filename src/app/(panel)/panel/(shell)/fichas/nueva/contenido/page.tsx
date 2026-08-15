"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { NeutralBadge } from "@/components/panel/primitives/Badge";
import { BottomActionBar } from "@/components/panel/primitives/BottomActionBar";
import { Button } from "@/components/panel/primitives/Button";
import {
  NumberField,
  TextAreaField,
  TextField,
} from "@/components/panel/primitives/CamposFormulario";
import { Card } from "@/components/panel/primitives/Card";
import { CollapsibleSection } from "@/components/panel/primitives/CollapsibleSection";
import { FileDropzone } from "@/components/panel/primitives/FileDropzone";
import { OptionSelector } from "@/components/panel/primitives/OptionSelector";
import { StepIndicator } from "@/components/panel/primitives/StepIndicator";
import { SummaryPanel } from "@/components/panel/primitives/SummaryPanel";
import { CitaResuelta, getCita } from "@/lib/panel/data/citas";
import {
  FormatoResuelto,
  getFormato,
  listFormatos,
} from "@/lib/panel/data/formatos";
import {
  formatearFechaExtensa,
  formatearRangoHorario,
} from "@/lib/panel/domain/formato";
import { useHoyPanel } from "@/lib/panel/reloj";
import { fichaService } from "@/lib/services/ficha.service";
import { useNuevaFichaStore } from "@/lib/store/useNuevaFichaStore";

export default function NuevaFichaContenidoPage() {
  const router = useRouter();
  const hoy = useHoyPanel();
  const {
    pacienteNombre,
    citaId,
    formatoId,
    contenido,
    adjuntos,
    setFormato,
    setCampo,
    agregarAdjunto,
    quitarAdjunto,
    reiniciar,
  } = useNuevaFichaStore();

  const [cita, setCita] = useState<CitaResuelta | null>(null);
  const [formato, setFormatoResuelto] = useState<FormatoResuelto | null>(null);
  const [formatosDisponibles, setFormatosDisponibles] = useState<
    FormatoResuelto[]
  >([]);
  const [opcionesFormato, setOpcionesFormato] = useState<
    { id: string; titulo: string }[]
  >([]);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!citaId || !hoy) return;
    getCita(citaId, hoy).then(c => {
      if (c) {
        setCita(c);
      }
    });
  }, [citaId, hoy]);

  useEffect(() => {
    if (!hoy) return;
    listFormatos(hoy).then(lista => {
      setFormatosDisponibles(lista);
      const opciones = lista.map(f => ({ id: f.id, titulo: f.nombre }));
      setOpcionesFormato(opciones);
      if (lista.length > 0 && !formatoId) {
        setFormato(lista[0].id);
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoy]);

  useEffect(() => {
    if (!formatoId) {
      setFormatoResuelto(null);
      return;
    }
    const hallado = formatosDisponibles.find(f => f.id === formatoId);
    if (hallado) {
      setFormatoResuelto(hallado);
    } else if (hoy) {
      getFormato(formatoId, hoy).then(resultado =>
        setFormatoResuelto(resultado ?? null)
      );
    }
  }, [formatoId, formatosDisponibles, hoy]);

  if (!hoy || !citaId) return <div aria-hidden />;

  const nombreFormato =
    opcionesFormato.find(o => o.id === formatoId)?.titulo || formato?.nombre;

  async function alGuardar() {
    if (!citaId || !formatoId) return;

    setGuardando(true);
    setErrorMsg(null);

    try {
      const numCitaId = parseInt(citaId.replace(/\D/g, ""), 10) || 1;

      const creada = await fichaService.create({
        citaId: numCitaId,
        tipo:
          formatoId === "fmt-masoterapia" ? "Recomendacion" : "FichaClinica",
        contenido: (contenido as Record<string, string>) || {},
      });

      // Subir adjuntos si existen
      if (adjuntos && adjuntos.length > 0) {
        for (const nombreArch of adjuntos) {
          try {
            const dummyFile = new File(["contenido"], nombreArch, {
              type: "text/plain",
            });
            await fichaService.subirAdjunto(creada.id, dummyFile);
          } catch {
            // Ignorar fallo individual
          }
        }
      }

      reiniciar();
      router.push("/panel/fichas");
    } catch (err: unknown) {
      console.error("Error al guardar la ficha clínica en Backend:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Ocurrió un error al guardar la ficha en el backend.";
      setErrorMsg(msg);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-[1fr_320px] font-sans shadow-none">
      <div className="sm:col-span-2">
        <StepIndicator
          pasos={[{ etiqueta: "Reserva" }, { etiqueta: "Ficha" }]}
          pasoActivo={2}
        />
      </div>

      {errorMsg && (
        <div className="sm:col-span-2 flex items-start justify-between border border-red-300 bg-red-50 p-4 text-xs font-semibold text-red-800 rounded-none">
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            aria-label="Cerrar aviso de error"
            className="text-red-700 hover:text-red-950 font-bold px-2"
          >
            ✕
          </button>
        </div>
      )}

      <Card className="rounded-none border-slate-200 shadow-none p-6">
        <div className="mb-4 flex items-center gap-2 border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700 rounded-none">
          Contenido privado. No visible para el paciente.
        </div>

        <h2 className="mb-4 font-sans text-sm font-bold uppercase tracking-wider text-slate-900">
          Completa la ficha clínica
        </h2>

        {opcionesFormato.length === 0 ? (
          <div className="mb-6 border border-slate-200 bg-slate-50 p-6 text-center space-y-3 rounded-none">
            <p className="font-sans text-xs font-bold uppercase tracking-wider text-slate-900">
              No tienes formatos de ficha creados
            </p>
            <p className="font-sans text-xs text-slate-500">
              Crea tu primer formato de ficha clínica para personalizar las
              evaluaciones de tus pacientes.
            </p>
            <Button
              variante="primario"
              onClick={() => router.push("/panel/fichas/formatos/nuevo")}
            >
              Crear formato de ficha
            </Button>
          </div>
        ) : (
          <div className="mb-6">
            <p className="mb-2 font-sans text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Seleccionar formato de ficha
            </p>
            <OptionSelector
              opciones={opcionesFormato}
              seleccionId={formatoId}
              onSeleccionar={setFormato}
              orientacion="horizontal"
            />
          </div>
        )}

        {formato && (
          <div className="space-y-4">
            {formato.secciones.map(seccion => (
              <CollapsibleSection
                key={seccion.id}
                titulo={seccion.nombre}
                contador={`${seccion.campos.filter(c => (contenido[c.id] ?? "").trim()).length}/${seccion.campos.length} completados`}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {seccion.campos.map(campo => {
                    const comun = {
                      etiqueta: campo.nombre,
                      obligatorio: campo.obligatorio,
                      ayuda: campo.ayuda,
                      placeholder: campo.placeholder,
                      value: contenido[campo.id] ?? "",
                      onChange: (
                        e: React.ChangeEvent<
                          HTMLInputElement | HTMLTextAreaElement
                        >
                      ) => setCampo(campo.id, e.target.value),
                    };
                    if (campo.tipo === "numerico") {
                      return <NumberField key={campo.id} {...comun} />;
                    }
                    if (campo.tipo === "texto_largo") {
                      return (
                        <div key={campo.id} className="sm:col-span-3">
                          <TextAreaField {...comun} />
                        </div>
                      );
                    }
                    return <TextField key={campo.id} {...comun} />;
                  })}
                </div>
              </CollapsibleSection>
            ))}

            <div className="pt-2">
              <p className="mb-2 font-sans text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Archivos adjuntos
              </p>
              <FileDropzone
                archivos={adjuntos}
                onAgregar={agregarAdjunto}
                onQuitar={quitarAdjunto}
              />
            </div>
          </div>
        )}

        <BottomActionBar
          abandono={
            <button
              type="button"
              onClick={() => {
                reiniciar();
                router.push("/panel/fichas");
              }}
              className="font-sans text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </button>
          }
          volver={
            <Button
              variante="secundario"
              onClick={() => router.push("/panel/fichas/nueva/reserva")}
            >
              Volver
            </Button>
          }
          avanzar={
            <Button
              variante="primario"
              disabled={!formato || guardando}
              onClick={alGuardar}
            >
              {guardando ? "Guardando..." : "Guardar ficha"}
            </Button>
          }
        />
      </Card>

      <SummaryPanel
        filas={[
          { etiqueta: "PACIENTE", valor: pacienteNombre ?? undefined },
          {
            etiqueta: "FECHA Y HORA",
            valor: cita
              ? `${formatearFechaExtensa(cita.fecha)} · ${formatearRangoHorario(cita.horaInicio, cita.horaTermino)}`
              : undefined,
          },
          {
            etiqueta: "TIPO DE FICHA",
            valor: nombreFormato ? (
              <NeutralBadge>{nombreFormato}</NeutralBadge>
            ) : undefined,
          },
        ]}
      />
    </div>
  );
}
