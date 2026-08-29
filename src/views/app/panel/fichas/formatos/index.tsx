"use client";

import { Alerta, EmptyState } from "@/components/shared";
import { Button, Card } from "@/components/ui";
import { formatearFechaExtensa } from "@/lib/formato";

import { useFormatos } from "./hooks";

export default function FormatosView() {
  const { formatos, puedeMigrar, migrando, avisoMigracion, actions } =
    useFormatos();

  if (!formatos) return <div aria-hidden />;

  return (
    <div className="mx-auto max-w-5xl space-y-4 font-sans shadow-none">
      <button
        type="button"
        onClick={actions.handleVolver}
        className="mb-2 font-sans text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900"
      >
        ← Volver a Fichas Clínicas
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900">
            Formatos de ficha
          </h2>
          <p className="font-sans text-xs text-slate-500 mt-0.5">
            Define la estructura de campos que tendrá cada tipo de ficha
            clínica.
          </p>
        </div>
        <Button onClick={actions.handleNuevoFormato}>Nuevo formato</Button>
      </div>

      {avisoMigracion && <Alerta tono="info">{avisoMigracion}</Alerta>}

      {puedeMigrar && (
        <Card className="rounded-none border-slate-200 shadow-none p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-sans text-xs font-bold uppercase tracking-wider text-slate-900">
              Formatos guardados en este navegador
            </p>
            <p className="font-sans text-xs text-slate-500 mt-0.5">
              Quedaron de antes de que los formatos se guardaran en el servidor.
              Impórtalos una vez, desde el navegador donde los creaste.
            </p>
          </div>
          <Button
            variant="outline"
            disabled={migrando}
            onClick={actions.handleMigrarFormatosLocales}
          >
            {migrando ? "Importando..." : "Importar a mi cuenta"}
          </Button>
        </Card>
      )}

      {formatos.length === 0 ? (
        <Card className="rounded-none border-slate-200 shadow-none p-8">
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
        <div className="border border-slate-200 rounded-none bg-white divide-y divide-slate-200">
          {formatos.map(formato => {
            const secciones = formato.cuerpo?.secciones ?? [];
            const totalCampos = secciones.reduce(
              (acc, s) => acc + s.campos.length,
              0
            );
            const estructura =
              formato.origen === "Documento"
                ? "Documento cargado"
                : `${secciones.length} secciones · ${totalCampos} campos`;
            return (
              <div
                key={formato.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-sans font-bold text-sm text-slate-900">
                      {formato.nombre}
                    </p>
                    <span className="font-sans text-[11px] font-medium uppercase tracking-wider text-slate-500">
                      {formato.tipoNombre}
                    </span>
                    {formato.fichasAsociadas > 0 && (
                      <span className="flex items-center gap-1.5">
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-emerald-700"
                          aria-hidden
                        />
                        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                          En uso · {formato.fichasAsociadas} fichas
                        </span>
                      </span>
                    )}
                    {!formato.activo && (
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
                    {formatearFechaExtensa(new Date(formato.updatedAt))}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => actions.handleEditarFormato(formato.id)}
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
