import { redirect } from "next/navigation";

/** Redirige la raíz del flujo de nueva reserva al primer paso, elegir servicio */
export default function NuevaReservaIndexPage() {
  redirect("/panel/nueva-reserva/servicio");
}
