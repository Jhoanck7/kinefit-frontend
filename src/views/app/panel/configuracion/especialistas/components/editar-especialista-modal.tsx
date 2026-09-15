import {
  Alerta,
  ImageUploader,
  Modal,
  ModalCloseButton,
  TextAreaField,
  TextField,
} from "@/components/shared";
import { Button, Switch } from "@/components/ui";
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
  onCampoChange: <K extends keyof EspecialistaResponse>(
    campo: K,
    valor: EspecialistaResponse[K]
  ) => void;
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
        <div className="bg-white text-foreground font-sans shadow-none rounded-overlay">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm px-6 py-4">
            <h2 className="font-sans text-section-title font-bold text-foreground">
              Editar Perfil del Integrante
            </h2>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onSolicitarEliminacion();
                }}
                className="inline-flex items-center gap-1.5 rounded-overlay border border-slate-200 bg-white px-3 py-1.5 font-sans text-xs font-bold text-foreground transition-all hover:bg-slate-50"
                title="Eliminar especialista"
              >
                Eliminar
              </button>
              <ModalCloseButton onClick={onCerrar} />
            </div>
          </div>

          {error && (
            <Alerta tono="error" className="mx-6 mt-4">
              {error}
            </Alerta>
          )}

          <div className="mx-6 mt-6 bg-slate-50 p-4 rounded-none border border-slate-200">
            <ImageUploader
              etiqueta="Foto de Perfil"
              value={especialista.fotoUrl || ""}
              onChange={onFotoChange}
              folder="kinefit/especialistas"
            />
          </div>
          <form onSubmit={onSubmit} className="p-6 pt-0 space-y-6">
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
              <div className="md:col-span-2 flex items-center justify-between rounded-none border border-slate-200 bg-slate-50 p-4">
                <div>
                  <h3 className="font-sans text-label font-bold text-foreground">
                    Mostrar Contacto en el Sitio
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Apagado, el correo no se muestra en la tarjeta pública del
                    equipo.
                  </p>
                </div>
                <Switch
                  checked={especialista.mostrarContacto}
                  onCheckedChange={checked =>
                    onCampoChange("mostrarContacto", checked)
                  }
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
                Cerrar sin Guardar
              </Button>
              <Button
                type="submit"
                className="rounded-overlay"
                disabled={guardando}
              >
                {guardando ? "Guardando…" : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
}
