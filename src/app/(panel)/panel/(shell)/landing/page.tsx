"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/panel/primitives/Card";
import { Modal } from "@/components/panel/primitives/Modal";
import { Button } from "@/components/panel/primitives/Button";
import { TextField } from "@/components/panel/primitives/CamposFormulario";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { 
  landingConfigService, 
  LandingConfigData, 
  defaultLandingConfig,
  GallerySlideItem,
  ProcessStepItem,
  defaultProcessSteps,
  GoogleReviewItem,
  defaultGoogleReviews
} from "@/lib/services/landingConfig.service";
import { CAROUSEL_SLIDES } from "@/lib/constants";
import { landingConfigSchema, FieldDefinition } from "@/lib/schemas/landingConfig.schema";

export default function ConfigLandingPage() {
  const [formData, setFormData] = useState<LandingConfigData>(defaultLandingConfig);
  const [seccionActiva, setSeccionActiva] = useState<string | null>(null);
  const [slides, setSlides] = useState<GallerySlideItem[]>(CAROUSEL_SLIDES);
  const [processSteps, setProcessSteps] = useState<ProcessStepItem[]>(defaultProcessSteps);
  const [reviewsList, setReviewsList] = useState<GoogleReviewItem[]>(defaultGoogleReviews);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const [confirmacionGuardar, setConfirmacionGuardar] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function cargarConfiguracion() {
      try {
        const config = await landingConfigService.getConfig();
        setFormData(config);
        if (config.galleryJson) {
          try {
            const parsed = JSON.parse(config.galleryJson);
            if (Array.isArray(parsed) && parsed.length > 0) setSlides(parsed);
          } catch {}
        }
        if (config.processStepsJson) {
          try {
            const parsedSteps = JSON.parse(config.processStepsJson);
            if (Array.isArray(parsedSteps) && parsedSteps.length > 0) setProcessSteps(parsedSteps);
          } catch {}
        }
        if (config.reviewsJson) {
          try {
            const parsedReviews = JSON.parse(config.reviewsJson);
            if (Array.isArray(parsedReviews) && parsedReviews.length > 0) setReviewsList(parsedReviews);
          } catch {}
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
      } finally {
        setCargando(false);
      }
    }
    cargarConfiguracion();
  }, []);

  function handleChange(field: keyof LandingConfigData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  // Complejas (Arrays)
  function handleSlideChange(index: number, field: keyof GallerySlideItem, value: unknown) {
    setSlides((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }
  function handleAgregarSlide() {
    setSlides((prev) => [...prev, { title: "Nuevo Espacio", description: "", image: "", features: [] }]);
  }
  function handleEliminarSlide(index: number) {
    setSlides((prev) => prev.filter((_, i) => i !== index));
  }

  function handleProcessStepChange(index: number, field: keyof ProcessStepItem, value: string) {
    setProcessSteps((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }
  function handleAgregarProcessStep() {
    setProcessSteps((prev) => [...prev, { id: prev.length + 1, num: String(prev.length + 1), title: "Nuevo Paso", description: "", iconName: "star" } as any]);
  }
  function handleEliminarProcessStep(index: number) {
    setProcessSteps((prev) => prev.filter((_, i) => i !== index));
  }

  function handleReviewChange(index: number, field: keyof GoogleReviewItem, value: unknown) {
    setReviewsList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }
  function handleAgregarReview() {
    setReviewsList((prev) => [...prev, { author: "Paciente Anónimo", quote: "", rating: 5, isVerifiedGoogle: false }]);
  }
  function handleEliminarReview(index: number) {
    setReviewsList((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSincronizarGoogle() {
    setSincronizando(true);
    setErrorMsg(null);
    try {
      await new Promise(r => setTimeout(r, 1500));
      // Logica de sync...
    } catch (err) {
      setErrorMsg("Ocurrió un error al sincronizar con Google. Revisa tu API Key.");
    } finally {
      setSincronizando(false);
    }
  }

  function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setConfirmacionGuardar(true);
  }

  async function ejecutarGuardar() {
    setGuardando(true);
    setErrorMsg(null);

    try {
      const dataToSave = {
        ...formData,
        galleryJson: JSON.stringify(slides),
        processStepsJson: JSON.stringify(processSteps),
        reviewsJson: JSON.stringify(reviewsList),
      };
      const res = await landingConfigService.updateConfig(dataToSave as any);
      setFormData(res);
      setConfirmacionGuardar(false);
      setSeccionActiva(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setGuardando(false);
    }
  }

  const renderField = (f: FieldDefinition) => {
    if (f.type === "text" || f.type === "email" || f.type === "password") {
      return (
        <TextField
          key={f.key}
          etiqueta={f.label}
          type={f.type === "password" ? "password" : f.type === "email" ? "email" : "text"}
          value={(formData[f.key] as string) || ""}
          onChange={(e) => handleChange(f.key, e.target.value)}
          obligatorio={f.required}
          required={f.required}
        />
      );
    }
    if (f.type === "textarea") {
      return (
        <div key={f.key} className={`col-span-1 md:col-span-${f.gridCols || 1}`}>
          <label className="mb-1 block text-xs font-medium text-panel-sidebar">
            {f.label} {f.required && <span className="text-red-600">*</span>}
          </label>
          <textarea
            value={(formData[f.key] as string) || ""}
            onChange={(e) => handleChange(f.key, e.target.value)}
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
          onChange={(secureUrl) => handleChange(f.key, secureUrl)}
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
                  <div key={f.key + '_wrap'} className="md:col-span-2 pt-4 border-t border-slate-200">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-primary mb-4">{f.sectionHeader}</h3>
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
        <h1 className="text-2xl font-bold text-panel-sidebar">Configuración de la Landing Page</h1>
        <p className="text-sm text-brand-muted">
          Edita en tiempo real los textos, pasos de atención, imágenes Cloudinary y reseñas de Google.
        </p>
      </div>

      {cargando ? (
        <Card>
          <p className="text-sm text-brand-muted py-8 text-center">Cargando configuración actual del servidor...</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {landingConfigSchema.map(section => (
              <Card key={section.id} className="cursor-pointer hover:border-brand-primary/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between group" onClick={() => setSeccionActiva(section.id)}>
                <div>
                  <h3 className="font-bold text-panel-sidebar group-hover:text-brand-primary transition-colors">{section.title}</h3>
                  <p className="text-sm text-brand-muted mt-2">{section.description}</p>
                </div>
                <div className="mt-4 text-brand-primary text-xs font-bold self-end group-hover:underline">Editar →</div>
              </Card>
            ))}
          </div>

          <Modal abierto={!!seccionActiva} onCerrar={() => setSeccionActiva(null)} ancho="max-w-4xl">
            {seccionActiva && (
              <div className="p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
                  <h2 className="text-xl font-bold text-slate-900">
                    Configuración: {landingConfigSchema.find(s => s.id === seccionActiva)?.title.split('. ')[1]}
                  </h2>
                </div>

                <form onSubmit={handleGuardar} className="space-y-6">
                  
                  {/* DYNAMIC FORM RENDERING */}
                  {renderDynamicFields(seccionActiva)}

                  {seccionActiva === "team" && (
                    <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                      <p className="text-sm text-blue-800 flex items-start gap-2">
                        <svg className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span><strong>Nota:</strong> Las cartas de los especialistas (foto, nombre, rol, especialidad) se configuran individualmente en la sección <strong>Especialistas</strong> del menú lateral izquierdo.</span>
                      </p>
                    </div>
                  )}

                  {/* CUSTOM RENDERERS FOR ARRAYS */}
                  {seccionActiva === "process" && (
                    <div className="space-y-4 pt-4 border-t border-slate-200 mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-primary">Lista de Pasos</h3>
                        <Button type="button" variante="secundario" onClick={handleAgregarProcessStep}>+ Agregar Paso</Button>
                      </div>
                      {processSteps.map((step, idx) => (
                        <div key={idx} className="rounded-xl border border-brand-border bg-white p-4 space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-xs font-bold text-slate-800">Paso #{idx + 1}</span>
                            <button type="button" onClick={() => handleEliminarProcessStep(idx)} className="text-xs text-red-600 font-bold hover:underline">Eliminar</button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <TextField etiqueta="Título del Paso" value={step.title} onChange={(e) => handleProcessStepChange(idx, "title", e.target.value)} obligatorio />
                            <TextField etiqueta="Número (ej: 01)" value={step.num} onChange={(e) => handleProcessStepChange(idx, "num", e.target.value)} obligatorio />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-panel-sidebar">Descripción</label>
                            <textarea value={step.description} onChange={(e) => handleProcessStepChange(idx, "description", e.target.value)} rows={2} required className="w-full rounded-xl border border-brand-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-panel-sidebar bg-slate-50" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {seccionActiva === "gallery" && (
                    <div className="space-y-4 pt-4 border-t border-slate-200 mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-primary">Fotos del Carrusel ({slides.length})</h3>
                        <Button type="button" variante="secundario" onClick={handleAgregarSlide}>+ Agregar Foto</Button>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {slides.map((slide, idx) => (
                          <div key={idx} className="rounded-xl border border-brand-border bg-white p-4 flex flex-col md:flex-row gap-6 shadow-xs">
                            <div className="w-full md:w-1/3">
                              <ImageUploader etiqueta={`Foto ${idx + 1}`} value={slide.image} onChange={(secureUrl) => handleSlideChange(idx, "image", secureUrl)} folder="kinefit/gallery" />
                            </div>
                            <div className="w-full mdmd:w-2/3 space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800">Información del Slide</span>
                                <button type="button" onClick={() => handleEliminarSlide(idx)} className="text-xs text-red-600 font-bold hover:underline">Eliminar</button>
                              </div>
                              <TextField etiqueta="Título" value={slide.title} onChange={(e) => handleSlideChange(idx, "title", e.target.value)} obligatorio />
                              <div>
                                <label className="mb-1 block text-xs font-medium text-panel-sidebar">Descripción</label>
                                <textarea value={slide.description} onChange={(e) => handleSlideChange(idx, "description", e.target.value)} rows={2} required className="w-full rounded-xl border border-brand-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-panel-sidebar bg-slate-50" />
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
                          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Parámetros API Google Places</h3>
                          <Button type="button" variante="primario" disabled={sincronizando} onClick={handleSincronizarGoogle}>
                            {sincronizando ? "Conectando..." : " Sincronizar Ahora"}
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <TextField etiqueta="URL de Reseñas Google Maps" value={formData.googleReviewsUrl || ""} onChange={(e) => handleChange("googleReviewsUrl", e.target.value)} />
                          <TextField etiqueta="Google Place ID" value={formData.googlePlaceId || ""} onChange={(e) => handleChange("googlePlaceId", e.target.value)} />
                          <TextField etiqueta="Google Maps API Key" type="password" value={formData.googleApiKey || ""} onChange={(e) => handleChange("googleApiKey", e.target.value)} />
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-primary">Reseñas ({reviewsList.length})</h3>
                          <Button type="button" variante="secundario" onClick={handleAgregarReview}>+ Agregar Manual</Button>
                        </div>
                        {reviewsList.map((rev, idx) => (
                          <div key={idx} className="rounded-xl border border-brand-border bg-white p-4 space-y-3 shadow-xs">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="text-xs font-bold text-slate-800">Reseña #{idx + 1} • {rev.author}</span>
                              <button type="button" onClick={() => handleEliminarReview(idx)} className="text-xs text-red-600 font-bold hover:underline">Eliminar</button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <TextField etiqueta="Nombre Paciente" value={rev.author} onChange={(e) => handleReviewChange(idx, "author", e.target.value)} obligatorio />
                              <TextField etiqueta="Rol" value={rev.role || ""} onChange={(e) => handleReviewChange(idx, "role", e.target.value)} />
                              <TextField etiqueta="Fecha / Antigüedad" value={rev.date || ""} onChange={(e) => handleReviewChange(idx, "date", e.target.value)} />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-panel-sidebar">Comentario <span className="text-red-600">*</span></label>
                              <textarea value={rev.quote} onChange={(e) => handleReviewChange(idx, "quote", e.target.value)} rows={2} required className="w-full rounded-xl border border-brand-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-panel-sidebar bg-slate-50" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {errorMsg && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 text-center">
                      {errorMsg}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-200">
                    <Button type="button" variante="secundario" onClick={() => setSeccionActiva(null)}>Cerrar sin Guardar</Button>
                    <Button type="submit" variante="primario" disabled={guardando}>
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
          onCerrar={() => setConfirmacionGuardar(false)} 
        >
          <div className="p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Confirmar Cambios</h3>
            <p className="text-sm text-slate-600 mb-6">
              ¿Estás seguro que deseas guardar los cambios? Esto actualizará la vista pública de la Landing Page inmediatamente.
            </p>
            {errorMsg && (
               <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 text-center mb-6">
                 {errorMsg}
               </div>
            )}
            <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
              <Button type="button" variante="secundario" onClick={() => setConfirmacionGuardar(false)} disabled={guardando}>
                Cancelar
              </Button>
              <Button type="button" variante="primario" onClick={ejecutarGuardar} disabled={guardando}>
                {guardando ? "Guardando..." : "Sí, guardar cambios"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
