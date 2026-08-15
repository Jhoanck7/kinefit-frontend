"use client";

import { UsageBadge } from "@/components/panel/primitives/Badge";
import { EmptyState } from "@/components/panel/primitives/EmptyState";
import { Button, Card } from "@/components/ui";
import { formatearFechaExtensa } from "@/lib/panel/domain/formato";

import { useFormatos } from "./hooks";

export default function FormatosView() {
  const { hoy, formatos, actions } = useFormatos();

  if (!hoy || formatos === null) return <div aria-hidden />;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <button
        type="button"
        onClick={actions.handleVolver}
        className="mb-2 flex items-center gap-1 text-sm text-panel-sidebar underline underline-offset-2"
      >
        ← Volver a Fichas clínicas
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-panel-sidebar">
            Formatos de ficha
          </h2>
          <p className="text-sm text-brand-muted">
            Define la estructura de campos que tendrá cada tipo de ficha
            clínica.
          </p>
        </div>
        <Button onClick={actions.handleNuevoFormato}>Nuevo formato</Button>
      </div>

      {formatos.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            titulo="Sin formatos registrados"
            descripcion="Aún no se ha creado ningún formato de ficha clínica en el sistema."
            accion={
              <Button onClick={actions.handleNuevoFormato}>
                Crear primer formato
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {formatos.map(formato => {
            const totalCampos = formato.secciones.reduce(
              (acc, s) => acc + s.campos.length,
              0
            );
            return (
              <Card key={formato.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-panel-sidebar">
                        {formato.nombre}
                      </p>
                      {formato.fichasCreadas > 0 && (
                        <UsageBadge>
                          En uso · {formato.fichasCreadas} fichas
                        </UsageBadge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-brand-muted">
                      {formato.secciones.length} secciones · {totalCampos}{" "}
                      campos · Modificado{" "}
                      {formatearFechaExtensa(formato.modificadoEn)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => actions.handleEditarFormato(formato.id)}
                    >
                      Editar
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
