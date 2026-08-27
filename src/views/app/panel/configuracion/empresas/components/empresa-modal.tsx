import { Alerta, Modal, TextField } from "@/components/shared";
import { Button } from "@/components/ui";
import { useGetServicios } from "@/hooks/api";
import { EmpresaResponse } from "@/models/responses";

interface EmpresaModalProps {
  abierto: boolean;
  onCerrar: () => void;
  empresaEditando: EmpresaResponse | null;
  nombre: string;
  vigenteDesde: string;
  vigenteHasta: string;
  convenios: Record<number, number>;
  error: string | null;
  guardando: boolean;
  onNombreChange: (v: string) => void;
  onVigenteDesdeChange: (v: string) => void;
  onVigenteHastaChange: (v: string) => void;
  onToggleConvenio: (servicioId: number, activo: boolean) => void;
  onPorcentajeConvenio: (servicioId: number, porcentaje: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function EmpresaModal({
  abierto,
  onCerrar,
  empresaEditando,
  nombre,
  vigenteDesde,
  vigenteHasta,
  convenios,
  error,
  guardando,
  onNombreChange,
  onVigenteDesdeChange,
  onVigenteHastaChange,
  onToggleConvenio,
  onPorcentajeConvenio,
  onSubmit,
}: EmpresaModalProps) {
  const { data: servicios = [] } = useGetServicios(false);
  return (
    <Modal abierto={abierto} onCerrar={onCerrar}>
      <div className="p-2 sm:p-4">
        <h2 className="text-xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-200">
          {empresaEditando
            ? "Editar Empresa / Convenio"
            : "Nueva Empresa / Convenio"}
        </h2>

        {error && (
          <Alerta tono="error" className="mb-4">
            {error}
          </Alerta>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <TextField
            etiqueta="Nombre de la Empresa"
            value={nombre}
            onChange={e => onNombreChange(e.target.value)}
            obligatorio
            required
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Vigente Desde (opcional)
              </label>
              <input
                type="date"
                value={vigenteDesde}
                onChange={e => onVigenteDesdeChange(e.target.value)}
                className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Vigente Hasta (opcional)
              </label>
              <input
                type="date"
                value={vigenteHasta}
                onChange={e => onVigenteHastaChange(e.target.value)}
                className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-2">
              Descuentos por Servicio
            </label>
            <div className="border border-slate-200 divide-y divide-slate-200 max-h-64 overflow-y-auto">
              {servicios.map(s => {
                const activo = s.id in convenios;
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-3 px-3 py-2"
                  >
                    <label className="flex items-center gap-2 text-sm text-slate-900">
                      <input
                        type="checkbox"
                        checked={activo}
                        onChange={e => onToggleConvenio(s.id, e.target.checked)}
                      />
                      {s.nombre}
                    </label>
                    {activo && (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={convenios[s.id]}
                          onChange={e =>
                            onPorcentajeConvenio(s.id, parseFloat(e.target.value) || 0)
                          }
                          className="w-20 rounded-none border border-slate-200 bg-white px-2 py-1 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                        />
                        <span className="text-sm text-slate-500">%</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <Button type="button" variant="outline" onClick={onCerrar}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando
                ? "Guardando..."
                : empresaEditando
                  ? "Guardar Cambios"
                  : "Crear Empresa"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
