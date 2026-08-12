"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNuevaReservaStore } from "@/lib/store/useNuevaReservaStore";
import { fechaISO, formatearFechaExtensa, formatearRangoHorario } from "@/lib/panel/domain/formato";
import { Button } from "@/components/panel/primitives/Button";
import { StatusPill } from "@/components/panel/primitives/StatusPill";
import { definicionEstado } from "@/lib/panel/domain/estados";

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
  const { fecha, hora, pacienteNombre, servicio, reiniciar } = useNuevaReservaStore();
  const definicion = definicionEstado("por_confirmar");

  useEffect(() => {
    if (!fecha || !hora || !pacienteNombre || !servicio) {
      router.replace("/panel/nueva-reserva/horario");
    }
  }, [fecha, hora, pacienteNombre, servicio, router]);

  if (!fecha || !hora || !pacienteNombre || !servicio) return <div aria-hidden />;

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
    router.push("/panel/nueva-reserva/horario");
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="max-w-lg text-center space-y-4">
        <h2 className="text-xl font-bold text-panel-sidebar">Cita registrada correctamente</h2>

        <div className="mx-auto flex flex-wrap items-center justify-center gap-2 rounded-full border border-brand-border bg-white px-5 py-3 text-sm">
          <span className="font-bold text-panel-sidebar">{pacienteNombre}</span>
          <span className="text-brand-muted">|</span>
          <span className="text-brand-muted font-medium">{NOMBRE_SERVICIO[servicio] ?? servicio}</span>
          <span className="text-brand-muted">|</span>
          <span className="text-brand-muted font-medium">{formatearFechaExtensa(fecha)}</span>
          <span className="text-brand-muted">|</span>
          <span className="text-brand-muted font-medium">{formatearRangoHorario(hora, horaTermino)}</span>
        </div>

        <div className="mt-4 flex flex-col items-center gap-2">
          <StatusPill etiqueta={definicion.etiqueta} colorRol={definicion.colorRol} />
          <p className="text-sm text-brand-muted">
            La cita quedó en estado <strong>Por confirmar</strong> y requiere que la ratifiques desde la agenda.
          </p>
          <button
            type="button"
            onClick={() => router.push(`/panel/agenda?fecha=${fechaISO(fecha)}`)}
            className="text-sm text-panel-sidebar underline underline-offset-2"
          >
            Ver la cita
          </button>
        </div>

        <div className="mt-8 flex justify-center gap-3">
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
