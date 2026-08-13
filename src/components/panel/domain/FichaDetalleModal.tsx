"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFicha, fichasDelPaciente, FichaResuelta } from "@/lib/panel/data/fichas";
import { getFormato, obtenerEtiquetaCampo, FormatoResuelto } from "@/lib/panel/data/formatos";
import { formatearFechaCorta, formatearFechaHora, formatearRangoHorario } from "@/lib/panel/domain/formato";
import { Modal } from "../primitives/Modal";
import { Button } from "../primitives/Button";
import { NeutralBadge } from "../primitives/Badge";
import { OutOfScopeInlineLink } from "../primitives/OutOfScope";

interface FichaDetalleModalProps {
  fichaId: string | null;
  hoy: Date;
  onCerrar: () => void;
  onSeleccionarFicha?: (nuevaFichaId: string) => void;
}

export function FichaDetalleModal({ fichaId, hoy, onCerrar, onSeleccionarFicha }: FichaDetalleModalProps) {
  const router = useRouter();
  const [ficha, setFicha] = useState<FichaResuelta | null>(null);
  const [formato, setFormato] = useState<FormatoResuelto | null>(null);
  const [anteriores, setAnteriores] = useState<FichaResuelta[]>([]);
  const [adjuntosLocales, setAdjuntosLocales] = useState<string[]>([]);

  useEffect(() => {
    if (!fichaId || !hoy) {
      setFicha(null);
      setFormato(null);
      setAnteriores([]);
      setAdjuntosLocales([]);
      return;
    }
    getFicha(fichaId, hoy).then((resultado) => {
      setFicha(resultado ?? null);
      if (resultado) {
        setAdjuntosLocales(resultado.adjuntos);
      }
    });
  }, [fichaId, hoy]);

  useEffect(() => {
    if (!hoy || !ficha) return;
    getFormato(ficha.formatoId, hoy).then((resultado) => setFormato(resultado ?? null));
    fichasDelPaciente(ficha.paciente.id, hoy).then((todas) =>
      setAnteriores(todas.filter((f) => f.id !== ficha.id))
    );
  }, [ficha, hoy]);

  function handleImprimirFicha() {
    if (!ficha) return;
    const ventanaImpresion = window.open("", "_blank");
    if (!ventanaImpresion) return;

    ventanaImpresion.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ficha Clínica — ${ficha.paciente.nombre} ${ficha.paciente.apellido}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 32px; color: #0f172a; line-height: 1.5; }
            .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
            .h1 { font-size: 24px; font-weight: bold; margin: 0 0 8px 0; }
            .sub { font-size: 14px; color: #475569; }
            .section { margin-bottom: 24px; }
            .section-title { font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            .field { margin-bottom: 12px; }
            .label { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #64748b; }
            .value { font-size: 14px; margin-top: 2px; }
            .box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; font-size: 14px; }
            .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; pt: 16px; font-size: 11px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="h1">KineFit — ${ficha.tipo}</h1>
            <p class="sub">Paciente: <strong>${ficha.paciente.nombre} ${ficha.paciente.apellido}</strong> | RUT: ${ficha.paciente.rut}</p>
            <p class="sub">Fecha de Atención: ${formatearFechaCorta(ficha.cita.fecha)} | Registrada por ${ficha.registradaPor}</p>
          </div>

          ${formato?.secciones.map((sec) => `
            <div class="section">
              <div class="section-title">${sec.nombre}</div>
              ${sec.campos.map((cmp) => `
                <div class="field">
                  <div class="label">${cmp.nombre}</div>
                  <div class="box">${ficha.contenido[cmp.id] || "—"}</div>
                </div>
              `).join('')}
            </div>
          `).join('')}

          <div class="footer">
            Documento Clínico Confidencial KineFit — Generado el ${new Date().toLocaleDateString('es-CL')}
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
    setAdjuntosLocales((prev) => [...prev, archivo.name]);
  }

  return (
    <Modal abierto={Boolean(fichaId)} onCerrar={onCerrar}>
      {!ficha ? (
        <div className="p-10 text-center text-sm text-brand-muted">Cargando…</div>
      ) : (
        <div className="text-sm text-panel-sidebar flex flex-col max-h-[85vh]">
          {/* Encabezado Formal */}
          <div className="flex items-start justify-between gap-4 border-b border-brand-border p-6 pb-4 bg-white shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-panel-sidebar">
                  Detalle de Ficha Clínica
                </h2>
                <NeutralBadge>{ficha.tipo}</NeutralBadge>
              </div>
              <p className="text-xs text-brand-muted mt-0.5 font-medium">
                {ficha.paciente.nombre} {ficha.paciente.apellido} | RUT {ficha.paciente.rut}
              </p>
            </div>
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar modal"
              className="rounded-full p-1.5 text-brand-muted hover:bg-panel-fondo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar"
            >
              &times;
            </button>
          </div>

          {/* Aviso Privado */}
          <div className="bg-panel-seleccion/60 px-6 py-2 text-xs text-panel-sidebar border-b border-brand-border/60">
            Contenido privado. No visible para el paciente.
          </div>

          {/* Cuerpo Principal del Modal con Único Scrollbar */}
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* SECCIÓN 1: DATOS GENERALES */}
            <div className="space-y-2">
              <p className="border-b border-brand-border pb-1.5 text-xs font-bold uppercase tracking-wider text-brand-muted">
                Datos Generales
              </p>
              <div className="space-y-1.5 text-sm pt-0.5">
                <div className="flex justify-between items-center">
                  <span className="text-brand-muted font-medium">Paciente:</span>
                  <span className="font-bold text-panel-sidebar">
                    {ficha.paciente.nombre} {ficha.paciente.apellido}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-muted font-medium">RUT:</span>
                  <span className="font-semibold text-panel-sidebar">{ficha.paciente.rut}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-muted font-medium">Atención Asociada:</span>
                  <span className="font-medium text-panel-sidebar">
                    {formatearFechaCorta(ficha.cita.fecha)} | {formatearRangoHorario(ficha.cita.horaInicio, ficha.cita.horaTermino)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-muted font-medium">Registrada Por:</span>
                  <span className="font-semibold text-panel-sidebar">
                    {ficha.registradaPor} ({formatearFechaHora(ficha.creadaEn)})
                  </span>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: CAMPOS DEL FORMATO DE FICHA */}
            {formato && formato.secciones && formato.secciones.length > 0 ? (
              formato.secciones.map((seccion) => (
                <div key={seccion.id} className="space-y-2">
                  <p className="border-b border-brand-border pb-1.5 text-xs font-bold uppercase tracking-wider text-brand-muted">
                    {seccion.nombre}
                  </p>
                  <div className="space-y-2 pt-0.5">
                    {seccion.campos.map((campo) => (
                      <div key={campo.id} className="space-y-0.5">
                        <span className="text-xs font-semibold text-brand-muted uppercase tracking-wide">
                          {campo.nombre}
                        </span>
                        <p className="text-sm font-medium text-panel-sidebar bg-panel-fondo p-2.5 rounded-lg border border-brand-border/60 whitespace-pre-wrap">
                          {ficha.contenido[campo.id] || "—"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              /* Renderizado dinámico de entradas reales en la base de datos */
              <div className="space-y-2">
                <p className="border-b border-brand-border pb-1.5 text-xs font-bold uppercase tracking-wider text-brand-muted">
                  Contenido Clínico Registrado
                </p>
                {Object.keys(ficha.contenido).length === 0 ? (
                  <p className="text-sm text-brand-muted italic py-1">Sin respuestas escritas en esta ficha.</p>
                ) : (
                  <div className="space-y-2 pt-0.5">
                    {Object.entries(ficha.contenido).map(([clave, valor]) => (
                      <div key={clave} className="space-y-0.5">
                        <span className="text-xs font-semibold text-brand-muted uppercase tracking-wide">
                          {obtenerEtiquetaCampo(clave)}
                        </span>
                        <p className="text-sm font-medium text-panel-sidebar bg-panel-fondo p-2.5 rounded-lg border border-brand-border/60 whitespace-pre-wrap">
                          {String(valor || "—")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SECCIÓN 3: DOCUMENTOS ADJUNTOS DE RESPALDO (FIC-002) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-brand-border pb-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                  Documentos Adjuntos de Respaldo (PDF / Imágenes)
                </p>
                <label className="cursor-pointer text-xs font-semibold text-panel-sidebar hover:underline">
                  Adjuntar documento
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleSubirAdjuntoSimulado}
                    className="hidden"
                  />
                </label>
              </div>

              {adjuntosLocales.length === 0 ? (
                <p className="text-xs text-brand-muted italic py-1">Sin archivos adjuntos de respaldo.</p>
              ) : (
                <ul className="space-y-1.5 pt-0.5">
                  {adjuntosLocales.map((nombre) => (
                    <li key={nombre} className="flex items-center justify-between py-2 px-3 rounded-lg border border-brand-border/60 bg-panel-fondo text-sm">
                      <span className="font-semibold text-panel-sidebar">{nombre}</span>
                      <div className="flex items-center gap-3">
                        <OutOfScopeInlineLink etiqueta="Ver" />
                        <OutOfScopeInlineLink etiqueta="Descargar" />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* SECCIÓN 4: FICHAS ANTERIORES DEL PACIENTE */}
            <div className="space-y-2">
              <p className="border-b border-brand-border pb-1.5 text-xs font-bold uppercase tracking-wider text-brand-muted">
                Fichas Anteriores del Paciente
              </p>
              {anteriores.length === 0 ? (
                <p className="text-sm text-brand-muted py-1">Esta es la única ficha registrada para este paciente.</p>
              ) : (
                <ul className="divide-y divide-brand-border/60 pt-0.5">
                  {anteriores.map((anterior) => (
                    <li key={anterior.id} className="flex justify-between items-center py-2 text-sm">
                      <span className="font-semibold text-panel-sidebar">{anterior.tipo}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-brand-muted">{formatearFechaCorta(anterior.cita.fecha)}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (onSeleccionarFicha) {
                              onSeleccionarFicha(anterior.id);
                            } else {
                              onCerrar();
                              router.push(`/panel/fichas?ficha=${anterior.id}`);
                            }
                          }}
                          className="text-xs font-semibold text-panel-sidebar underline underline-offset-2"
                        >
                          Ver ficha
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Pie de Acciones FIJO (Sticky Footer) */}
          <div className="border-t border-brand-border bg-white p-6 shrink-0 flex items-center justify-end gap-3 shadow-md">
            <Button variante="secundario" onClick={onCerrar}>
              Cerrar
            </Button>
            <Button variante="secundario" onClick={handleImprimirFicha}>
              Exportar PDF
            </Button>
            <Button variante="primario" onClick={handleImprimirFicha}>
              Imprimir Ficha
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
