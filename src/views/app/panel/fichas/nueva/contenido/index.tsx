"use client";

import { NeutralBadge } from "@/components/panel/primitives/Badge";
import { BottomActionBar } from "@/components/panel/primitives/BottomActionBar";
import {
  NumberField,
  TextAreaField,
  TextField,
} from "@/components/panel/primitives/CamposFormulario";
import { CollapsibleSection } from "@/components/panel/primitives/CollapsibleSection";
import { FileDropzone } from "@/components/panel/primitives/FileDropzone";
import { OptionSelector } from "@/components/panel/primitives/OptionSelector";
import { StepIndicator } from "@/components/panel/primitives/StepIndicator";
import { SummaryPanel } from "@/components/panel/primitives/SummaryPanel";
import { Button, Card } from "@/components/ui";
import {
  formatearFechaExtensa,
  formatearRangoHorario,
} from "@/lib/panel/domain/formato";

import { useNuevaFichaContenido } from "./hooks";

export default function NuevaFichaContenidoView() {
  const {
    hoy,
    pacienteNombre,
    citaId,
    formatoId,
    contenido,
    adjuntos,
    cita,
    formato,
    opcionesFormato,
    guardando,
    errorMsg,
    nombreFormato,
    actions,
  } = useNuevaFichaContenido();

  if (!hoy || !citaId) return <div aria-hidden />;

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
            onClick={actions.handleCerrarError}
            aria-label="Cerrar aviso de error"
            className="text-red-700 hover:text-red-950 font-bold px-2"
          >
            ✕
          </button>
        </div>
      )}

      <Card className="border border-border p-6">
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
            <Button onClick={actions.handleIrACrearFormato}>
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
              onSeleccionar={actions.setFormato}
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
                      ) => actions.handleCambiarCampo(campo.id, e),
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
                onAgregar={actions.agregarAdjunto}
                onQuitar={actions.quitarAdjunto}
              />
            </div>
          </div>
        )}

        <BottomActionBar
          abandono={
            <button
              type="button"
              onClick={actions.handleCancelar}
              className="font-sans text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </button>
          }
          volver={
            <Button variant="outline" onClick={actions.handleVolver}>
              Volver
            </Button>
          }
          avanzar={
            <Button
              disabled={!formato || guardando}
              onClick={actions.handleGuardar}
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
