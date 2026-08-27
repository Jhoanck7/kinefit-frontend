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
  duracionMinutos: number | undefined;
  duracionActiva: boolean;
  descripcion: string;
  imagenUrl: string;
  error: string | null;
  guardando: boolean;
  onNombreChange: (v: string) => void;
  onOrdenChange: (v: number) => void;
  onDuracionMinutosChange: (v: number | undefined) => void;
  onDescripcionChange: (v: string) => void;
  onFotoChange: (secureUrl: string, publicId?: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const DURACIONES_DISPONIBLES = [30, 60, 90];

export function ServicioModal({
  abierto,
  onCerrar,
  servicioEditando,
  nombre,
  orden,
  duracionMinutos,
  duracionActiva,
  descripcion,
  imagenUrl,
  error,
  guardando,
  onNombreChange,
  onOrdenChange,
  onDuracionMinutosChange,
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
            {duracionActiva && (
              <div>
                <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                  Duración (minutos) *
                </label>
                <div className="flex gap-2">
                  {DURACIONES_DISPONIBLES.map(min => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => onDuracionMinutosChange(min)}
                      className={`flex-1 rounded-none border px-3 py-2 text-sm font-medium ${
                        duracionMinutos === min
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {min} min
                    </button>
                  ))}
                </div>
              </div>
            )}
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
