import { redirect } from "next/navigation";

/** Redirige a la pestaña de especialistas dentro de configuración */
export default function EspecialistasPage() {
  redirect("/panel/configuracion?tab=especialistas");
}
