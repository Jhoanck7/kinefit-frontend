import Link from "next/link";

import { Alerta } from "@/components/shared";
import { ServicioDocumentoInput } from "@/models/requests";
import { PlantillaResponse } from "@/models/responses";

interface DocumentosServicioSelectorProps {
  plantillas: PlantillaResponse[];
  documentos: ServicioDocumentoInput[];
  onCambiar: (documentos: ServicioDocumentoInput[]) => void;
}

const ESTILO_OPCION =
  "flex cursor-pointer items-center gap-2 p-3 font-sans hover:bg-slate-50";

export function DocumentosServicioSelector({
  plantillas,
  documentos,
  onCambiar,
}: DocumentosServicioSelectorProps) {
  // Las fichas clínicas no se listan: el backend solo genera consentimientos
  // por servicio y busca la recomendación estándar, y la plantilla de la ficha
  // la elige la profesional al registrarla.
  const consentimientos = plantillas.filter(p => p.tipo === "Consentimiento");
  const recomendaciones = plantillas.filter(p => p.tipo === "Recomendacion");

  const elegidosDe = (tipo: PlantillaResponse["tipo"]) =>
    documentos.filter(
      d => plantillas.find(p => p.id === d.plantillaId)?.tipo === tipo
    );

  const consentimientoElegido = elegidosDe("Consentimiento");
  const recomendacionElegida = elegidosDe("Recomendacion");

  const nombreDe = (plantillaId: number) =>
    plantillas.find(p => p.id === plantillaId)?.nombre ?? "sin nombre";

  const elegir = (
    tipo: PlantillaResponse["tipo"],
    plantillaId: number | null
  ) => {
    const otros = documentos.filter(
      d => plantillas.find(p => p.id === d.plantillaId)?.tipo !== tipo
    );
    if (plantillaId === null) {
      onCambiar(otros);
      return;
    }
    onCambiar([
      ...otros,
      {
        plantillaId,
        obligatorio: true,
        // Una recomendación solo se encuentra como la estándar del servicio si
        // queda en AlFinalizarAtencion.
        momento:
          tipo === "Recomendacion"
            ? "AlFinalizarAtencion"
            : "TrasConfirmarReserva",
      },
    ]);
  };

  const actualizar = (
    plantillaId: number,
    cambios: Partial<ServicioDocumentoInput>
  ) => {
    onCambiar(
      documentos.map(d =>
        d.plantillaId === plantillaId ? { ...d, ...cambios } : d
      )
    );
  };

  if (plantillas.length === 0) {
    return (
      <p className="font-sans text-xs text-slate-500">
        No hay plantillas creadas todavía.{" "}
        <Link
          href="/panel/documentos/plantillas/nuevo"
          className="font-bold text-foreground underline"
        >
          Crear una
        </Link>
      </p>
    );
  }

  const seleccionados = [...consentimientoElegido, ...recomendacionElegida];

  return (
    <div className="space-y-6">
      {seleccionados.length !== documentos.length && (
        <Alerta tono="advertencia">
          Este servicio tiene documentos guardados que ya no se configuran desde
          acá. Guarda el servicio para dejar solo lo que ves.
        </Alerta>
      )}

      <Seccion
        titulo="Consentimiento"
        descripcion="El paciente lo firma antes de la atención. Solo se puede exigir uno."
        vacio="No hay consentimientos creados todavía."
        plantillas={consentimientos}
        elegidos={consentimientoElegido}
        etiquetaNinguno="No exigir consentimiento"
        nombreGrupo="consentimiento-del-servicio"
        nombreDe={nombreDe}
        onElegir={id => elegir("Consentimiento", id)}
      >
        {elegido => (
          <label className="flex items-center gap-1.5">
            Vigencia (días)
            <input
              type="number"
              min={0}
              value={elegido.vigenciaDias ?? ""}
              onChange={e =>
                actualizar(elegido.plantillaId, {
                  vigenciaDias: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              placeholder="cada cita"
              className="w-24 border border-slate-200 bg-white px-2 py-1"
            />
            <span className="text-slate-500">
              En blanco se firma en cada cita. Con un número, una firma anterior
              cubre las citas siguientes dentro de ese plazo.
            </span>
          </label>
        )}
      </Seccion>

      <Seccion
        titulo="Recomendación estándar"
        descripcion="Se ofrece al marcar la cita como Atendida. Solo puede haber una."
        vacio="No hay recomendaciones creadas todavía."
        plantillas={recomendaciones}
        elegidos={recomendacionElegida}
        etiquetaNinguno="Sin recomendación estándar"
        nombreGrupo="recomendacion-del-servicio"
        nombreDe={nombreDe}
        onElegir={id => elegir("Recomendacion", id)}
      />
    </div>
  );
}

function Seccion({
  titulo,
  descripcion,
  vacio,
  plantillas,
  elegidos,
  etiquetaNinguno,
  nombreGrupo,
  nombreDe,
  onElegir,
  children,
}: {
  titulo: string;
  descripcion: string;
  vacio: string;
  plantillas: PlantillaResponse[];
  elegidos: ServicioDocumentoInput[];
  etiquetaNinguno: string;
  nombreGrupo: string;
  nombreDe: (plantillaId: number) => string;
  onElegir: (plantillaId: number | null) => void;
  children?: (elegido: ServicioDocumentoInput) => React.ReactNode;
}) {
  const elegido = elegidos[0] ?? null;

  return (
    <div>
      <p className="font-sans text-label font-medium text-foreground">
        {titulo}
      </p>
      <p className="mb-2 font-sans text-xs text-slate-500">{descripcion}</p>

      {/* Los radios comparten name, así que el navegador marca uno solo aunque
          haya varios guardados: sin este aviso, el dato roto se ve sano. */}
      {elegidos.length > 1 && (
        <Alerta tono="advertencia" className="mb-2">
          Hay {elegidos.length} guardados (
          {elegidos.map(e => nombreDe(e.plantillaId)).join(", ")}) y solo se
          admite uno. Mientras siga así, las citas de este servicio no funcionan
          bien. Elige cuál queda y guarda el servicio.
        </Alerta>
      )}

      {plantillas.length === 0 ? (
        <p className="font-sans text-xs text-slate-500">{vacio}</p>
      ) : (
        <div className="divide-y divide-slate-200 border border-slate-200">
          <label className={ESTILO_OPCION}>
            <input
              type="radio"
              name={nombreGrupo}
              checked={elegido === null}
              onChange={() => onElegir(null)}
            />
            <span className="text-value text-slate-500">{etiquetaNinguno}</span>
          </label>

          {plantillas.map(plantilla => (
            <div key={plantilla.id}>
              <label className={ESTILO_OPCION}>
                <input
                  type="radio"
                  name={nombreGrupo}
                  checked={elegido?.plantillaId === plantilla.id}
                  onChange={() => onElegir(plantilla.id)}
                />
                <span className="text-value font-medium text-foreground">
                  {plantilla.nombre}
                </span>
              </label>

              {children && elegido?.plantillaId === plantilla.id && (
                <div className="flex flex-wrap items-center gap-3 px-3 pb-3 pl-9 font-sans text-xs text-slate-600">
                  {children(elegido)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
