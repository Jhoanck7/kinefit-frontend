import { Alerta, Modal, TextField } from "@/components/shared";
import { Button } from "@/components/ui";
import { EmpresaResponse } from "@/models/responses";

interface EmpresaModalProps {
  abierto: boolean;
  onCerrar: () => void;
  empresaEditando: EmpresaResponse | null;
  nombre: string;
  error: string | null;
  guardando: boolean;
  onNombreChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function EmpresaModal({
  abierto,
  onCerrar,
  empresaEditando,
  nombre,
  error,
  guardando,
  onNombreChange,
  onSubmit,
}: EmpresaModalProps) {
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
