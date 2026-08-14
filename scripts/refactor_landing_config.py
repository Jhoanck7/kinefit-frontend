import re

file_path = "src/app/(panel)/panel/(shell)/landing/page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add Modal to imports
if "Modal" not in content:
    content = content.replace(
        'import { Card } from "@/components/panel/primitives/Card";',
        'import { Card } from "@/components/panel/primitives/Card";\nimport { Modal } from "@/components/panel/primitives/Modal";'
    )

# Add seccionActiva state
if "seccionActiva" not in content:
    content = content.replace(
        "const [formData, setFormData] = useState<LandingConfigData>(defaultLandingConfig);",
        "const [formData, setFormData] = useState<LandingConfigData>(defaultLandingConfig);\n  const [seccionActiva, setSeccionActiva] = useState<string | null>(null);"
    )

# Modify handleGuardar to close the modal
content = content.replace(
    "setGuardadoExitoso(true);",
    "setGuardadoExitoso(true);\n      setSeccionActiva(null);"
)

# Replace the giant form with the new UI
# We need to find the form element
import re
match = re.search(r'(<form onSubmit=\{handleGuardar\} className="space-y-6">.*?)(\s*<SimulatedActionNotice)', content, re.DOTALL)
if match:
    old_form = match.group(1)
    
    # We will build the new UI
    new_ui = """
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:border-brand-primary/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between group" onClick={() => setSeccionActiva("hero")}>
            <div>
              <h3 className="font-bold text-panel-sidebar group-hover:text-brand-primary transition-colors">1. Sección Principal (Hero)</h3>
              <p className="text-sm text-brand-muted mt-2">Textos principales, CTA y fondos Cloudinary.</p>
            </div>
            <div className="mt-4 text-brand-primary text-xs font-bold self-end group-hover:underline">Editar →</div>
          </Card>

          <Card className="cursor-pointer hover:border-brand-primary/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between group" onClick={() => setSeccionActiva("about")}>
            <div>
              <h3 className="font-bold text-panel-sidebar group-hover:text-brand-primary transition-colors">2. Quiénes Somos</h3>
              <p className="text-sm text-brand-muted mt-2">Descripción, titular y URL del video o Reel.</p>
            </div>
            <div className="mt-4 text-brand-primary text-xs font-bold self-end group-hover:underline">Editar →</div>
          </Card>

          <Card className="cursor-pointer hover:border-brand-primary/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between group" onClick={() => setSeccionActiva("process")}>
            <div>
              <h3 className="font-bold text-panel-sidebar group-hover:text-brand-primary transition-colors">3. Nuestro Proceso</h3>
              <p className="text-sm text-brand-muted mt-2">Pasos de atención detallados (1, 2, 3...).</p>
            </div>
            <div className="mt-4 text-brand-primary text-xs font-bold self-end group-hover:underline">Editar →</div>
          </Card>

          <Card className="cursor-pointer hover:border-brand-primary/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between group" onClick={() => setSeccionActiva("gallery")}>
            <div>
              <h3 className="font-bold text-panel-sidebar group-hover:text-brand-primary transition-colors">4. Galería Instalaciones</h3>
              <p className="text-sm text-brand-muted mt-2">Carrusel de fotos y descripciones de los espacios.</p>
            </div>
            <div className="mt-4 text-brand-primary text-xs font-bold self-end group-hover:underline">Editar →</div>
          </Card>

          <Card className="cursor-pointer hover:border-brand-primary/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between group" onClick={() => setSeccionActiva("team")}>
            <div>
              <h3 className="font-bold text-panel-sidebar group-hover:text-brand-primary transition-colors">5. Títulos de Equipo</h3>
              <p className="text-sm text-brand-muted mt-2">Configurar titulares para la sección de Especialistas.</p>
            </div>
            <div className="mt-4 text-brand-primary text-xs font-bold self-end group-hover:underline">Editar →</div>
          </Card>

          <Card className="cursor-pointer hover:border-brand-primary/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between group" onClick={() => setSeccionActiva("location")}>
            <div>
              <h3 className="font-bold text-panel-sidebar group-hover:text-brand-primary transition-colors">6. Ubicación y Contacto</h3>
              <p className="text-sm text-brand-muted mt-2">Dirección, correos, teléfonos y horarios de atención.</p>
            </div>
            <div className="mt-4 text-brand-primary text-xs font-bold self-end group-hover:underline">Editar →</div>
          </Card>

          <Card className="cursor-pointer hover:border-brand-primary/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between group" onClick={() => setSeccionActiva("social")}>
            <div>
              <h3 className="font-bold text-panel-sidebar group-hover:text-brand-primary transition-colors">7. Redes y Footer</h3>
              <p className="text-sm text-brand-muted mt-2">Enlaces a redes sociales y texto de Copyright.</p>
            </div>
            <div className="mt-4 text-brand-primary text-xs font-bold self-end group-hover:underline">Editar →</div>
          </Card>

          <Card className="cursor-pointer hover:border-brand-primary/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between group" onClick={() => setSeccionActiva("reviews")}>
            <div>
              <h3 className="font-bold text-panel-sidebar group-hover:text-brand-primary transition-colors">8. Reseñas Google</h3>
              <p className="text-sm text-brand-muted mt-2">Sincronización de API Places y testimonios.</p>
            </div>
            <div className="mt-4 text-brand-primary text-xs font-bold self-end group-hover:underline">Editar →</div>
          </Card>
        </div>

        <Modal abierto={!!seccionActiva} onCerrar={() => setSeccionActiva(null)} ancho="max-w-4xl">
          {seccionActiva && (
            <div className="p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  {seccionActiva === "hero" && "Configuración: Sección Principal (Hero)"}
                  {seccionActiva === "about" && "Configuración: Quiénes Somos"}
                  {seccionActiva === "process" && "Configuración: Nuestro Proceso"}
                  {seccionActiva === "gallery" && "Configuración: Galería Instalaciones"}
                  {seccionActiva === "team" && "Configuración: Especialistas"}
                  {seccionActiva === "location" && "Configuración: Ubicación y Contacto"}
                  {seccionActiva === "social" && "Configuración: Redes Sociales"}
                  {seccionActiva === "reviews" && "Configuración: Reseñas y Testimonios"}
                </h2>
                <button type="button" onClick={() => setSeccionActiva(null)} className="text-slate-400 hover:text-slate-600 text-2xl font-bold leading-none">&times;</button>
              </div>

              <form onSubmit={handleGuardar} className="space-y-6">
                {seccionActiva === "hero" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField etiqueta="Tagline / Titular Superior" value={formData.heroTagline} onChange={(e) => handleChange("heroTagline", e.target.value)} obligatorio required />
                      <TextField etiqueta="Nombre de Marca / Destacado" value={formData.heroBrandName} onChange={(e) => handleChange("heroBrandName", e.target.value)} obligatorio required />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-panel-sidebar">Descripción Principal <span className="text-red-600">*</span></label>
                      <textarea value={formData.heroDescription} onChange={(e) => handleChange("heroDescription", e.target.value)} rows={3} required className="w-full rounded-xl border border-brand-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-panel-sidebar bg-white" />
                    </div>
                    <TextField etiqueta="Texto del Botón Principal CTA" value={formData.heroCtaText} onChange={(e) => handleChange("heroCtaText", e.target.value)} obligatorio required />
                    <div className="pt-4 border-t border-slate-200 space-y-4">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-primary">Imágenes de Fondo en Carrusel</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <ImageUploader etiqueta="Fondo Hero #1" value={formData.heroImageUrl1 || ""} onChange={(secureUrl) => handleChange("heroImageUrl1", secureUrl)} folder="kinefit/landing" />
                        <ImageUploader etiqueta="Fondo Hero #2" value={formData.heroImageUrl2 || ""} onChange={(secureUrl) => handleChange("heroImageUrl2", secureUrl)} folder="kinefit/landing" />
                        <ImageUploader etiqueta="Fondo Hero #3" value={formData.heroImageUrl3 || ""} onChange={(secureUrl) => handleChange("heroImageUrl3", secureUrl)} folder="kinefit/landing" />
                      </div>
                    </div>
                  </div>
                )}

                {seccionActiva === "about" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField etiqueta="Etiqueta Superior (Badge)" value={formData.aboutBadgeText || ""} onChange={(e) => handleChange("aboutBadgeText", e.target.value)} />
                      <TextField etiqueta="Título Principal Quiénes Somos" value={formData.aboutTitle || ""} onChange={(e) => handleChange("aboutTitle", e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-panel-sidebar">Descripción Detallada Quiénes Somos</label>
                      <textarea value={formData.aboutDescription || ""} onChange={(e) => handleChange("aboutDescription", e.target.value)} rows={4} className="w-full rounded-xl border border-brand-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-panel-sidebar bg-white" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField etiqueta="Texto Botón CTA Quiénes Somos" value={formData.aboutCtaText || ""} onChange={(e) => handleChange("aboutCtaText", e.target.value)} />
                      <TextField etiqueta="URL de Video / Reel de Instagram" value={formData.aboutVideoUrl || ""} onChange={(e) => handleChange("aboutVideoUrl", e.target.value)} />
                    </div>
                  </div>
                )}

                {seccionActiva === "process" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField etiqueta="Título Principal del Proceso" value={formData.processTitle || ""} onChange={(e) => handleChange("processTitle", e.target.value)} />
                      <TextField etiqueta="Subtítulo / Explicación del Proceso" value={formData.processSubtitle || ""} onChange={(e) => handleChange("processSubtitle", e.target.value)} />
                    </div>
                    
                    <div className="pt-4 border-t border-slate-200">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-primary">Pasos de Atención ({processSteps.length})</h3>
                        <Button type="button" variante="secundario" onClick={handleAgregarProcessStep}>+ Agregar Paso</Button>
                      </div>
                      <div className="space-y-4">
                        {processSteps.map((step, idx) => (
                          <div key={idx} className="rounded-xl border border-brand-border bg-slate-50 p-4 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                              <span className="text-xs font-extrabold uppercase text-brand-primary">Paso #{idx + 1}</span>
                              <button type="button" onClick={() => handleEliminarProcessStep(idx)} className="text-xs text-red-600 font-bold hover:underline">Eliminar Paso</button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <TextField etiqueta="Número / Insignia" value={step.num} onChange={(e) => handleProcessStepChange(idx, "num", e.target.value)} obligatorio />
                              <div className="sm:col-span-2">
                                <TextField etiqueta="Título del Paso" value={step.title} onChange={(e) => handleProcessStepChange(idx, "title", e.target.value)} obligatorio />
                              </div>
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-panel-sidebar">Descripción Detallada del Paso <span className="text-red-600">*</span></label>
                              <textarea value={step.description} onChange={(e) => handleProcessStepChange(idx, "description", e.target.value)} rows={2} required className="w-full rounded-xl border border-brand-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-panel-sidebar bg-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {seccionActiva === "gallery" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField etiqueta="Título de la Galería" value={formData.galleryTitle || ""} onChange={(e) => handleChange("galleryTitle", e.target.value)} />
                      <TextField etiqueta="Subtítulo de la Galería" value={formData.gallerySubtitle || ""} onChange={(e) => handleChange("gallerySubtitle", e.target.value)} />
                    </div>
                    <div className="pt-4 border-t border-slate-200">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-primary">Imágenes de Galería</h3>
                        <Button type="button" variante="secundario" onClick={handleAgregarSlide}>+ Agregar Espacio</Button>
                      </div>
                      <div className="space-y-6">
                        {slides.map((slide, idx) => (
                          <div key={idx} className="rounded-xl border border-brand-border bg-slate-50 p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold uppercase text-brand-primary">Diapositiva #{idx + 1}</span>
                              <button type="button" onClick={() => handleEliminarSlide(idx)} className="text-xs text-red-600 font-bold hover:underline">Eliminar</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <TextField etiqueta="Título del Espacio" value={slide.title} onChange={(e) => handleSlideChange(idx, "title", e.target.value)} obligatorio />
                              <ImageUploader etiqueta="Imagen del Espacio (Cloudinary)" value={slide.image} onChange={(secureUrl) => handleSlideChange(idx, "image", secureUrl)} folder="kinefit/galeria" />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-panel-sidebar">Descripción</label>
                              <textarea value={slide.description} onChange={(e) => handleSlideChange(idx, "description", e.target.value)} rows={2} className="w-full rounded-xl border border-brand-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-panel-sidebar bg-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {seccionActiva === "team" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField etiqueta="Título Sección Especialistas" value={formData.teamTitle || ""} onChange={(e) => handleChange("teamTitle", e.target.value)} />
                    <TextField etiqueta="Subtítulo Sección Especialistas" value={formData.teamSubtitle || ""} onChange={(e) => handleChange("teamSubtitle", e.target.value)} />
                  </div>
                )}

                {seccionActiva === "location" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField etiqueta="Título Sección Ubicación" value={formData.locationTitle || ""} onChange={(e) => handleChange("locationTitle", e.target.value)} />
                      <TextField etiqueta="Subtítulo Sección Ubicación" value={formData.locationSubtitle || ""} onChange={(e) => handleChange("locationSubtitle", e.target.value)} />
                      <TextField etiqueta="Nombre Oficial de la Clínica" value={formData.clinicName} onChange={(e) => handleChange("clinicName", e.target.value)} obligatorio required />
                      <TextField etiqueta="Correo Electrónico de Contacto" type="email" value={formData.clinicEmail} onChange={(e) => handleChange("clinicEmail", e.target.value)} obligatorio required />
                      <TextField etiqueta="Teléfono Formateado (ej: +56 9 ...)" value={formData.clinicPhone} onChange={(e) => handleChange("clinicPhone", e.target.value)} obligatorio required />
                      <TextField etiqueta="Teléfono para Links (ej: +569...)" value={formData.clinicPhoneRaw} onChange={(e) => handleChange("clinicPhoneRaw", e.target.value)} obligatorio required />
                      <div className="md:col-span-2">
                        <TextField etiqueta="Dirección Física de la Clínica" value={formData.clinicAddress} onChange={(e) => handleChange("clinicAddress", e.target.value)} obligatorio required />
                      </div>
                      <TextField etiqueta="Horario Lunes a Viernes" value={formData.hoursWeekday} onChange={(e) => handleChange("hoursWeekday", e.target.value)} obligatorio required />
                      <TextField etiqueta="Horario Sábados / Fin de semana" value={formData.hoursSaturday} onChange={(e) => handleChange("hoursSaturday", e.target.value)} obligatorio required />
                    </div>
                  </div>
                )}

                {seccionActiva === "social" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField etiqueta="URL de Instagram" value={formData.socialInstagram} onChange={(e) => handleChange("socialInstagram", e.target.value)} />
                      <TextField etiqueta="URL de Facebook" value={formData.socialFacebook} onChange={(e) => handleChange("socialFacebook", e.target.value)} />
                      <TextField etiqueta="URL de WhatsApp (wa.me)" value={formData.socialWhatsApp} onChange={(e) => handleChange("socialWhatsApp", e.target.value)} />
                      <TextField etiqueta="URL de TikTok" value={formData.socialTikTok} onChange={(e) => handleChange("socialTikTok", e.target.value)} />
                    </div>
                    <TextField etiqueta="Texto de Derechos de Autor (Pie de Página)" value={formData.footerText || ""} onChange={(e) => handleChange("footerText", e.target.value)} />
                  </div>
                )}

                {seccionActiva === "reviews" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField etiqueta="Título Sección Testimonios" value={formData.testimonialsTitle || ""} onChange={(e) => handleChange("testimonialsTitle", e.target.value)} />
                      <TextField etiqueta="Subtítulo Sección Testimonios" value={formData.testimonialsSubtitle || ""} onChange={(e) => handleChange("testimonialsSubtitle", e.target.value)} />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">🔌 Parámetros API Google Places</h3>
                        <Button type="button" variante="primario" disabled={sincronizando} onClick={handleSincronizarGoogle}>
                          {sincronizando ? "Conectando..." : "🔄 Sincronizar Ahora"}
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
"""
    
    content = content.replace(old_form, new_ui)
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print("Success")
else:
    print("Could not find the old form to replace")
