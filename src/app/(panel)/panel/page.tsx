import { redirect } from "next/navigation";

/** Redirige la raíz del panel a la agenda */
export default function PanelIndexPage() {
  redirect("/panel/agenda");
}
