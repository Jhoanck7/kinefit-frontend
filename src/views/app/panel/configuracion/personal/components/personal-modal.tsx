import {
  Alerta,
  Modal,
  ModalCloseButton,
  SelectField,
  TextField,
} from "@/components/shared";
import { Button } from "@/components/ui";
import { useGetEspecialistas } from "@/hooks/api";
import { UsuarioPersonalAdminResponse } from "@/models/responses";

interface PersonalModalProps {
  abierto: boolean;
  onCerrar: () => void;
  usuarioEditando: UsuarioPersonalAdminResponse | null;
  nombre: string;
  email: string;
  rol: string;
  especialistaId: string;
  error: string | null;
  guardando: boolean;
  onNombreChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onRolChange: (v: string) => void;
  onEspecialistaIdChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function PersonalModal({
  abierto,
  onCerrar,
  usuarioEditando,
  nombre,
  email,
  rol,
  especialistaId,
  error,
  guardando,
  onNombreChange,
  onEmailChange,
  onRolChange,
  onEspecialistaIdChange,
  onSubmit,
}: PersonalModalProps) {
  const { data: especialistas = [] } = useGetEspecialistas(undefined, true);

  return (
    <Modal abierto={abierto} onCerrar={onCerrar}>
      <div className="bg-white text-foreground font-sans shadow-none rounded-overlay">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm px-6 py-4">
          <h2 className="font-sans text-section-title font-bold text-foreground">
            {usuarioEditando ? "Editar Cuenta" : "Nueva Cuenta de Personal"}
          </h2>
          <ModalCloseButton onClick={onCerrar} />
        </div>

        {error && (
          <Alerta tono="error" className="mx-6 mt-4">
            {error}
          </Alerta>
        )}

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <TextField
            etiqueta="Nombre"
            value={nombre}
            onChange={e => onNombreChange(e.target.value)}
            obligatorio
            required
          />

          <TextField
            etiqueta="Correo Electrónico"
            type="email"
            value={email}
            onChange={e => onEmailChange(e.target.value)}
            obligatorio
            required
            disabled={Boolean(usuarioEditando)}
            ayuda={
              usuarioEditando
                ? "El correo no se puede editar: es el identificador de inicio de sesión."
                : undefined
            }
          />

          <SelectField
            etiqueta="Rol"
            value={rol}
            onChange={e => onRolChange(e.target.value)}
            obligatorio
            required
          >
            <option value="Especialista">Especialista</option>
            <option value="Administrador">Administrador</option>
          </SelectField>

          {rol === "Especialista" && (
            <SelectField
              etiqueta="Especialista Vinculado"
              value={especialistaId}
              onChange={e => onEspecialistaIdChange(e.target.value)}
              obligatorio
              required
              ayuda="Determina qué agenda ve esta cuenta."
            >
              <option value="">Seleccionar…</option>
              {especialistas.map(esp => (
                <option key={esp.id} value={esp.id}>
                  {esp.nombre}
                </option>
              ))}
            </SelectField>
          )}

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
                : usuarioEditando
                  ? "Guardar Cambios"
                  : "Crear Cuenta"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
