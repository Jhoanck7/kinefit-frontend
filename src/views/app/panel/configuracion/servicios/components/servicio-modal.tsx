import {
  Alerta,
  ImageUploader,
  Modal,
  ModalCloseButton,
  NumberField,
  TextAreaField,
  TextField,
} from "@/components/shared";
import { Button } from "@/components/ui";
import { ServicioDocumentoInput } from "@/models/requests";
import { PlantillaResponse, ServicioResponse } from "@/models/responses";

import { DocumentosServicioSelector } from "./documentos-servicio-selector";

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
  plantillas: PlantillaResponse[];
  documentos: ServicioDocumentoInput[];
  error: string | null;
  guardando: boolean;
  onNombreChange: (v: string) => void;
  onOrdenChange: (v: number) => void;
  onDuracionMinutosChange: (v: number | undefined) => void;
  onDescripcionChange: (v: string) => void;
  onFotoChange: (secureUrl: string, publicId?: string) => void;
  onDocumentosChange: (documentos: ServicioDocumentoInput[]) => void;
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
  plantillas,
  documentos,
  error,
  guardando,
  onNombreChange,
  onOrdenChange,
  onDuracionMinutosChange,
  onDescripcionChange,
  onFotoChange,
  onDocumentosChange,
  onSubmit,
}: ServicioModalProps) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar}>
      <div className="bg-white text-foreground font-sans shadow-none rounded-overlay">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm px-6 py-4">
          <h2 className="font-sans text-section-title font-bold text-foreground">
            {servicioEditando ? "Editar Servicio" : "Nuevo Servicio"}
          </h2>
          <ModalCloseButton onClick={onCerrar} />
        </div>

        {error && (
          <Alerta tono="error" className="mx-6 mt-4">
            {error}
          </Alerta>
        )}

        <div className="mx-6 mt-6 bg-slate-50 p-4 rounded-none border border-slate-200">
          <ImageUploader
            etiqueta="Imagen del Servicio"
            value={imagenUrl}
            onChange={onFotoChange}
            folder="kinefit/servicios"
          />
        </div>

        <form onSubmit={onSubmit} className="p-6 pt-0 space-y-6">
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
                <label className="font-sans text-label font-medium text-muted-foreground block mb-1">
                  Duración (Minutos) *
                </label>
                <div className="flex gap-2">
                  {DURACIONES_DISPONIBLES.map(min => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => onDuracionMinutosChange(min)}
                      className={`flex-1 rounded-none border px-3 py-2 text-sm font-medium ${
                        duracionMinutos === min
                          ? "border-primary bg-primary text-white"
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

          <div>
            <p className="mb-2 font-sans text-label font-medium text-muted-foreground">
              Documentos Exigidos
            </p>
            <DocumentosServicioSelector
              plantillas={plantillas}
              documentos={documentos}
              onCambiar={onDocumentosChange}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <Button
              type="button"
              variant="outline"
              className="rounded-overlay"
              onClick={onCerrar}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="rounded-overlay"
              disabled={guardando}
            >
              {guardando
                ? "Guardando…"
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
