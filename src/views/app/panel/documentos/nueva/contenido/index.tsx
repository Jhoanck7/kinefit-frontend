"use client";

import {
  Alerta,
  BottomActionBar,
  CollapsibleSection,
  FileDropzone,
  NumberField,
  OptionSelector,
  SelectField,
  StepIndicator,
  SummaryPanel,
  TextAreaField,
  TextField,
} from "@/components/shared";
import { Badge, Button, Card } from "@/components/ui";
import { contadorDeSeccion } from "@/lib/documento-contenido";
import { formatearFechaExtensa, formatearRangoHorario } from "@/lib/formato";

import { useNuevaFichaContenido } from "./hooks";

export default function NuevaFichaContenidoView() {
  const {
    pacienteNombre,
    citaId,
    plantillaId,
    contenido,
    adjuntos,
    cita,
    plantilla,
    opcionesPlantilla,
    modo,
    archivoFicha,
    nombreArchivoFicha,
    guardando,
    errorMsg,
    nombrePlantilla,
    actions,
  } = useNuevaFichaContenido();

  if (!citaId) return <div aria-hidden />;

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-[1fr_320px] font-sans shadow-none">
      <div className="sm:col-span-2">
        <StepIndicator
          pasos={[{ etiqueta: "Reserva" }, { etiqueta: "Ficha" }]}
          pasoActivo={2}
        />
      </div>

      {errorMsg && (
        <Alerta
          tono="error"
          className="sm:col-span-2 flex items-start justify-between"
        >
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={actions.handleCerrarError}
            className="text-white hover:text-white/70 font-bold text-xs px-2"
          >
            Cerrar
          </button>
        </Alerta>
      )}

      <Card className="border border-border p-6">
        <Alerta tono="info" className="mb-4">
          Contenido privado. No visible para el paciente.
        </Alerta>

        <h2 className="mb-4 font-sans text-section-title font-bold text-foreground">
          Completa la Ficha Clínica
        </h2>

        <div className="mb-6 flex gap-2 border-b border-slate-200 pb-4">
          <button
            type="button"
            onClick={() => actions.handleCambiarModo("plantilla")}
            className={`rounded-overlay font-sans text-xs font-bold px-3 py-1.5 border ${
              modo === "plantilla"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 text-slate-600"
            }`}
          >
            Con Plantilla del Sistema
          </button>
          <button
            type="button"
            onClick={() => actions.handleCambiarModo("archivo")}
            className={`rounded-overlay font-sans text-xs font-bold px-3 py-1.5 border ${
              modo === "archivo"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 text-slate-600"
            }`}
          >
            La Ficha ya Está Hecha
          </button>
        </div>

        {modo === "archivo" ? (
          <div className="mb-6 space-y-4">
            <TextField
              etiqueta="Nombre de la ficha"
              placeholder="Ej: Evaluación kinesiológica inicial"
              value={nombreArchivoFicha}
              onChange={e => actions.setNombreArchivoFicha(e.target.value)}
            />
            <div>
              <p className="mb-2 font-sans text-label font-bold text-muted-foreground">
                Archivo de la Ficha (PDF)
              </p>
              <input
                type="file"
                accept="application/pdf"
                onChange={e =>
                  actions.setArchivoFicha(e.target.files?.[0] ?? null)
                }
                className="text-xs"
              />
              {archivoFicha && (
                <p className="mt-1 font-sans text-xs text-slate-600">
                  {archivoFicha.name}
                </p>
              )}
            </div>
          </div>
        ) : opcionesPlantilla.length === 0 ? (
          <div className="mb-6 border border-slate-200 bg-slate-50 p-6 text-center space-y-3 rounded-none">
            <p className="font-sans text-xs font-bold text-foreground">
              No Tienes Plantillas de Ficha Creadas
            </p>
            <p className="font-sans text-xs text-slate-500">
              Crea tu primera plantilla de ficha clínica para personalizar las
              evaluaciones de tus pacientes.
            </p>
            <Button onClick={actions.handleIrACrearPlantilla}>
              Crear Plantilla de Ficha
            </Button>
          </div>
        ) : (
          <div className="mb-6">
            <p className="mb-2 font-sans text-label font-bold text-muted-foreground">
              Seleccionar Plantilla de Ficha
            </p>
            <OptionSelector
              opciones={opcionesPlantilla}
              seleccionId={plantillaId === null ? null : String(plantillaId)}
              onSeleccionar={actions.handleSeleccionarPlantilla}
              orientacion="horizontal"
            />
          </div>
        )}

        {modo === "plantilla" && plantilla && (
          <div className="space-y-4">
            {(plantilla.cuerpo?.secciones ?? []).map(seccion => (
              <CollapsibleSection
                key={seccion.id}
                titulo={seccion.nombre}
                contador={contadorDeSeccion(seccion, contenido)}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {seccion.campos.map(campo => {
                    const quienCompleta =
                      campo.completadoPor === "Paciente"
                        ? "Lo completa el paciente"
                        : "Lo completa la profesional";
                    const comun = {
                      etiqueta: campo.nombre,
                      obligatorio: campo.obligatorio,
                      ayuda: [campo.ayuda, quienCompleta]
                        .filter(Boolean)
                        .join(" · "),
                      value: contenido[campo.id] ?? "",
                      onChange: (
                        e: React.ChangeEvent<
                          | HTMLInputElement
                          | HTMLTextAreaElement
                          | HTMLSelectElement
                        >
                      ) => actions.handleCambiarCampo(campo.id, e),
                    };
                    // El texto informativo es el articulado del documento: se lee, no se llena.
                    if (campo.tipo === "TextoInformativo") {
                      return (
                        <p
                          key={campo.id}
                          className="sm:col-span-3 font-sans text-xs leading-relaxed text-slate-700 whitespace-pre-line"
                        >
                          {campo.nombre}
                        </p>
                      );
                    }
                    if (campo.tipo === "Firma") {
                      return (
                        <div key={campo.id} className="sm:col-span-3">
                          <span className="font-sans text-label font-medium text-muted-foreground block mb-1">
                            {campo.nombre}
                          </span>
                          <div className="rounded-none border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center font-sans text-xs text-slate-500">
                            Se firma aparte, no se completa desde acá
                          </div>
                        </div>
                      );
                    }
                    if (campo.tipo === "Numerico") {
                      return <NumberField key={campo.id} {...comun} />;
                    }
                    if (campo.tipo === "TextoLargo") {
                      return (
                        <div key={campo.id} className="sm:col-span-3">
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

            <div className="pt-2">
              <p className="mb-2 font-sans text-label font-bold text-muted-foreground">
                Archivos Adjuntos
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
              className="font-sans text-xs font-bold text-muted-foreground hover:text-foreground"
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
              disabled={
                guardando || (modo === "plantilla" ? !plantilla : !archivoFicha)
              }
              onClick={actions.handleGuardar}
            >
              {guardando ? "Guardando..." : "Guardar Ficha"}
            </Button>
          }
        />
      </Card>

      <SummaryPanel
        filas={[
          { etiqueta: "Paciente", valor: pacienteNombre ?? undefined },
          {
            etiqueta: "Fecha y Hora",
            valor: cita
              ? `${formatearFechaExtensa(new Date(`${cita.fecha}T00:00:00`))} | ${formatearRangoHorario(cita.horaInicio, cita.horaFin)}`
              : undefined,
          },
          {
            etiqueta: "Tipo de Ficha",
            valor: nombrePlantilla ? (
              <Badge className="rounded-overlay border-0 bg-slate-700 text-table-head font-medium text-white">
                {nombrePlantilla}
              </Badge>
            ) : undefined,
          },
        ]}
      />
    </div>
  );
}
