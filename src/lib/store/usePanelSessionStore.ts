import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UsuarioPanel {
  nombre: string;
  rol: "Administrador" | "Especialista";
  cargo?: string;
  especialistaId?: string;
}

interface PanelSessionState {
  usuario: UsuarioPanel | null;
  entrar: (usuario?: UsuarioPanel) => void;
  salir: () => void;
}

/**
 * Sesión simulada del personal (DD-3). Store propio, aparte de `useAuthStore`
 * (que es del contrato del paciente y nadie lo consume): distinta clave de
 * persistencia para que nunca colisionen si algún día conviven en el mismo
 * navegador.
 *
 * Sin token, sin validación, sin credenciales: cualquier envío en la pantalla
 * de acceso entra como Franchesca Astudillo (D-11).
 */
export const USUARIO_SESION_PANEL: UsuarioPanel = {
  nombre: "Franchesca Astudillo",
  rol: "Especialista",
  cargo: "Masoterapeuta",
  especialistaId: "esp-franchesca",
};

export const usePanelSessionStore = create<PanelSessionState>()(
  persist(
    set => ({
      usuario: null,
      entrar: (usuario = USUARIO_SESION_PANEL) => set({ usuario }),
      salir: () => set({ usuario: null }),
    }),
    {
      name: "kinefit-panel-session-storage",
    }
  )
);
