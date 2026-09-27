import Link from "next/link";

import { Alerta } from "@/components/shared";
import { ServicioDocumentoInput } from "@/models/requests";
import { PlantillaResponse } from "@/models/responses";

interface DocumentosServicioSelectorProps {
  plantillas: PlantillaResponse[];
  documentos: ServicioDocumentoInput[];
  onCambiar: (documentos: ServicioDocumentoInput[]) => void;
}

export function DocumentosServicioSelector({
  plantillas,
  documentos,
  onCambiar,
}: DocumentosServicioSelectorProps) {
  const porPlantillaId = new Map(documentos.map(d => [d.plantillaId, d]));

  const tipoDe = (plantillaId: number) =>
    plantillas.find(p => p.id === plantillaId)?.tipo;

  const esConsentimiento = (plantillaId: number) =>
    tipoDe(plantillaId) === "Consentimiento";

  const toggle = (plantillaId: number) => {
    if (porPlantillaId.has(plantillaId)) {
      onCambiar(documentos.filter(d => d.plantillaId !== plantillaId));
      return;
    }
    // Cada cita admite un solo consentimiento, así que marcar uno reemplaza al
    // anterior en vez de sumarse.
    const conservados = esConsentimiento(plantillaId)
      ? documentos.filter(d => !esConsentimiento(d.plantillaId))
      : documentos;
    onCambiar([
      ...conservados,
      {
        plantillaId,
        obligatorio: true,
        // Una recomendación solo se encuentra como la estándar del servicio si
        // quedó en AlFinalizarAtencion: con el otro momento se guardaba, pero
        // al cerrar la atención el sistema respondía que no había ninguna.
        momento:
          tipoDe(plantillaId) === "Recomendacion"
            ? "AlFinalizarAtencion"
            : "TrasConfirmarReserva",
      },
    ]);
  };

  const actualizar = (
    plantillaId: number,
    cambios: Partial<ServicioDocumentoInput>
  ) => {
    onCambiar(
      documentos.map(d =>
        d.plantillaId === plantillaId ? { ...d, ...cambios } : d
      )
    );
  };

  if (plantillas.length === 0) {
    return (
      <p className="font-sans text-xs text-slate-500">
        No hay plantillas creadas todavía.{" "}
        <Link
          href="/panel/documentos/plantillas/nuevo"
          className="font-bold text-foreground underline"
        >
          Crear una
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {plantillas.some(p => p.tipo === "Consentimiento") && (
        <Alerta tono="info">
          Un servicio puede exigir un solo consentimiento: al marcar uno se
          reemplaza el anterior. Las fichas y recomendaciones no tienen ese
          límite.
        </Alerta>
      )}
      <div className="divide-y divide-slate-200 border border-slate-200">
        {plantillas.map(plantilla => {
          const asignado = porPlantillaId.get(plantilla.id);
          return (
            <div key={plantilla.id} className="p-3">
              <label className="flex items-center gap-2 font-sans">
                <input
                  type={
                    plantilla.tipo === "Consentimiento" ? "radio" : "checkbox"
                  }
                  name={
                    plantilla.tipo === "Consentimiento"
                      ? "consentimiento-del-servicio"
                      : undefined
                  }
                  checked={!!asignado}
                  onChange={() => toggle(plantilla.id)}
                />
                <span className="text-value font-medium text-foreground">
                  {plantilla.nombre}
                </span>
                {plantilla.tipo === "Consentimiento" && (
                  <span className="font-sans text-table-head text-slate-400">
                    consentimiento
                  </span>
                )}
              </label>

              {asignado && (
                <div className="mt-2 ml-6 flex flex-wrap items-center gap-4 font-sans text-xs text-slate-600">
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={asignado.obligatorio}
                      onChange={e =>
                        actualizar(plantilla.id, {
                          obligatorio: e.target.checked,
                        })
                      }
                    />
                    Obligatorio
                  </label>

                  {plantilla.tipo === "Consentimiento" && (
                    <>
                      <select
                        value={asignado.momento}
                        onChange={e =>
                          actualizar(plantilla.id, {
                            momento: e.target
                              .value as ServicioDocumentoInput["momento"],
                          })
                        }
                        className="border border-slate-200 bg-white px-2 py-1"
                      >
                        <option value="TrasConfirmarReserva">
                          Antes de la cita
                        </option>
                        <option value="AlFinalizarAtencion">
                          Al finalizar la atención
                        </option>
                      </select>

                      <label className="flex items-center gap-1.5">
                        Vigencia (días)
                        <input
                          type="number"
                          min={0}
                          value={asignado.vigenciaDias ?? ""}
                          onChange={e =>
                            actualizar(plantilla.id, {
                              vigenciaDias: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            })
                          }
                          placeholder="cada cita"
                          className="w-24 border border-slate-200 bg-white px-2 py-1"
                        />
                      </label>
                    </>
                  )}

                  {plantilla.tipo === "Recomendacion" && (
                    <span className="text-slate-500">
                      Se envía al cerrar la atención
                    </span>
                  )}

                  {plantilla.tipo === "FichaClinica" && (
                    <span className="text-slate-500">
                      La completa la profesional durante la atención
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
