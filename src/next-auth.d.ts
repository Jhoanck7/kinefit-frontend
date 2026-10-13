import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    nombre: string;
    rol: string;
    especialistaId?: string;
    exp: number;
    accessToken: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      nombre: string;
      rol: string;
      especialistaId?: string;
    };
    accessToken: string;
    customExp: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    userId: string;
    nombre: string;
    rol: string;
    especialistaId?: string;
    customExp: number;
  }
}
