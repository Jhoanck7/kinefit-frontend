import {
  Alerta,
  ImageUploader,
  Modal,
  NumberField,
  TextAreaField,
  TextField,
} from "@/components/shared";
import { Button } from "@/components/ui";
import { ServicioResponse } from "@/models/responses";

interface ServicioModalProps {
  abierto: boolean;
  onCerrar: () => void;
  servicioEditando: ServicioResponse | null;
  nombre: string;
  orden: number;
  descripcion: string;
  imagenUrl: string;
  error: string | null;
  guardando: boolean;
  onNombreChange: (v: string) => void;
  onOrdenChange: (v: number) => void;
  onDescripcionChange: (v: string) => void;
  onFotoChange: (secureUrl: string, publicId?: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ServicioModal({
  abierto,
  onCerrar,
  servicioEditando,
  nombre,
  orden,
  descripcion,
  imagenUrl,
  error,
  guardando,
  onNombreChange,
  onOrdenChange,
  onDescripcionChange,
  onFotoChange,
  onSubmit,
}: ServicioModalProps) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar}>
      <div className="p-2 sm:p-4">
        <h2 className="text-xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-200">
          {servicioEditando ? "Editar Servicio" : "Nuevo Servicio"}
        </h2>

        {error && (
          <Alerta tono="error" className="mb-4">
            {error}
          </Alerta>
        )}

        <div className="pt-2 bg-slate-50 p-4 rounded-none border border-slate-200 mb-6">
          <ImageUploader
            etiqueta="Imagen del Servicio"
            value={imagenUrl}
            onChange={onFotoChange}
            folder="kinefit/servicios"
          />
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              etiqueta="Nombre del Servicio"
              value={nombre}
              onChange={e => onNombreChange(e.target.value)}
              obligatorio
              required
            />
            <NumberField
              etiqueta="Orden de Presentación"
              value={orden}
              onChange={e => onOrdenChange(Number(e.target.value))}
              min={0}
              obligatorio
              required
            />
            <div className="md:col-span-2">
              <TextAreaField
                etiqueta="Descripción"
                value={descripcion}
                onChange={e => onDescripcionChange(e.target.value)}
                rows={4}
                placeholder="Descripción del servicio..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <Button type="button" variant="outline" onClick={onCerrar}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando
                ? "Guardando..."
                : servicioEditando
                  ? "Guardar Cambios"
                  : "Crear Servicio"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
