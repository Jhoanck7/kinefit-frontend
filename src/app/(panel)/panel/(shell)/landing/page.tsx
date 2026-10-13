import { redirect } from "next/navigation";

/** Redirige a la pestaña de landing dentro de configuración */
export default function LandingPage() {
  redirect("/panel/configuracion?tab=landing");
}
