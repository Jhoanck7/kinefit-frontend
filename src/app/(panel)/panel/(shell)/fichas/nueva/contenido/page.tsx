"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHoyPanel } from "@/lib/panel/reloj";
import { useNuevaFichaStore } from "@/lib/store/useNuevaFichaStore";
import { getCita, CitaResuelta } from "@/lib/panel/data/citas";
import { getFormato, FormatoResuelto } from "@/lib/panel/data/formatos";
import { formatearFechaExtensa, formatearRangoHorario } from "@/lib/panel/domain/formato";
import { Card } from "@/components/panel/primitives/Card";
import { Button } from "@/components/panel/primitives/Button";
import { SummaryPanel } from "@/components/panel/primitives/SummaryPanel";
import { StepIndicator } from "@/components/panel/primitives/StepIndicator";
import { BottomActionBar } from "@/components/panel/primitives/BottomActionBar";
import { OptionSelector } from "@/components/panel/primitives/OptionSelector";
import { CollapsibleSection } from "@/components/panel/primitives/CollapsibleSection";
import { TextField, NumberField, TextAreaField } from "@/components/panel/primitives/CamposFormulario";
import { FileDropzone } from "@/components/panel/primitives/FileDropzone";
import { NeutralBadge } from "@/components/panel/primitives/Badge";
import { SimulatedActionNotice } from "@/components/panel/primitives/SimulatedActionNotice";

const OPCIONES_FORMATO = [
  { id: "fmt-masoterapia", titulo: "Masoterapia" },
  { id: "fmt-kinesiologia", titulo: "Kinesiología" },
];

export default function NuevaFichaContenidoPage() {
  const router = useRouter();
  const hoy = useHoyPanel();
  const { pacienteNombre, citaId, formatoId, contenido, adjuntos, setFormato, setCampo, agregarAdjunto, quitarAdjunto, reiniciar } =
    useNuevaFichaStore();

  const [cita, setCita] = useState<CitaResuelta | null>(null);
  const [formato, setFormatoResuelto] = useState<FormatoResuelto | null>(null);
  const [guardada, setGuardada] = useState(false);

  useEffect(() => {
    if (!hoy) return;
    if (!citaId) {
      router.replace("/panel/fichas/nueva/reserva");
      return;
    }
    getCita(citaId, hoy).then((resultado) => setCita(resultado ?? null));
  }, [citaId, hoy, router]);

  useEffect(() => {
    if (!hoy || !formatoId) {
      return;
    }
    getFormato(formatoId, hoy).then((resultado) => setFormatoResuelto(resultado ?? null));
  }, [formatoId, hoy]);

  if (!hoy || !citaId) return <div aria-hidden />;

  const nombreFormato = OPCIONES_FORMATO.find((o) => o.id === formatoId)?.titulo;

  function alGuardar() {
    setGuardada(true);
  }

  function alTerminar() {
    reiniciar();
    router.push("/panel/fichas");
  }

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-[1fr_320px]">
      <div className="sm:col-span-2">
        <StepIndicator pasos={[{ etiqueta: "Reserva" }, { etiqueta: "Ficha" }]} pasoActivo={2} />
      </div>

      <Card>
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-panel-seleccion p-3 text-xs text-panel-sidebar">
          Contenido privado. No visible para el paciente.
        </div>

        <h2 className="mb-4 text-lg font-bold text-panel-sidebar">Completa la ficha clínica</h2>

        <div className="mb-6">
          <p className="mb-2 text-sm font-medium text-panel-sidebar">Tipo de ficha</p>
          <OptionSelector opciones={OPCIONES_FORMATO} seleccionId={formatoId} onSeleccionar={setFormato} orientacion="horizontal" />
        </div>

        {formato && (
          <div className="space-y-4">
            {formato.secciones.map((seccion) => (
              <CollapsibleSection
                key={seccion.id}
                titulo={seccion.nombre}
                contador={`${seccion.campos.filter((c) => contenido[c.id]?.trim()).length}/${seccion.campos.length} completados`}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {seccion.campos.map((campo) => {
                    const comun = {
                      etiqueta: campo.nombre,
                      obligatorio: campo.obligatorio,
                      ayuda: campo.ayuda,
                      placeholder: campo.placeholder,
                      value: contenido[campo.id] ?? "",
                      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                        setCampo(campo.id, e.target.value),
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

            <div>
              <p className="mb-2 text-sm font-medium text-panel-sidebar">Archivos adjuntos</p>
              <FileDropzone archivos={adjuntos} onAgregar={agregarAdjunto} onQuitar={quitarAdjunto} />
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
              className="text-sm text-panel-sidebar underline underline-offset-2"
            >
              Cancelar
            </button>
          }
          volver={
            <Button variante="secundario" onClick={() => router.push("/panel/fichas/nueva/reserva")}>
              Volver
            </Button>
          }
          avanzar={
            <Button variante="primario" disabled={!formato} onClick={alGuardar}>
              Guardar ficha
            </Button>
          }
        />
      </Card>

      <SummaryPanel
        filas={[
          { etiqueta: "PACIENTE", valor: pacienteNombre ?? undefined },
          {
            etiqueta: "FECHA Y HORA",
            valor: cita ? `${formatearFechaExtensa(cita.fecha)} · ${formatearRangoHorario(cita.horaInicio, cita.horaTermino)}` : undefined,
          },
          { etiqueta: "TIPO DE FICHA", valor: nombreFormato ? <NeutralBadge>{nombreFormato}</NeutralBadge> : undefined },
        ]}
      />

      <SimulatedActionNotice
        abierto={guardada}
        onCerrar={alTerminar}
        titulo="Ficha guardada"
        descripcion="La ficha clínica quedó registrada junto a la reserva del paciente."
      />
    </div>
  );
}
