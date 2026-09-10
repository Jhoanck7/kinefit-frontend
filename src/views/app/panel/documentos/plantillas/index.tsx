"use client";

import { EmptyState } from "@/components/shared";
import { Button, Card } from "@/components/ui";
import { formatearFechaExtensa } from "@/lib/formato";

import { usePlantillas } from "./hooks";

export default function PlantillasView() {
  const { plantillas, actions } = usePlantillas();

  if (!plantillas) return <div aria-hidden />;

  return (
    <div className="mx-auto max-w-5xl space-y-4 font-sans shadow-none">
      <button
        type="button"
        onClick={actions.handleVolver}
        className="mb-2 font-sans text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900"
      >
        ← Volver a Documentos
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900">
            Plantillas
          </h2>
          <p className="font-sans text-xs text-slate-500 mt-0.5">
            Define la estructura de campos que tendrá cada tipo de documento
            clínico. Los consentimientos y recomendaciones solo se generan en
            las citas de los servicios donde estén asignados, desde
            Configuración → Servicios.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={actions.handleNuevaPlantilla}>
            Nueva plantilla
          </Button>
        </div>
      </div>

      {plantillas.length === 0 ? (
        <Card className="rounded-none border-slate-200 shadow-none p-8">
          <EmptyState
            titulo="Sin plantillas registradas"
            descripcion="Aún no se ha creado ninguna plantilla en el sistema."
            accion={
              <Button onClick={actions.handleNuevaPlantilla}>
                Crear primera plantilla
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="border border-slate-200 rounded-none bg-white divide-y divide-slate-200">
          {plantillas.map(plantilla => {
            const secciones = plantilla.cuerpo?.secciones ?? [];
            const totalCampos = secciones.reduce(
              (acc, s) => acc + s.campos.length,
              0
            );
            const estructura =
              plantilla.origen === "Documento"
                ? "Documento cargado"
                : `${secciones.length} secciones · ${totalCampos} campos`;
            return (
              <div
                key={plantilla.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-sans font-bold text-sm text-slate-900">
                      {plantilla.nombre}
                    </p>
                    <span className="font-sans text-[11px] font-medium uppercase tracking-wider text-slate-500">
                      {plantilla.tipoNombre}
                    </span>
                    {plantilla.documentosAsociados > 0 && (
                      <span className="flex items-center gap-1.5">
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-emerald-700"
                          aria-hidden
                        />
                        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                          En uso · {plantilla.documentosAsociados} documentos
                        </span>
                      </span>
                    )}
                    {plantilla.tipo !== "FichaClinica" &&
                      plantilla.serviciosAsignados === 0 &&
                      plantilla.activo && (
                        <span className="flex items-center gap-1.5">
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-amber-500"
                            aria-hidden
                          />
                          <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-amber-700">
                            Sin servicios asignados
                          </span>
                        </span>
                      )}
                    {!plantilla.activo && (
                      <span className="flex items-center gap-1.5">
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-slate-400"
                          aria-hidden
                        />
                        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Inactivo
                        </span>
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-sans text-xs text-slate-500">
                    {estructura} · Modificado{" "}
                    {formatearFechaExtensa(new Date(plantilla.updatedAt))}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => actions.handleEditarPlantilla(plantilla.id)}
                >
                  Editar
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
