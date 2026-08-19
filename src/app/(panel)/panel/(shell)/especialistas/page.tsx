import { redirect } from "next/navigation";

export default function EspecialistasPage() {
  redirect("/panel/configuracion?tab=especialistas");
}
