"use client";

import { Alerta, EmptyState, Modal, SwitchField } from "@/components/shared";
import { Badge, Button, Card } from "@/components/ui";
import { formatearFechaExtensa } from "@/lib/formato";

import { usePlantillas } from "./hooks";

export default function PlantillasView() {
  const {
    plantillas,
    errorEstado,
    actualizandoEstadoId,
    plantillaAEliminar,
    errorEliminar,
    eliminando,
    actions,
  } = usePlantillas();

  if (!plantillas) return <div aria-hidden />;

  return (
    <div className="mx-auto max-w-5xl space-y-4 font-sans shadow-none">
      <button
        type="button"
        onClick={actions.handleVolver}
        className="mb-2 font-sans text-xs font-bold text-muted-foreground hover:text-foreground"
      >
        Volver a Documentos
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-sans text-section-title font-bold text-foreground">
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
          <Button
            className="rounded-overlay"
            onClick={actions.handleNuevaPlantilla}
          >
            Nueva Plantilla
          </Button>
        </div>
      </div>

      {errorEstado && <Alerta tono="error">{errorEstado}</Alerta>}

      {plantillas.length === 0 ? (
        <Card className="rounded-none border-slate-200 shadow-none p-8">
          <EmptyState
            titulo="Sin Plantillas Registradas"
            descripcion="Aún no se ha creado ninguna plantilla en el sistema."
            accion={
              <Button
                className="rounded-overlay"
                onClick={actions.handleNuevaPlantilla}
              >
                Crear Primera Plantilla
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
                : `${secciones.length} secciones, ${totalCampos} campos`;
            return (
              <div
                key={plantilla.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-sans font-bold text-value text-foreground">
                      {plantilla.nombre}
                    </p>
                    <span className="font-sans text-label font-medium text-muted-foreground">
                      {plantilla.tipoNombre}
                    </span>
                    {plantilla.documentosAsociados > 0 && (
                      <Badge className="rounded-overlay border-0 bg-emerald-700 text-[10px] font-medium text-white">
                        En Uso, {plantilla.documentosAsociados}{" "}
                        {plantilla.documentosAsociados === 1
                          ? "Documento"
                          : "Documentos"}
                      </Badge>
                    )}
                    {plantilla.tipo !== "FichaClinica" &&
                      plantilla.serviciosAsignados === 0 &&
                      plantilla.activo && (
                        <Badge className="rounded-overlay border-0 bg-amber-600 text-[10px] font-medium text-white">
                          Sin Servicios Asignados
                        </Badge>
                      )}
                  </div>
                  <p className="mt-1 font-sans text-xs text-slate-500">
                    {estructura}, Modificado{" "}
                    {formatearFechaExtensa(new Date(plantilla.updatedAt))}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <SwitchField
                      etiqueta={plantilla.activo ? "Activo" : "Inactivo"}
                      checked={plantilla.activo}
                      onChange={() => actions.handleToggleEstado(plantilla)}
                    />
                    {actualizandoEstadoId === plantilla.id && (
                      <span className="text-table-head text-slate-400">
                        Guardando…
                      </span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-overlay"
                    onClick={() => actions.handleEditarPlantilla(plantilla.id)}
                  >
                    Editar
                  </Button>
                  {plantilla.documentosAsociados === 0 ? (
                    <Button
                      variant="outline"
                      className="rounded-overlay text-rose-700"
                      onClick={() =>
                        actions.handleSolicitarEliminacion(plantilla)
                      }
                    >
                      Eliminar
                    </Button>
                  ) : (
                    <span className="font-sans text-table-head text-slate-400">
                      En uso: desactivar en lugar de eliminar
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        abierto={Boolean(plantillaAEliminar)}
        onCerrar={actions.handleCancelarEliminacion}
      >
        <div className="p-6">
          <h3 className="font-sans text-section-title font-bold text-foreground">
            ¿Eliminar esta plantilla?
          </h3>
          <p className="mt-2 font-sans text-xs text-slate-500">
            Se eliminará &ldquo;{plantillaAEliminar?.nombre}&rdquo;. Todavía no
            se generó ningún documento con ella, así que no queda nada sin su
            formato de origen.
          </p>
          {errorEliminar && (
            <Alerta tono="error" className="mt-4">
              {errorEliminar}
            </Alerta>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              className="rounded-overlay"
              onClick={actions.handleCancelarEliminacion}
              disabled={eliminando}
            >
              Volver
            </Button>
            <Button
              variant="destructive"
              className="rounded-overlay"
              onClick={actions.handleConfirmarEliminacion}
              disabled={eliminando}
            >
              {eliminando ? "Eliminando…" : "Sí, Eliminar"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
