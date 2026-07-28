"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNuevaReservaStore } from "@/lib/store/useNuevaReservaStore";
import { fechaISO, formatearFechaExtensa, formatearRangoHorario } from "@/lib/panel/domain/formato";
import { Button } from "@/components/panel/primitives/Button";
import { StatusPill } from "@/components/panel/primitives/StatusPill";
import { definicionEstado } from "@/lib/panel/domain/estados";

const NOMBRE_SERVICIO: Record<string, string> = {
  masoterapia: "Masoterapia",
  kinesiologia: "Kinesiología",
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
      <div className="max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
          <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-panel-sidebar">Cita registrada correctamente</h2>

        <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-2 rounded-full border border-brand-border bg-white px-5 py-3 text-sm">
          <span className="font-bold text-panel-sidebar">{pacienteNombre}</span>
          <span className="text-brand-muted">·</span>
          <span className="text-brand-muted">{NOMBRE_SERVICIO[servicio]}</span>
          <span className="text-brand-muted">·</span>
          <span className="text-brand-muted">{formatearFechaExtensa(fecha)}</span>
          <span className="text-brand-muted">·</span>
          <span className="text-brand-muted">{formatearRangoHorario(hora, horaTermino)}</span>
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
