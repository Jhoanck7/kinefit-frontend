"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/panel/primitives/Button";
import { definicionEstado } from "@/lib/panel/domain/estados";
import {
  fechaISO,
  formatearFechaExtensa,
  formatearRangoHorario,
} from "@/lib/panel/domain/formato";
import { useNuevaReservaStore } from "@/lib/store/useNuevaReservaStore";

const NOMBRE_SERVICIO: Record<string, string> = {
  embarazadas: "Embarazadas",
  masajes_pareja: "Masajes en pareja",
  masajes: "Masajes (masoterapia)",
  masajes_premium: "Masajes Premium",
  masajes_reductivos: "Masajes Reductivos",
  voucher_regalo: "Voucher para Regalo",
  kinesiologia: "Kinesiología",
  masoterapia: "Masoterapia",
};

export default function NuevaReservaListoPage() {
  const router = useRouter();
  const { fecha, hora, pacienteNombre, servicio, reiniciar } =
    useNuevaReservaStore();
  const definicion = definicionEstado("por_confirmar");

  useEffect(() => {
    if (!fecha || !hora || !pacienteNombre || !servicio) {
      router.replace("/panel/nueva-reserva/servicio");
    }
  }, [fecha, hora, pacienteNombre, servicio, router]);

  if (!fecha || !hora || !pacienteNombre || !servicio)
    return <div aria-hidden />;

  const [h, m] = hora.split(":").map(Number);
  const minutosTermino = h * 60 + m + 30;
  const horaTermino = `${Math.floor(minutosTermino / 60)
    .toString()
    .padStart(2, "0")}:${(minutosTermino % 60).toString().padStart(2, "0")}`;

  function irALaAgenda() {
    reiniciar();
    router.push(`/panel/agenda?fecha=${fechaISO(fecha!)}`);
  }

  function registrarOtra() {
    reiniciar();
    router.push("/panel/nueva-reserva/servicio");
  }

  return (
    <div className="flex min-h-[65vh] items-center justify-center font-sans shadow-none">
      <div className="max-w-md w-full border border-slate-200 bg-white p-8 text-center space-y-5 rounded-none">
        <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900">
          Cita Registrada Correctamente
        </h2>

        <div className="border border-slate-200 bg-slate-50/70 p-4 text-xs space-y-1.5 rounded-none">
          <p className="font-sans font-medium text-sm text-slate-900">
            {pacienteNombre}
          </p>
          <p className="font-sans text-slate-600">
            {NOMBRE_SERVICIO[servicio] ?? servicio}
          </p>
          <p className="font-sans text-slate-600">
            {formatearFechaExtensa(fecha)}
          </p>
          <p className="font-sans font-medium text-slate-900">
            {formatearRangoHorario(hora, horaTermino)}
          </p>
        </div>

        <div className="flex items-center justify-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-600" aria-hidden />
          <span className="font-sans text-xs font-bold uppercase tracking-wider text-blue-700">
            {definicion.etiqueta}
          </span>
        </div>

        <p className="font-sans text-xs text-slate-500">
          La cita quedó en estado <strong>Por confirmar</strong> para su
          posterior ratificación desde la agenda.
        </p>

        <div className="pt-3 flex justify-center gap-3 border-t border-slate-200">
          <Button variante="secundario" onClick={registrarOtra}>
            Registrar otra cita
          </Button>
          <Button variante="primario" onClick={irALaAgenda}>
            Ir a la agenda
          </Button>
        </div>
      </div>
    </div>
  );
}
