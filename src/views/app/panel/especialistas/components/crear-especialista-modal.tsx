import { TextField } from "@/components/panel/primitives/CamposFormulario";
import { Modal } from "@/components/panel/primitives/Modal";
import { Button } from "@/components/ui";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { BackendService } from "@/types";

import { ServiciosSelector } from "./servicios-selector";

interface CrearEspecialistaModalProps {
  abierto: boolean;
  onCerrar: () => void;
  servicios: BackendService[];
  nombre: string;
  cargo: string;
  email: string;
  descripcion: string;
  servicioIds: number[];
  fotoUrl: string;
  error: string | null;
  guardando: boolean;
  onNombreChange: (v: string) => void;
  onCargoChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onDescripcionChange: (v: string) => void;
  onServicioIdsChange: (ids: number[]) => void;
  onFotoChange: (secureUrl: string, publicId?: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CrearEspecialistaModal({
  abierto,
  onCerrar,
  servicios,
  nombre,
  cargo,
  email,
  descripcion,
  servicioIds,
  fotoUrl,
  error,
  guardando,
  onNombreChange,
  onCargoChange,
  onEmailChange,
  onDescripcionChange,
  onServicioIdsChange,
  onFotoChange,
  onSubmit,
}: CrearEspecialistaModalProps) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} ancho="max-w-3xl">
      <div className="p-2 sm:p-4">
        <h2 className="text-xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-200">
          Agregar Integrante del Equipo
        </h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <div className="pt-2 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
          <ImageUploader
            etiqueta="Foto de Perfil"
            value={fotoUrl}
            onChange={onFotoChange}
            folder="kinefit/especialistas"
          />
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              etiqueta="Nombre Completo"
              value={nombre}
              onChange={e => onNombreChange(e.target.value)}
              obligatorio
              required
            />
            <TextField
              etiqueta="Cargo por Rol"
              value={cargo}
              onChange={e => onCargoChange(e.target.value)}
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
              value={email}
              onChange={e => onEmailChange(e.target.value)}
            />
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-panel-sidebar">
                Experiencia / Biografía / Resumen
              </label>
              <textarea
                value={descripcion}
                onChange={e => onDescripcionChange(e.target.value)}
                rows={4}
                placeholder="Resumen del perfil o biografía..."
                className="w-full rounded-xl border border-brand-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <Button type="button" variant="outline" onClick={onCerrar}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : "Registrar Integrante"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
