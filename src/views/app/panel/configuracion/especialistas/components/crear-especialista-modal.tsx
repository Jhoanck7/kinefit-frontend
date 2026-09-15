import {
  Alerta,
  ImageUploader,
  Modal,
  ModalCloseButton,
  TextAreaField,
  TextField,
} from "@/components/shared";
import { Button } from "@/components/ui";
import { ServicioResponse } from "@/models/responses";

import { ServiciosSelector } from "./servicios-selector";

interface CrearEspecialistaModalProps {
  abierto: boolean;
  onCerrar: () => void;
  servicios: ServicioResponse[];
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
    <Modal abierto={abierto} onCerrar={onCerrar}>
      <div className="bg-white text-foreground font-sans shadow-none rounded-overlay">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm px-6 py-4">
          <h2 className="font-sans text-section-title font-bold text-foreground">
            Agregar Integrante del Equipo
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
            etiqueta="Foto de Perfil"
            value={fotoUrl}
            onChange={onFotoChange}
            folder="kinefit/especialistas"
          />
        </div>

        <form onSubmit={onSubmit} className="p-6 pt-0 space-y-6">
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
              <label className="mb-1 block font-sans text-label font-medium text-muted-foreground">
                Servicios que Presta *
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
              <TextAreaField
                etiqueta="Experiencia / Biografía / Resumen"
                value={descripcion}
                onChange={e => onDescripcionChange(e.target.value)}
                rows={4}
                placeholder="Resumen del perfil o biografía..."
              />
            </div>
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
              {guardando ? "Guardando…" : "Registrar Integrante"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
