import { redirect } from "next/navigation";

export default function HorariosPage() {
  redirect("/panel/configuracion?tab=horarios");
}
