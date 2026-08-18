"use client";

import { Alerta, ImageUploader, Modal, TextField } from "@/components/shared";
import { Button, Card } from "@/components/ui";
import {
  FieldDefinition,
  landingConfigSchema,
} from "@/views/app/panel/landing/landing-config-schema";

import { useLanding } from "./hooks";

const COL_SPAN_MD: Record<1 | 2 | 3, string> = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
};

export default function LandingView() {
  const {
    formData,
    seccionActiva,
    slides,
    processSteps,
    reviewsList,
    limiteResenas,
    cargando,
    guardando,
    sincronizando,
    confirmacionGuardar,
    errorMsg,
    actions,
  } = useLanding();

  const renderField = (f: FieldDefinition) => {
    if (f.type === "text" || f.type === "email" || f.type === "password") {
      return (
        <TextField
          key={f.key}
          etiqueta={f.label}
          type={
            f.type === "password"
              ? "password"
              : f.type === "email"
                ? "email"
                : "text"
          }
          value={(formData[f.key] as string) || ""}
          onChange={e => actions.handleChange(f.key, e.target.value)}
          obligatorio={f.required}
          required={f.required}
        />
      );
    }
    if (f.type === "textarea") {
      return (
        <div
          key={f.key}
          className={`col-span-1 ${COL_SPAN_MD[f.gridCols ?? 1]}`}
        >
          <label className="mb-1 block text-xs font-medium text-panel-sidebar">
            {f.label} {f.required && <span className="text-red-600">*</span>}
          </label>
          <textarea
            value={(formData[f.key] as string) || ""}
            onChange={e => actions.handleChange(f.key, e.target.value)}
            rows={f.rows || 3}
            required={f.required}
            className="w-full rounded-xl border border-brand-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-panel-sidebar bg-white"
          />
        </div>
      );
    }
    if (f.type === "image") {
      return (
        <ImageUploader
          key={f.key}
          etiqueta={f.label}
          value={(formData[f.key] as string) || ""}
          onChange={secureUrl => actions.handleChange(f.key, secureUrl)}
          folder={f.folder}
        />
      );
    }
    return null;
  };

  const renderDynamicFields = (sectionId: string) => {
    const section = landingConfigSchema.find(s => s.id === sectionId);
    if (!section || !section.fields) return null;

    // Agrupar campos para respetar gridCols
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {section.fields.map(f => {
            if (f.sectionHeader) {
              // Si tiene section header, rompemos el grid?
              // Para simplificar, renderizamos todo el bloque. En un sistema más complejo agruparíamos por headers.
              return (
                <div
                  key={f.key + "_wrap"}
                  className="md:col-span-2 pt-4 border-t border-slate-200"
                >
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-primary mb-4">
                    {f.sectionHeader}
                  </h3>
                  {renderField(f)}
                </div>
              );
            }
            if (f.gridCols === 1) {
              return (
                <div key={f.key} className="md:col-span-2">
                  {renderField(f)}
                </div>
              );
            }
            return renderField(f);
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <div className="flex flex-col gap-1 border-b border-brand-border pb-4">
        <h1 className="text-2xl font-bold text-panel-sidebar">
          Configuración de la Landing Page
        </h1>
        <p className="text-sm text-brand-muted">
          Edita en tiempo real los textos, pasos de atención, imágenes
          Cloudinary y reseñas de Google.
        </p>
      </div>

      {cargando ? (
        <Card className="p-6">
          <p className="text-sm text-brand-muted py-8 text-center">
            Cargando configuración actual del servidor...
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {landingConfigSchema.map(section => (
              <Card
                key={section.id}
                className="p-6 cursor-pointer hover:border-brand-primary/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between group"
                onClick={() => actions.setSeccionActiva(section.id)}
              >
                <div>
                  <h3 className="font-bold text-panel-sidebar group-hover:text-brand-primary transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-sm text-brand-muted mt-2">
                    {section.description}
                  </p>
                </div>
                <div className="mt-4 text-brand-primary text-xs font-bold self-end group-hover:underline">
                  Editar →
                </div>
              </Card>
            ))}
          </div>

          <Modal
            abierto={!!seccionActiva}
            onCerrar={() => actions.setSeccionActiva(null)}
          >
            {seccionActiva && (
              <div className="p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
                  <h2 className="text-xl font-bold text-slate-900">
                    Configuración:{" "}
                    {
                      landingConfigSchema
                        .find(s => s.id === seccionActiva)
                        ?.title.split(". ")[1]
                    }
                  </h2>
                </div>

                <form onSubmit={actions.handleGuardar} className="space-y-6">
                  {/* DYNAMIC FORM RENDERING */}
                  {renderDynamicFields(seccionActiva)}

                  {seccionActiva === "team" && (
                    <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                      <p className="text-sm text-blue-800 flex items-start gap-2">
                        <svg
                          className="w-5 h-5 shrink-0 mt-0.5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                        <span>
                          <strong>Nota:</strong> Las cartas de los especialistas
                          (foto, nombre, rol, especialidad) se configuran
                          individualmente en la sección{" "}
                          <strong>Especialistas</strong> del menú lateral
                          izquierdo.
                        </span>
                      </p>
                    </div>
                  )}

                  {/* CUSTOM RENDERERS FOR ARRAYS */}
                  {seccionActiva === "process" && (
                    <div className="space-y-4 pt-4 border-t border-slate-200 mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-primary">
                          Lista de Pasos
                        </h3>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={actions.handleAgregarProcessStep}
                        >
                          + Agregar Paso
                        </Button>
                      </div>
                      {processSteps.map((step, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-brand-border bg-white p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-xs font-bold text-slate-800">
                              Paso #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                actions.handleEliminarProcessStep(idx)
                              }
                              className="text-xs text-red-600 font-bold hover:underline"
                            >
                              Eliminar
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <TextField
                              etiqueta="Título del Paso"
                              value={step.title}
                              onChange={e =>
                                actions.handleProcessStepChange(
                                  idx,
                                  "title",
                                  e.target.value
                                )
                              }
                              obligatorio
                            />
                            <TextField
                              etiqueta="Número (ej: 01)"
                              value={step.num}
                              onChange={e =>
                                actions.handleProcessStepChange(
                                  idx,
                                  "num",
                                  e.target.value
                                )
                              }
                              obligatorio
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-panel-sidebar">
                              Descripción
                            </label>
                            <textarea
                              value={step.description}
                              onChange={e =>
                                actions.handleProcessStepChange(
                                  idx,
                                  "description",
                                  e.target.value
                                )
                              }
                              rows={2}
                              required
                              className="w-full rounded-xl border border-brand-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-panel-sidebar bg-slate-50"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {seccionActiva === "gallery" && (
                    <div className="space-y-4 pt-4 border-t border-slate-200 mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-primary">
                          Fotos del Carrusel ({slides.length})
                        </h3>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={actions.handleAgregarSlide}
                        >
                          + Agregar Foto
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {slides.map((slide, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl border border-brand-border bg-white p-4 flex flex-col md:flex-row gap-6 shadow-xs"
                          >
                            <div className="w-full md:w-1/3">
                              <ImageUploader
                                etiqueta={`Foto ${idx + 1}`}
                                value={slide.image}
                                onChange={secureUrl =>
                                  actions.handleSlideChange(
                                    idx,
                                    "image",
                                    secureUrl
                                  )
                                }
                                folder="kinefit/gallery"
                              />
                            </div>
                            <div className="w-full mdmd:w-2/3 space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800">
                                  Información del Slide
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    actions.handleEliminarSlide(idx)
                                  }
                                  className="text-xs text-red-600 font-bold hover:underline"
                                >
                                  Eliminar
                                </button>
                              </div>
                              <TextField
                                etiqueta="Título"
                                value={slide.title}
                                onChange={e =>
                                  actions.handleSlideChange(
                                    idx,
                                    "title",
                                    e.target.value
                                  )
                                }
                                obligatorio
                              />
                              <div>
                                <label className="mb-1 block text-xs font-medium text-panel-sidebar">
                                  Descripción
                                </label>
                                <textarea
                                  value={slide.description}
                                  onChange={e =>
                                    actions.handleSlideChange(
                                      idx,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  rows={2}
                                  required
                                  className="w-full rounded-xl border border-brand-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-panel-sidebar bg-slate-50"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {seccionActiva === "reviews" && (
                    <div className="space-y-4 mt-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 mt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              Sincronización con Google Places
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              La API Key de Google se procesa de forma segura en
                              el servidor.
                            </p>
                          </div>
                          <Button
                            type="button"
                            disabled={sincronizando}
                            onClick={actions.handleSincronizarGoogle}
                          >
                            {sincronizando
                              ? "Conectando..."
                              : "Sincronizar Ahora"}
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <TextField
                            etiqueta="URL de Reseñas Google Maps"
                            value={formData.googleReviewsUrl || ""}
                            onChange={e =>
                              actions.handleChange(
                                "googleReviewsUrl",
                                e.target.value
                              )
                            }
                          />
                          <TextField
                            etiqueta="Google Place ID"
                            value={formData.googlePlaceId || ""}
                            onChange={e =>
                              actions.handleChange(
                                "googlePlaceId",
                                e.target.value
                              )
                            }
                          />
                          <div>
                            <label className="mb-1 block text-xs font-medium text-panel-sidebar">
                              Cantidad Máxima de Reseñas
                            </label>
                            <select
                              value={limiteResenas}
                              onChange={e =>
                                actions.setLimiteResenas(Number(e.target.value))
                              }
                              className="w-full rounded-xl border border-brand-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-panel-sidebar bg-white"
                            >
                              <option value={3}>3 reseñas</option>
                              <option value={5}>5 reseñas</option>
                              <option value={8}>8 reseñas</option>
                              <option value={10}>10 reseñas</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-primary">
                            Reseñas ({reviewsList.length})
                          </h3>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={actions.handleAgregarReview}
                          >
                            + Agregar Manual
                          </Button>
                        </div>
                        {reviewsList.map((rev, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl border border-brand-border bg-white p-4 space-y-3 shadow-xs"
                          >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="text-xs font-bold text-slate-800">
                                Reseña #{idx + 1} • {rev.author}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  actions.handleEliminarReview(idx)
                                }
                                className="text-xs text-red-600 font-bold hover:underline"
                              >
                                Eliminar
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <TextField
                                etiqueta="Nombre Paciente"
                                value={rev.author}
                                onChange={e =>
                                  actions.handleReviewChange(
                                    idx,
                                    "author",
                                    e.target.value
                                  )
                                }
                                obligatorio
                              />
                              <TextField
                                etiqueta="Rol"
                                value={rev.role || ""}
                                onChange={e =>
                                  actions.handleReviewChange(
                                    idx,
                                    "role",
                                    e.target.value
                                  )
                                }
                              />
                              <TextField
                                etiqueta="Fecha / Antigüedad"
                                value={rev.date || ""}
                                onChange={e =>
                                  actions.handleReviewChange(
                                    idx,
                                    "date",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-panel-sidebar">
                                Comentario{" "}
                                <span className="text-red-600">*</span>
                              </label>
                              <textarea
                                value={rev.quote}
                                onChange={e =>
                                  actions.handleReviewChange(
                                    idx,
                                    "quote",
                                    e.target.value
                                  )
                                }
                                rows={2}
                                required
                                className="w-full rounded-xl border border-brand-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-panel-sidebar bg-slate-50"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {errorMsg && (
                    <Alerta tono="error" className="text-center">
                      {errorMsg}
                    </Alerta>
                  )}

                  <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => actions.setSeccionActiva(null)}
                    >
                      Cerrar sin Guardar
                    </Button>
                    <Button type="submit" disabled={guardando}>
                      {guardando ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </Modal>
        </>
      )}

      {confirmacionGuardar && (
        <Modal
          abierto={confirmacionGuardar}
          onCerrar={() => actions.setConfirmacionGuardar(false)}
        >
          <div className="p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              Confirmar Cambios
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              ¿Estás seguro que deseas guardar los cambios? Esto actualizará la
              vista pública de la Landing Page inmediatamente.
            </p>
            {errorMsg && (
              <Alerta tono="error" className="text-center mb-6">
                {errorMsg}
              </Alerta>
            )}
            <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => actions.setConfirmacionGuardar(false)}
                disabled={guardando}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={actions.ejecutarGuardar}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Sí, guardar cambios"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
