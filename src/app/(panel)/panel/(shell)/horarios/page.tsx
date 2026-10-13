import { redirect } from "next/navigation";

/** Redirige a la pestaña de horarios dentro de configuración */
export default function HorariosPage() {
  redirect("/panel/configuracion?tab=horarios");
}
