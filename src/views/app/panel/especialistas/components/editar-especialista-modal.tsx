import { TextField } from "@/components/panel/primitives/CamposFormulario";
import { Modal } from "@/components/panel/primitives/Modal";
import { Button } from "@/components/ui";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { EspecialistaResponse } from "@/models/responses";
import { BackendService } from "@/types";

import { ServiciosSelector } from "./servicios-selector";

interface EditarEspecialistaModalProps {
  abierto: boolean;
  onCerrar: () => void;
  especialista: EspecialistaResponse | null;
  servicios: BackendService[];
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
    <Modal abierto={abierto} onCerrar={onCerrar} ancho="max-w-3xl">
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
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-all"
              title="Eliminar especialista"
            >
              Eliminar
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div className="pt-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
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
                <label className="mb-1 block text-xs font-medium text-panel-sidebar">
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
                <label className="mb-1 block text-xs font-medium text-panel-sidebar">
                  Experiencia / Biografía / Resumen
                </label>
                <textarea
                  value={especialista.descripcion || ""}
                  onChange={e => onCampoChange("descripcion", e.target.value)}
                  rows={4}
                  placeholder="Resumen del perfil o biografía..."
                  className="w-full rounded-xl border border-brand-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
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
