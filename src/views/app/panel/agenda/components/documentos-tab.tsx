"use client";

import { useRouter } from "next/navigation";

import { useGetDocumentos, useGetDocumentosPorCita } from "@/hooks/api";
import { CitaDetalleResponse } from "@/models/responses";
import { useNuevaFichaStore } from "@/stores";
import { DocumentoAcciones } from "@/views/app/panel/documentos/components/documento-acciones";

export function DocumentosTab({ cita }: { cita: CitaDetalleResponse }) {
  const citaId = cita.id;
  const router = useRouter();
  const { setReserva, reiniciar } = useNuevaFichaStore();
  const {
    data: documentos,
    isLoading,
    refetch,
  } = useGetDocumentosPorCita(citaId);
  const { data: fichasDeLaCita } = useGetDocumentos({
    citaId,
    tipo: "FichaClinica",
    pageSize: 5,
  });
  const ficha = fichasDeLaCita?.items?.[0] ?? null;
  const puedeRegistrarFicha =
    cita.estado === "Confirmada" || cita.estado === "Atendida";

  const handleRegistrarFicha = () => {
    reiniciar();
    setReserva(
      String(cita.paciente.id),
      `${cita.paciente.nombre} ${cita.paciente.apellido}`,
      String(citaId)
    );
    router.push("/panel/documentos/nueva/contenido");
  };

  const handleAbrirFicha = (id: number) =>
    router.push(`/panel/documentos?documento=${id}`);

  if (isLoading) {
    return (
      <p className="p-6 font-sans text-xs text-slate-500">
        Cargando documentos…
      </p>
    );
  }

  return (
    <div className="divide-y divide-slate-200 p-6">
      <div className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-sans text-sm font-semibold text-slate-900">
            Ficha Clínica
          </p>
          <p className="font-sans text-xs text-slate-500">
            {ficha
              ? ficha.estado
              : puedeRegistrarFicha
                ? "Esta reserva todavía no tiene ficha"
                : `La cita debe estar Confirmada o Atendida, está ${cita.estado}`}
          </p>
        </div>
        {ficha ? (
          <button
            type="button"
            onClick={() => handleAbrirFicha(ficha.id)}
            className="font-sans text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            Abrir Ficha
          </button>
        ) : (
          puedeRegistrarFicha && (
            <button
              type="button"
              onClick={handleRegistrarFicha}
              className="font-sans text-xs font-bold text-primary hover:underline"
            >
              Registrar Ficha
            </button>
          )
        )}
      </div>

      {(!documentos || documentos.length === 0) && (
        <p className="py-3 font-sans text-xs text-slate-500">
          Este servicio no exige consentimientos.
        </p>
      )}

      {(documentos ?? []).map(doc => (
        <div key={doc.id} className="py-3 first:pt-0 last:pb-0">
          <DocumentoAcciones
            documento={doc}
            onCambio={() => refetch()}
            encabezado={
              <div>
                <p className="font-sans text-sm font-semibold text-slate-900">
                  {doc.nombrePlantilla}
                </p>
                <p className="font-sans text-xs text-slate-500">
                  {doc.estado}
                  {doc.reutilizado ? " · cubierto por una firma anterior" : ""}
                  {doc.cargadoEnPapelEn ? " · cargado en papel" : ""}
                </p>
              </div>
            }
          />
        </div>
      ))}
    </div>
  );
}
