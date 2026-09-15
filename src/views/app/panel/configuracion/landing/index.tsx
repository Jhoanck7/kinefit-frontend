"use client";

import {
  Alerta,
  ImageUploader,
  Modal,
  ModalCloseButton,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/shared";
import { Button, Card, Switch } from "@/components/ui";

import { useLanding } from "./hooks";
import { FieldDefinition, landingConfigSchema } from "./landing-config-schema";

const COL_SPAN_MD: Record<1 | 2 | 3, string> = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
};

function esUrlAbsolutaValida(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export default function LandingView() {
  const {
    formData,
    seccionActiva,
    processSteps,
    reviewsList,
    vouchers,
    embarazadas,
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
          <TextAreaField
            etiqueta={f.label}
            value={(formData[f.key] as string) || ""}
            onChange={e => actions.handleChange(f.key, e.target.value)}
            rows={f.rows || 3}
            required={f.required}
            obligatorio={f.required}
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

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {section.fields.map(f => {
            if (f.sectionHeader) {
              return (
                <div
                  key={f.key + "_wrap"}
                  className="md:col-span-2 pt-4 border-t border-slate-200"
                >
                  <h3 className="font-sans text-label font-bold text-foreground mb-4">
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
      <div className="flex flex-col gap-1 border-b border-slate-200 pb-4">
        <p className="text-sm text-slate-500">
          Edita en tiempo real los textos, pasos de atención, imágenes
          Cloudinary y reseñas de Google.
        </p>
      </div>

      {cargando ? (
        <Card className="rounded-none border border-slate-200 shadow-none p-6">
          <p className="text-sm text-slate-500 py-8 text-center">
            Cargando configuración actual del servidor…
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {landingConfigSchema.map(section => (
              <Card
                key={section.id}
                className="rounded-none border border-slate-200 shadow-none p-6 cursor-pointer hover:border-primary/50 transition-all flex flex-col justify-between group"
                onClick={() => actions.setSeccionActiva(section.id)}
              >
                <div>
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-2">
                    {section.description}
                  </p>
                </div>
                <div className="mt-4 text-primary text-xs font-bold self-end group-hover:underline">
                  Editar
                </div>
              </Card>
            ))}
          </div>

          <Modal
            abierto={!!seccionActiva}
            onCerrar={() => actions.setSeccionActiva(null)}
          >
            {seccionActiva && (
              <div className="bg-white text-foreground font-sans shadow-none rounded-overlay">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm px-6 py-4">
                  <h2 className="font-sans text-section-title font-bold text-foreground">
                    Configuración:{" "}
                    {
                      landingConfigSchema
                        .find(s => s.id === seccionActiva)
                        ?.title.split(". ")[1]
                    }
                  </h2>
                  <ModalCloseButton
                    onClick={() => actions.setSeccionActiva(null)}
                  />
                </div>

                <form
                  onSubmit={actions.handleGuardar}
                  className="max-h-[75vh] overflow-y-auto p-6 space-y-6"
                >
                  {renderDynamicFields(seccionActiva)}

                  {seccionActiva === "reservas" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-none border border-slate-200 bg-slate-50 p-4">
                        <div>
                          <h3 className="font-sans text-label font-bold text-foreground">
                            Formulario de Reserva Activo
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Apagado, el sitio deja de mostrar el formulario y el
                            botón principal redirige a la dirección alterna.
                          </p>
                        </div>
                        <Switch
                          checked={formData.reservasHabilitadas}
                          onCheckedChange={checked =>
                            actions.handleChange("reservasHabilitadas", checked)
                          }
                        />
                      </div>

                      {!formData.reservasHabilitadas && (
                        <>
                          <TextField
                            etiqueta="URL Alterna de Reserva"
                            value={formData.reservasUrlAlterna || ""}
                            onChange={e =>
                              actions.handleChange(
                                "reservasUrlAlterna",
                                e.target.value
                              )
                            }
                            obligatorio
                            required
                          />
                          {!esUrlAbsolutaValida(
                            formData.reservasUrlAlterna
                          ) && (
                            <Alerta tono="error">
                              Debe ingresar una URL absoluta válida (ej:
                              https://link.agendapro.com/...) para poder
                              desactivar las reservas.
                            </Alerta>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {seccionActiva === "team" && (
                    <Alerta tono="info" className="mt-6">
                      <strong>Nota:</strong> Las cartas de los especialistas
                      (foto, nombre, rol, especialidad) se configuran
                      individualmente en la pestaña{" "}
                      <strong>Especialistas</strong> de Configuración.
                    </Alerta>
                  )}

                  {seccionActiva === "process" && (
                    <div className="space-y-4 pt-4 border-t border-slate-200 mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-sans text-label font-bold text-foreground">
                          Lista de Pasos
                        </h3>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-overlay"
                          onClick={actions.handleAgregarProcessStep}
                        >
                          Agregar Paso
                        </Button>
                      </div>
                      {processSteps.map((step, idx) => (
                        <div
                          key={idx}
                          className="rounded-none border border-slate-200 bg-white p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <span className="text-xs font-bold text-slate-800">
                              Paso #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                actions.handleEliminarProcessStep(idx)
                              }
                              className="text-xs text-primary font-bold hover:underline"
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
                          <TextAreaField
                            etiqueta="Descripción"
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
                            obligatorio
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {seccionActiva === "vouchers" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextField
                          etiqueta="Título"
                          value={formData.vouchersTitle || ""}
                          onChange={e =>
                            actions.handleChange(
                              "vouchersTitle",
                              e.target.value
                            )
                          }
                        />
                        <TextField
                          etiqueta="Subtítulo"
                          value={formData.vouchersSubtitle || ""}
                          onChange={e =>
                            actions.handleChange(
                              "vouchersSubtitle",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between rounded-none border border-slate-200 bg-slate-50 p-4">
                        <div>
                          <h3 className="font-sans text-label font-bold text-foreground">
                            Mostrar Nota
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Texto chico debajo del subtítulo, por ejemplo
                            condiciones o vigencia del voucher.
                          </p>
                        </div>
                        <Switch
                          checked={formData.vouchersMostrarNota}
                          onCheckedChange={checked =>
                            actions.handleChange("vouchersMostrarNota", checked)
                          }
                        />
                      </div>

                      {formData.vouchersMostrarNota && (
                        <TextAreaField
                          etiqueta="Nota"
                          value={formData.vouchersNota || ""}
                          onChange={e =>
                            actions.handleChange("vouchersNota", e.target.value)
                          }
                          rows={2}
                        />
                      )}

                      <div className="space-y-4 pt-4 border-t border-slate-200">
                        <h3 className="font-sans text-label font-bold text-foreground">
                          Fotos ({vouchers.length})
                        </h3>

                        {vouchers.map((voucher, idx) => (
                          <div
                            key={idx}
                            className="rounded-none border border-slate-200 bg-white p-4 space-y-3"
                          >
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                              <span className="text-xs font-bold text-slate-800">
                                Modelo #{idx + 1}
                              </span>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() =>
                                    actions.handleMoverVoucher(idx, "arriba")
                                  }
                                  className="text-xs text-primary font-bold hover:underline disabled:opacity-30 disabled:no-underline"
                                >
                                  Subir
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === vouchers.length - 1}
                                  onClick={() =>
                                    actions.handleMoverVoucher(idx, "abajo")
                                  }
                                  className="text-xs text-primary font-bold hover:underline disabled:opacity-30 disabled:no-underline"
                                >
                                  Bajar
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    actions.handleEliminarVoucher(idx)
                                  }
                                  className="text-xs text-primary font-bold hover:underline"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <ImageUploader
                                etiqueta="Fondo sofá (superpuesta)"
                                value={voucher.imagenSofa}
                                onChange={(
                                  secureUrl,
                                  _publicId,
                                  width,
                                  height
                                ) =>
                                  actions.handleVoucherImagenSofaChange(
                                    idx,
                                    secureUrl,
                                    width || 0,
                                    height || 0
                                  )
                                }
                                folder="kinefit/vouchers"
                              />
                              <ImageUploader
                                etiqueta="Fondo blanco (principal)"
                                value={voucher.imagenBlanco}
                                onChange={(
                                  secureUrl,
                                  _publicId,
                                  width,
                                  height
                                ) =>
                                  actions.handleVoucherImagenBlancoChange(
                                    idx,
                                    secureUrl,
                                    width || 0,
                                    height || 0
                                  )
                                }
                                folder="kinefit/vouchers"
                              />
                            </div>
                            <TextField
                              etiqueta="Texto Alternativo (obligatorio)"
                              value={voucher.alt}
                              onChange={e =>
                                actions.handleVoucherAltChange(
                                  idx,
                                  e.target.value
                                )
                              }
                              obligatorio
                              required
                            />
                            {!voucher.alt.trim() && (
                              <Alerta tono="error">
                                El texto alternativo es obligatorio.
                              </Alerta>
                            )}
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-overlay"
                          onClick={() =>
                            actions.handleAgregarVoucher({
                              alt: "",
                              imagenSofa: "",
                              anchoSofa: 0,
                              altoSofa: 0,
                              imagenBlanco: "",
                              anchoBlanco: 0,
                              altoBlanco: 0,
                            })
                          }
                        >
                          Agregar Foto
                        </Button>
                      </div>
                    </div>
                  )}

                  {seccionActiva === "embarazadas" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextField
                          etiqueta="Título de la Sección"
                          value={formData.embarazadasTitle || ""}
                          onChange={e =>
                            actions.handleChange(
                              "embarazadasTitle",
                              e.target.value
                            )
                          }
                        />
                        <TextField
                          etiqueta="Subtítulo / Introducción"
                          value={formData.embarazadasSubtitle || ""}
                          onChange={e =>
                            actions.handleChange(
                              "embarazadasSubtitle",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="space-y-4 pt-4 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-sans text-label font-bold text-foreground">
                              Fotos del Carrusel ({embarazadas.length})
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Agrega las fotos para la sección de embarazadas.
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-overlay"
                            onClick={actions.handleAgregarEmbarazada}
                          >
                            Agregar Foto
                          </Button>
                        </div>

                        {embarazadas.map((item, idx) => (
                          <div
                            key={idx}
                            className="rounded-none border border-slate-200 bg-white p-4 space-y-3"
                          >
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                              <span className="text-xs font-bold text-slate-800">
                                Foto #{idx + 1}
                              </span>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() =>
                                    actions.handleMoverEmbarazada(idx, "arriba")
                                  }
                                  className="text-xs text-primary font-bold hover:underline disabled:opacity-30 disabled:no-underline"
                                >
                                  Subir
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === embarazadas.length - 1}
                                  onClick={() =>
                                    actions.handleMoverEmbarazada(idx, "abajo")
                                  }
                                  className="text-xs text-primary font-bold hover:underline disabled:opacity-30 disabled:no-underline"
                                >
                                  Bajar
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    actions.handleEliminarEmbarazada(idx)
                                  }
                                  className="text-xs text-primary font-bold hover:underline"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <ImageUploader
                                etiqueta="Foto Principal (requerida)"
                                value={item.imagenUrl}
                                onChange={(
                                  secureUrl,
                                  _publicId,
                                  width,
                                  height
                                ) =>
                                  actions.handleEmbarazadaImagenChange(
                                    idx,
                                    secureUrl,
                                    width || 0,
                                    height || 0
                                  )
                                }
                                folder="kinefit/embarazadas"
                              />
                              <ImageUploader
                                etiqueta="Foto Flotante Secundaria (opcional)"
                                value={item.imagenSecundaria}
                                onChange={(
                                  secureUrl,
                                  _publicId,
                                  width,
                                  height
                                ) =>
                                  actions.handleEmbarazadaImagenSecundariaChange(
                                    idx,
                                    secureUrl,
                                    width || 0,
                                    height || 0
                                  )
                                }
                                folder="kinefit/embarazadas"
                              />
                            </div>

                            <TextField
                              etiqueta="Texto Alternativo (obligatorio)"
                              value={item.alt}
                              onChange={e =>
                                actions.handleEmbarazadaAltChange(
                                  idx,
                                  e.target.value
                                )
                              }
                              obligatorio
                              required
                            />
                            {!item.alt.trim() && (
                              <Alerta tono="error">
                                El texto alternativo es obligatorio.
                              </Alerta>
                            )}
                          </div>
                        ))}

                        {embarazadas.length === 0 && (
                          <p className="text-xs text-slate-400 italic text-center py-4 border border-dashed border-slate-200">
                            No hay fotos configuradas. Haz clic en
                            &ldquo;Agregar Foto&rdquo;.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {seccionActiva === "reviews" && (
                    <div className="space-y-4 mt-4">
                      <div className="bg-slate-50 p-4 rounded-none border border-slate-200 space-y-4 mt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-sans text-label font-bold text-foreground">
                              Sincronización con Google Places
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              La API Key de Google se procesa de forma segura en
                              el servidor.
                            </p>
                          </div>
                          <Button
                            type="button"
                            className="rounded-overlay"
                            disabled={sincronizando}
                            onClick={actions.handleSincronizarGoogle}
                          >
                            {sincronizando
                              ? "Conectando…"
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
                          <SelectField
                            etiqueta="Cantidad Máxima de Reseñas"
                            value={limiteResenas}
                            onChange={e =>
                              actions.setLimiteResenas(Number(e.target.value))
                            }
                          >
                            <option value={3}>3 Reseñas</option>
                            <option value={5}>5 Reseñas</option>
                            <option value={8}>8 Reseñas</option>
                            <option value={10}>10 Reseñas</option>
                          </SelectField>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-sans text-label font-bold text-foreground">
                            Reseñas ({reviewsList.length})
                          </h3>
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-overlay"
                            onClick={actions.handleAgregarReview}
                          >
                            Agregar Manual
                          </Button>
                        </div>
                        {reviewsList.map((rev, idx) => (
                          <div
                            key={idx}
                            className="rounded-none border border-slate-200 bg-white p-4 space-y-3"
                          >
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                              <span className="text-xs font-bold text-slate-800">
                                Reseña #{idx + 1}, {rev.author}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  actions.handleEliminarReview(idx)
                                }
                                className="text-xs text-primary font-bold hover:underline"
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
                            <TextAreaField
                              etiqueta="Comentario"
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
                              obligatorio
                            />
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
                      className="rounded-overlay"
                      onClick={() => actions.setSeccionActiva(null)}
                    >
                      Cerrar sin Guardar
                    </Button>
                    <Button
                      type="submit"
                      className="rounded-overlay"
                      disabled={
                        guardando ||
                        (seccionActiva === "reservas" &&
                          !formData.reservasHabilitadas &&
                          !esUrlAbsolutaValida(formData.reservasUrlAlterna)) ||
                        (seccionActiva === "vouchers" &&
                          vouchers.some(
                            v =>
                              !v.imagenSofa || !v.imagenBlanco || !v.alt.trim()
                          )) ||
                        (seccionActiva === "embarazadas" &&
                          embarazadas.some(e => !e.imagenUrl || !e.alt.trim()))
                      }
                    >
                      {guardando ? "Guardando…" : "Guardar Cambios"}
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
            <h3 className="font-sans text-section-title font-bold text-foreground mb-4">
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
                className="rounded-overlay"
                onClick={() => actions.setConfirmacionGuardar(false)}
                disabled={guardando}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="rounded-overlay"
                onClick={actions.ejecutarGuardar}
                disabled={guardando}
              >
                {guardando ? "Guardando…" : "Sí, Guardar Cambios"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
