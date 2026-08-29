import Link from "next/link";

import { ServicioDocumentoInput } from "@/models/requests";
import { FormatoFichaResponse } from "@/models/responses";

interface DocumentosServicioSelectorProps {
  formatos: FormatoFichaResponse[];
  documentos: ServicioDocumentoInput[];
  onCambiar: (documentos: ServicioDocumentoInput[]) => void;
}

export function DocumentosServicioSelector({
  formatos,
  documentos,
  onCambiar,
}: DocumentosServicioSelectorProps) {
  const porFormatoId = new Map(documentos.map(d => [d.formatoFichaId, d]));

  const toggle = (formatoId: number) => {
    if (porFormatoId.has(formatoId)) {
      onCambiar(documentos.filter(d => d.formatoFichaId !== formatoId));
      return;
    }
    onCambiar([
      ...documentos,
      {
        formatoFichaId: formatoId,
        obligatorio: true,
        momento: "TrasConfirmarReserva",
      },
    ]);
  };

  const actualizar = (
    formatoId: number,
    cambios: Partial<ServicioDocumentoInput>
  ) => {
    onCambiar(
      documentos.map(d =>
        d.formatoFichaId === formatoId ? { ...d, ...cambios } : d
      )
    );
  };

  if (formatos.length === 0) {
    return (
      <p className="font-sans text-xs text-slate-500">
        No hay formatos creados todavía.{" "}
        <Link
          href="/panel/fichas/formatos/nuevo"
          className="font-bold text-slate-900 underline"
        >
          Crear uno
        </Link>
      </p>
    );
  }

  return (
    <div className="divide-y divide-slate-200 border border-slate-200">
      {formatos.map(formato => {
        const asignado = porFormatoId.get(formato.id);
        return (
          <div key={formato.id} className="p-3">
            <label className="flex items-center gap-2 font-sans">
              <input
                type="checkbox"
                checked={!!asignado}
                onChange={() => toggle(formato.id)}
              />
              <span className="text-sm font-medium text-slate-900">
                {formato.nombre}
              </span>
            </label>

            {asignado && (
              <div className="mt-2 ml-6 flex flex-wrap items-center gap-4 font-sans text-xs text-slate-600">
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={asignado.obligatorio}
                    onChange={e =>
                      actualizar(formato.id, { obligatorio: e.target.checked })
                    }
                  />
                  Obligatorio
                </label>

                <select
                  value={asignado.momento}
                  onChange={e =>
                    actualizar(formato.id, {
                      momento: e.target
                        .value as ServicioDocumentoInput["momento"],
                    })
                  }
                  className="border border-slate-200 bg-white px-2 py-1"
                >
                  <option value="TrasConfirmarReserva">Antes de la cita</option>
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
                      actualizar(formato.id, {
                        vigenciaDias: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="cada cita"
                    className="w-24 border border-slate-200 bg-white px-2 py-1"
                  />
                </label>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
