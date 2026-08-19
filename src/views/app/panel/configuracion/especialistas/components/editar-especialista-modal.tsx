import {
  Alerta,
  ImageUploader,
  Modal,
  TextAreaField,
  TextField,
} from "@/components/shared";
import { Button } from "@/components/ui";
import { EspecialistaResponse, ServicioResponse } from "@/models/responses";

import { ServiciosSelector } from "./servicios-selector";

interface EditarEspecialistaModalProps {
  abierto: boolean;
  onCerrar: () => void;
  especialista: EspecialistaResponse | null;
  servicios: ServicioResponse[];
  servicioIds: number[];
  error: string | null;
  guardando: boolean;
  onCampoChange: (campo: keyof EspecialistaResponse, valor: string) => void;
  onServicioIdsChange: (ids: number[]) => void;
  onFotoChange: (secureUrl: string, publicId?: string) => void;
  onSolicitarEliminacion: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function EditarEspecialistaModal({
  abierto,
  onCerrar,
  especialista,
  servicios,
  servicioIds,
  error,
  guardando,
  onCampoChange,
  onServicioIdsChange,
  onFotoChange,
  onSolicitarEliminacion,
  onSubmit,
}: EditarEspecialistaModalProps) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar}>
      {especialista && (
        <div className="p-2 sm:p-4">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">
              Editar Perfil del Integrante
            </h2>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onSolicitarEliminacion();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 px-3 py-1.5 rounded-none transition-all"
              title="Eliminar especialista"
            >
              Eliminar
            </button>
          </div>

          {error && (
            <Alerta tono="error" className="mb-4">
              {error}
            </Alerta>
          )}

          <div className="pt-2 bg-slate-50 p-4 rounded-none border border-slate-200">
            <ImageUploader
              etiqueta="Foto de Perfil"
              value={especialista.fotoUrl || ""}
              onChange={onFotoChange}
              folder="kinefit/especialistas"
            />
          </div>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                etiqueta="Nombre Completo"
                value={especialista.nombre}
                onChange={e => onCampoChange("nombre", e.target.value)}
                obligatorio
                required
              />
              <TextField
                etiqueta="Cargo por Rol"
                value={especialista.cargo}
                onChange={e => onCampoChange("cargo", e.target.value)}
                obligatorio
                required
              />
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-900">
                  Servicios que presta *
                </label>
                <ServiciosSelector
                  servicios={servicios}
                  seleccionados={servicioIds}
                  onCambiar={onServicioIdsChange}
                />
              </div>
              <TextField
                etiqueta="Correo Electrónico de Contacto"
                type="email"
                value={especialista.email || ""}
                onChange={e => onCampoChange("email", e.target.value)}
              />
              <div className="md:col-span-2">
                <TextAreaField
                  etiqueta="Experiencia / Biografía / Resumen"
                  value={especialista.descripcion || ""}
                  onChange={e => onCampoChange("descripcion", e.target.value)}
                  rows={4}
                  placeholder="Resumen del perfil o biografía..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
              <Button type="button" variant="outline" onClick={onCerrar}>
                Cerrar sin guardar
              </Button>
              <Button type="submit" disabled={guardando}>
                {guardando ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
}
