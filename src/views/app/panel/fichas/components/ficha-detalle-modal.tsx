"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Modal } from "@/components/shared";
import { Badge } from "@/components/ui";
import { useGetCita } from "@/hooks/api";
import {
  formatearFechaCorta,
  formatearFechaHora,
  formatearRangoHorario,
} from "@/lib/formato";
import { obtenerEtiquetaCampo } from "@/lib/formatos-ficha";
import { FichaResponse } from "@/models/responses";
import { fichaService } from "@/services";

function OutOfScopeInlineLink({ etiqueta }: { etiqueta: string }) {
  const [mostrar, setMostrar] = useState(false);
  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setMostrar(v => !v)}
        className="text-panel-sidebar underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar rounded"
      >
        {etiqueta}
      </button>
      {mostrar && (
        <span
          role="status"
          className="absolute left-0 top-full z-20 mt-2 w-64 rounded-lg border border-brand-border bg-white p-3 text-xs text-brand-muted shadow-lg"
        >
          Esta funcionalidad está fuera del alcance de este prototipo.
        </span>
      )}
    </span>
  );
}

interface FichaDetalleModalProps {
  fichaId: string | null;
  hoy: Date;
  onCerrar: () => void;
  onSeleccionarFicha?: (nuevaFichaId: number) => void;
}

export function FichaDetalleModal({
  fichaId,
  hoy,
  onCerrar,
  onSeleccionarFicha,
}: FichaDetalleModalProps) {
  const router = useRouter();
  const [ficha, setFicha] = useState<FichaResponse | null>(null);
  const [anteriores, setAnteriores] = useState<FichaResponse[]>([]);
  const [adjuntosLocales, setAdjuntosLocales] = useState<string[]>([]);

  useEffect(() => {
    if (!fichaId) {
      setFicha(null);
      setAnteriores([]);
      setAdjuntosLocales([]);
      return;
    }
    fichaService.getById(Number(fichaId)).then(res => {
      const resultado = res.data.data;
      setFicha(resultado);
      setAdjuntosLocales(resultado.adjuntos.map(a => a.nombreOriginal));
    });
  }, [fichaId]);

  const { data: cita } = useGetCita(ficha?.citaId ?? 0, Boolean(ficha));

  useEffect(() => {
    if (!cita || !ficha) return;
    fichaService.getHistorialPorPaciente(cita.paciente.id).then(res => {
      setAnteriores(res.data.data.filter(f => f.id !== ficha.id));
    });
  }, [cita, ficha]);

  function handleImprimirFicha() {
    if (!ficha || !cita) return;
    const ventanaImpresion = window.open("", "_blank");
    if (!ventanaImpresion) return;

    ventanaImpresion.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ficha Clínica — ${cita.paciente.nombre} ${cita.paciente.apellido}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 32px; color: #0f172a; line-height: 1.5; }
            .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
            .h1 { font-size: 20px; font-weight: bold; margin: 0 0 8px 0; }
            .sub { font-size: 13px; color: #475569; }
            .section { margin-bottom: 20px; }
            .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px; }
            .field { margin-bottom: 10px; }
            .label { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #64748b; }
            .value { font-size: 13px; margin-top: 2px; }
            .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="h1">KineFit — ${ficha.tipoNombre}</h1>
            <p class="sub">Paciente: <strong>${cita.paciente.nombre} ${cita.paciente.apellido}</strong> | RUT: ${cita.paciente.rut || "—"}</p>
            <p class="sub">Fecha de Atención: ${formatearFechaCorta(new Date(`${cita.fecha}T00:00:00`))} | Registrada por ${cita.especialista.nombre}</p>
          </div>

          ${Object.entries(ficha.contenido)
            .map(
              ([clave, valor]) => `
            <div class="field">
              <div class="label">${obtenerEtiquetaCampo(clave)}</div>
              <div class="value">${valor || "—"}</div>
            </div>
          `
            )
            .join("")}

          <div class="footer">
            Documento Clínico Confidencial KineFit — Generado el ${new Date().toLocaleDateString("es-CL")}
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    ventanaImpresion.document.close();
  }

  function handleSubirAdjuntoSimulado(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const archivo = e.target.files[0];
    setAdjuntosLocales(prev => [...prev, archivo.name]);
  }

  return (
    <Modal abierto={Boolean(fichaId)} onCerrar={onCerrar}>
      {!ficha || !cita ? (
        <div className="p-10 text-center font-sans text-xs text-slate-500">
          Cargando ficha…
        </div>
      ) : (
        <div className="bg-white text-slate-900 font-sans shadow-none rounded-none">
          {/* Encabezado Formal */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900">
                  Detalle de Ficha Clínica
                </h2>
                <Badge className="rounded-none border-slate-200 bg-slate-50 text-[11px] font-medium text-slate-700">
                  {ficha.tipoNombre}
                </Badge>
              </div>
              <p className="font-sans text-xs text-slate-500 mt-0.5">
                {cita.paciente.nombre} {cita.paciente.apellido} · RUT{" "}
                <span className="text-slate-700 font-medium">
                  {cita.paciente.rut || "—"}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar modal"
              className="p-1 font-sans text-sm text-slate-400 hover:text-slate-900 rounded-none focus:outline-none"
            >
              ✕
            </button>
          </div>

          <div className="border-b border-slate-200 bg-white px-6 py-2 text-xs text-slate-500">
            Contenido privado. No visible para el paciente.
          </div>

          {/* Cuerpo en 2 Columnas */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {/* COLUMNA IZQUIERDA PRINCIPAL (2/3) */}
            <div className="md:col-span-2 p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Contenido Clínico */}
              <div>
                <h3 className="border-b border-slate-200 pb-1 font-sans text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-3">
                  CONTENIDO CLÍNICO REGISTRADO
                </h3>

                {Object.keys(ficha.contenido).length === 0 ? (
                  <p className="font-sans text-xs text-slate-400 italic py-2">
                    Sin respuestas escritas en esta ficha.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(ficha.contenido).map(([clave, valor]) => (
                      <div key={clave}>
                        <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                          {obtenerEtiquetaCampo(clave)}
                        </span>
                        <p className="font-sans font-medium text-sm text-slate-900 mt-0.5 whitespace-pre-wrap">
                          {String(valor || "—")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Adjuntos */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                    Archivos Adjuntos de Respaldo
                  </span>
                  <label className="cursor-pointer font-sans text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-950">
                    Adjuntar
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleSubirAdjuntoSimulado}
                      className="hidden"
                    />
                  </label>
                </div>

                {adjuntosLocales.length === 0 ? (
                  <p className="font-sans text-xs text-slate-400 italic">
                    Sin archivos adjuntos.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-200 border border-slate-200 rounded-none bg-slate-50/50">
                    {adjuntosLocales.map(nombre => (
                      <li
                        key={nombre}
                        className="flex items-center justify-between p-2.5 text-xs font-sans font-medium text-slate-800"
                      >
                        <span>{nombre}</span>
                        <div className="flex items-center gap-3">
                          <OutOfScopeInlineLink etiqueta="Ver" />
                          <OutOfScopeInlineLink etiqueta="Descargar" />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* COLUMNA DERECHA SECUNDARIA (1/3) - FICHA RÁPIDA */}
            <div className="md:col-span-1 bg-slate-50/80 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="border-b border-slate-200 pb-1 font-sans text-[10px] font-medium uppercase tracking-widest text-slate-400">
                  DATOS DE LA ATENCIÓN
                </h3>

                <div>
                  <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                    Paciente
                  </span>
                  <p className="font-sans font-medium text-sm text-slate-900 mt-0.5">
                    {cita.paciente.nombre} {cita.paciente.apellido}
                  </p>
                </div>

                <div>
                  <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                    RUT
                  </span>
                  <p className="font-sans font-medium text-sm text-slate-900 mt-0.5">
                    {cita.paciente.rut || "—"}
                  </p>
                </div>

                <div>
                  <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                    Atención Asociada
                  </span>
                  <p className="font-sans font-medium text-sm text-slate-900 mt-0.5">
                    {formatearFechaCorta(new Date(`${cita.fecha}T00:00:00`))} ·{" "}
                    {formatearRangoHorario(cita.horaInicio, cita.horaFin)}
                  </p>
                </div>

                <div>
                  <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                    Registrada Por
                  </span>
                  <p className="font-sans font-medium text-sm text-slate-900 mt-0.5">
                    {cita.especialista.nombre}
                  </p>
                  <p className="font-sans text-xs text-slate-500">
                    {formatearFechaHora(new Date(ficha.createdAt))}
                  </p>
                </div>

                {anteriores.length > 0 && (
                  <div className="pt-3 border-t border-slate-200/80">
                    <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-2">
                      Fichas Anteriores
                    </span>
                    <ul className="divide-y divide-slate-200">
                      {anteriores.map(anterior => (
                        <li
                          key={anterior.id}
                          className="flex justify-between items-center py-2 text-xs"
                        >
                          <span className="font-sans font-medium text-slate-900">
                            {anterior.tipoNombre}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (onSeleccionarFicha)
                                onSeleccionarFicha(anterior.id);
                              else {
                                onCerrar();
                                router.push(
                                  `/panel/fichas?ficha=${anterior.id}`
                                );
                              }
                            }}
                            className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-700 hover:text-slate-950 underline"
                          >
                            Ver
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pie de Acciones */}
          <div className="border-t border-slate-200 bg-slate-50/60 p-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCerrar}
              className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 rounded-none shadow-none"
            >
              CERRAR
            </button>
            <button
              type="button"
              onClick={handleImprimirFicha}
              className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white rounded-none shadow-none"
            >
              IMPRIMIR FICHA
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
