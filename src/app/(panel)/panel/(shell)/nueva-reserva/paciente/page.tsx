"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useNuevaReservaStore } from "@/lib/store/useNuevaReservaStore";
import { buscarPacientes, getPaciente, PacienteResuelto } from "@/lib/panel/data/pacientes";
import { formatearFechaExtensa } from "@/lib/panel/domain/formato";
import { Card } from "@/components/panel/primitives/Card";
import { Button } from "@/components/panel/primitives/Button";
import { SearchInput } from "@/components/panel/primitives/CamposFormulario";
import { SummaryPanel } from "@/components/panel/primitives/SummaryPanel";
import { StepIndicator } from "@/components/panel/primitives/StepIndicator";
import { BottomActionBar } from "@/components/panel/primitives/BottomActionBar";

const PASOS = [
  { etiqueta: "Servicio" },
  { etiqueta: "Horario" },
  { etiqueta: "Especialista" },
  { etiqueta: "Paciente" },
  { etiqueta: "Notas y resumen" },
];

const NOMBRE_SERVICIO: Record<string, string> = {
  embarazadas: "Embarazadas",
  masajes_pareja: "Masajes en pareja",
  masajes: "Masajes (masoterapia)",
  masajes_premium: "Masajes Premium",
  masajes_reductivos: "Masajes Reductivos",
  voucher_regalo: "Voucher para Regalo",
  kinesiologia: "Kinesiología",
};

export default function NuevaReservaPacientePage() {
  const router = useRouter();
  const { fecha, hora, pacienteId, pacienteNombre, especialistaNombre, servicio, setPaciente } =
    useNuevaReservaStore();

  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<PacienteResuelto[]>([]);
  const [buscado, setBuscado] = useState(false);
  const [pacienteConfirmado, setPacienteConfirmado] = useState<PacienteResuelto | null>(null);

  useEffect(() => {
    if (!busqueda.trim()) {
      setResultados([]);
      setBuscado(false);
      return;
    }
    buscarPacientes(busqueda).then((r) => {
      setResultados(r);
      setBuscado(true);
    });
  }, [busqueda]);

  useEffect(() => {
    if (pacienteId && !pacienteId.startsWith("temp-")) {
      getPaciente(pacienteId).then((p) => setPacienteConfirmado(p ?? null));
    }
  }, [pacienteId]);

  function seleccionar(paciente: PacienteResuelto) {
    setPaciente(paciente.id, `${paciente.nombre} ${paciente.apellido}`);
    setPacienteConfirmado(paciente);
    setBusqueda("");
    setResultados([]);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <StepIndicator pasos={PASOS} pasoActivo={4} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_320px]">
        <Card>
          <h2 className="mb-4 text-lg font-bold text-panel-sidebar">¿Para quién es la cita?</h2>

          {pacienteId ? (
            <div className="rounded-xl border border-brand-border p-4">
              <p className="font-bold text-panel-sidebar">{pacienteNombre}</p>
              {pacienteConfirmado && (
                <>
                  <p className="text-sm text-brand-muted">RUT: {pacienteConfirmado.rut}</p>
                  <p className="mt-1 text-sm text-brand-muted">{pacienteConfirmado.telefono}</p>
                  <p className="text-sm text-brand-muted">{pacienteConfirmado.correo}</p>
                  <p className="mt-1 text-sm text-brand-muted">Convenio: {pacienteConfirmado.convenio?.nombre ?? "—"}</p>
                </>
              )}
              <button
                type="button"
                onClick={() => {
                  setPaciente("", "");
                  setPacienteConfirmado(null);
                }}
                className="mt-3 text-sm text-panel-sidebar underline underline-offset-2"
              >
                Cambiar paciente
              </button>
            </div>
          ) : (
            <>
              <SearchInput
                placeholder="Buscar por nombre o RUT..."
                value={busqueda}
                onChange={setBusqueda}
                ayuda="Buscar por nombre o RUT…"
              />

              {buscado && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-muted">
                    Resultados de búsqueda
                  </p>
                  {resultados.length === 0 ? (
                    <p className="text-sm text-brand-muted">
                      No se encontraron pacientes que coincidan con la búsqueda. Puedes registrar uno nuevo.
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {resultados.map((paciente) => (
                        <li key={paciente.id}>
                          <button
                            type="button"
                            onClick={() => seleccionar(paciente)}
                            className="flex w-full items-center justify-between rounded-lg border border-brand-border px-4 py-3 text-left text-sm hover:border-panel-sidebar/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar"
                          >
                            <span className="font-medium text-panel-sidebar">
                              {paciente.nombre} {paciente.apellido}
                            </span>
                            <span className="text-brand-muted">{paciente.rut} ›</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-brand-border" />
                <span className="text-xs text-brand-muted">o</span>
                <div className="h-px flex-1 bg-brand-border" />
              </div>

              <Button
                variante="secundario"
                className="w-full"
                onClick={() => router.push("/panel/pacientes/nuevo?retorno=/panel/nueva-reserva/paciente")}
              >
                Registrar paciente nuevo
              </Button>
            </>
          )}

          <BottomActionBar
            abandono={
              <button
                type="button"
                onClick={() => router.push("/panel/agenda")}
                className="text-sm text-panel-sidebar underline underline-offset-2"
              >
                Cancelar reserva
              </button>
            }
            volver={
              <Button variante="secundario" onClick={() => router.push("/panel/nueva-reserva/especialista")}>
                Volver
              </Button>
            }
            avanzar={
              <Button variante="primario" disabled={!pacienteId} onClick={() => router.push("/panel/nueva-reserva/resumen")}>
                Continuar
              </Button>
            }
          />
        </Card>

        <SummaryPanel
          filas={[
            { etiqueta: "Servicio", valor: servicio ? (NOMBRE_SERVICIO[servicio] ?? servicio) : undefined },
            { etiqueta: "Fecha", valor: fecha ? formatearFechaExtensa(fecha) : undefined },
            { etiqueta: "Horario", valor: hora || undefined },
            { etiqueta: "Especialista", valor: especialistaNombre || undefined },
            { etiqueta: "Paciente", valor: pacienteNombre || undefined },
          ]}
        />
      </div>
    </div>
  );
}
