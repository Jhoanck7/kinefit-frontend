import { create } from "zustand";
import { persist } from "zustand/middleware";

import { Usuario } from "@/types";

interface AuthState {
  token: string | null;
  user: Usuario | null;
  isAuthenticated: boolean;

  // Acciones
  setSession: (token: string, user: Usuario) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setSession: (token, user) => set({ token, user, isAuthenticated: true }),

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
        // Opcional: limpiar otros stores como el de reservas al salir
      },
    }),
    {
      name: "kinefit-auth-storage", // Clave bajo la cual se guardará en el localStorage
    }
  )
);
