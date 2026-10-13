# Análisis: Historias de Usuario vs. Refactor de la Sección Documentos

**Fecha:** 2026-09-20
**Autor:** Claude (sesión de refactor de Documentos, kinefit-frontend + kinefit-backend)
**Destinatario:** otra IA (o Maxi) que va a editar `docs/Historias de Usuario v-final.docx`
**Objetivo:** decir exactamente qué cambiar en la HDU para que vuelva a reflejar el sistema real, con evidencia de código para cada afirmación.

---

## 0. Cómo usar este documento

Este análisis compara **cuatro fuentes**, en este orden de autoridad:

1. **Código real** (`kinefit-backend/api-dotnet`, `kinefit-frontend/src`) — la verdad última.
2. **`docs/Flujo Seccion Documentos - Refactor de Seccion Fichas Clinicas.md`** — el diagrama de flujo por actor que definió el refactor. Es la fuente de verdad *funcional*.
3. **`docs/Plan_de_Pruebas_KineFit (1).xlsx`** — parcialmente actualizado. Contiene un bloque de casos (PF-223 a PF-256) que ya anticipa el modelo nuevo, y que **literalmente pide verificación de los IDs de historia** ("se usa FIC-004/DOC-002 como referencia provisoria — verificar el número real en Historias de Usuario v-final"). Este análisis resuelve esa pregunta.
4. **`docs/Historias de Usuario v-final.docx`** — la más atrasada. Describe el modelo *anterior* al refactor de Documentos (tablas separadas `fichas_clinicas` + `documentos_paciente`, vista `vista_documentos`, ids compuestos `FIC-x`/`DOC-x`, visibilidad restringida, sin ciclo de vida explícito, firma "estampada" desde el perfil).

Cada sección abajo dice: **qué dice la HDU hoy**, **qué implementa el código real**, **por qué difieren**, y **el texto exacto a escribir**. Cuando cito código, es para que la IA que edite pueda verificarlo por sí misma antes de tocar el .docx — no para que lo copie al documento.

**Regla de oro para quien edite:** la HDU es un documento de *negocio*, no de implementación. No hay que meter nombres de clases C# ni de componentes React en las validaciones — hay que describir el comportamiento observable, igual que ya hace el resto del documento. Las referencias a código en este análisis son solo para que la IA verifique antes de escribir, no para copiar.

---

## 1. Resumen ejecutivo

El refactor de Documentos cambió el **modelo conceptual completo** que la HDU describe hoy:

| Antes (HDU actual) | Ahora (código real) |
|---|---|
| Dos tablas paralelas: `fichas_clinicas` (con un campo `Tipo` que mezclaba Ficha y Recomendación) y `documentos_paciente` (Consentimiento) | Una sola tabla `documentos` con herencia TPH: `Documento` es la entidad general, `FichaClinica`/`Recomendacion`/`Consentimiento` son tipos de la misma fila |
| `vista_documentos` (SQL `UNION ALL`) con clave compuesta `FIC-1`/`DOC-7` para simular un listado único | Listado unificado real, id entero único por documento, columna `Tipo` para distinguir |
| Especialista **solo ve** los documentos de sus propias atenciones (AUT-002, "requisito 7.11") | Lectura **abierta** a todo el personal (continuidad de atención); **escritura** sigue acotada al propio especialista — cambio de política deliberado |
| Ficha sin estados explícitos ("se crea y ya está") | `Documento.Estado`: `Borrador → Completado`, más `Pendiente` (Consentimiento), `Bloqueado` (cita cancelada), `CerradoPorBaja` (especialista dado de baja), `Anulado` |
| Firma del profesional "se estampa" desde una firma guardada una vez en el perfil (`UsuarioPersonal.FirmaRutaInterna`) | Se **eliminó** el estampado. El profesional firma en vivo, dibujando sobre el mismo PDF donde el paciente ya firmó — mismo mecanismo para ambos |
| "Recomendación" es una nota de texto dentro de FIC-001 | **Recomendación es su propio tipo de documento**, con flujo propio (pregunta obligatoria al marcar Atendida, Estándar o Personalizada, Personalizada reemplaza a Estándar) — merece su propia historia |
| Ficha sin ciclo de vida de edición | Ciclo de vida explícito: nace en Borrador, editable, se cierra explícitamente con aviso de irreversibilidad, cerrada rechaza edición — merece su propia historia |
| "Formato de ficha" | Se renombró a **"Plantilla"** en todo el sistema (backend y frontend), porque ahora una plantilla puede ser de Ficha, Consentimiento o Recomendación, no solo de Ficha |
| Menú lateral "Fichas" con contador de pendientes | Menú "Documentos", sin contador |
| Rutas `/panel/fichas/*` | Rutas `/panel/documentos/*`. **La ruta vieja no redirige — ver Anexo C, gap real de implementación** |

El Plan de Pruebas ya "vio venir" gran parte de esto (bloque PF-223 a PF-256) y dejó huecos con nombres provisorios (`FIC-004`, `DOC-002`). Este análisis los resuelve y entrega el texto completo de esas dos historias nuevas.

---

## 2. Historias existentes: qué cambia en cada una

### 2.1 — FIC-001 "Creación de la Ficha Clínica de la Atención"

**Texto actual (bullets a revisar):**

> - "Una reserva admite una única ficha clínica. El sistema impide la creación de una segunda ficha sobre la misma reserva."

✅ **Se mantiene, pero hay que aclarar el alcance.** Esto sigue siendo cierto para Ficha específicamente, pero ahora coexiste con **una Recomendación y un Consentimiento en la misma cita** (documentos de tipo distinto). El límite es "1 por tipo", no "1 documento por cita". Evidencia: 3 índices únicos parciales por tipo en `AppDbContext.cs` (`HasFilter("tipo = 0")`, `= 1`, `= 2` sobre la tabla `documentos`), y el test `UnaFichaYUnaRecomendacion_CoexistenEnLaMismaCita` en `DocumentoClinicoTests.cs`.

**Texto propuesto (reemplazar el bullet):**
> - "Una reserva admite una única ficha clínica, una única recomendación y un único consentimiento firmado por servicio exigido — cada tipo de documento tiene su propio límite de uno por cita, y pueden coexistir entre sí. El sistema impide la creación de un segundo documento del mismo tipo sobre la misma cita."

---

> No hay ningún bullet sobre **desde qué estado de la cita** se puede crear la ficha.

⚠️ **Falta un criterio explícito.** El código permite registrar la ficha desde una cita `Confirmada` o `Atendida` (no exige que ya esté Atendida). Evidencia: `EstadosQueGeneranDocumento` en `DocumentoService.cs` incluye `Confirmada` y `Atendida`; test `PF-223` del plan de pruebas ("Creación desde cita Confirmada... La ficha se creaSin exigir que la cita esté Atendida") ya lo espera.

**Agregar bullet:**
> - "La ficha puede registrarse desde una cita en estado Confirmada o Atendida — no es necesario esperar a que termine la atención para empezar a completarla."

---

> "La ficha clínica sólo puede ser creada por un usuario con rol Especialista o Administrador."

✅ Se mantiene sin cambios.

---

> No hay ningún bullet sobre **visibilidad entre especialistas** (el silencio aquí es el problema: el lector asume la regla de AUT-002, que ahora es la contraria).

🔴 **Cambio de política deliberado, hay que decirlo explícitamente acá.** AUT-002 dice hoy: *"un especialista accede únicamente a sus propios recursos"* (el llamado "requisito 7.11" en las notas del plan de pruebas). Eso se invirtió para Documentos específicamente: la restricción de "solo mis atenciones" queda solo para **Citas**; para Fichas/Documentos la lectura es abierta a todo el personal por continuidad de atención, y la escritura (crear/editar) sigue acotada al propio especialista. Evidencia: test `ElListadoDelPanel_MuestraAUnaEspecialista_LosDocumentosDeOtra` (nombre explícitamente invertido respecto del test viejo `...NoMuestra...`) en `DocumentoClinicoTests.cs`; comentario en el propio test: *"Cambio de política deliberado respecto de la regla 7.11 anterior"*; `PF-237`/`PF-238` en el plan de pruebas, con nota explícita: *"Invierte deliberadamente el requisito 7.11... No es un hallazgo si el resultado es el de esta fila."*

**Agregar bullet (nuevo, importante):**
> - "Cualquier especialista puede leer la ficha y el historial de fichas de un paciente, sin importar quién realizó la atención — por continuidad de atención en un centro con pocos profesionales. Solo puede crear o editar sobre las atenciones que le pertenecen; intentar escribir sobre una cita ajena se rechaza."

**Y hay que corregir AUT-002 en consecuencia** (ver §2.6) para que no quede contradiciendo esto.

---

### 2.2 — FIC-002 "Consulta, Exportación y Documentos Adjuntos de la Ficha"

Sin cambios de fondo relevantes. Los adjuntos (PDF/imagen, validación por contenido real, ruta no predecible) siguen tal cual — ahora se implementan sobre la tabla `adjuntos` con FK único `documento_id`, lo que además habilita adjuntos en Consentimiento y Recomendación (ver DOC-001 §2.4).

Un matiz menor: la HDU dice *"El sistema ofrece una acción de impresión que abre el documento en una pestaña aparte"* y *"El sistema permite exportar la ficha a PDF"*. Verificar contra el código real de `documento-detalle-modal.tsx` (`handleImprimir`/`handleDescargarArchivo`) antes de dar esto por cerrado — funciona para documentos que ya son PDF; para una ficha armada con el constructor de campos (sin archivo), "imprimir" dispara `window.print()` del navegador sobre la vista renderizada, no una exportación a PDF con membrete real. Si el negocio esperaba un PDF con membrete real para toda ficha (constructor incluido), **es un gap** — señalarlo, no darlo por hecho.

---

### 2.3 — FIC-003 "Constructor de Formatos de Ficha" → pasa a llamarse "Constructor de Plantillas de Documento"

🔴 **Cambio de nombre y de alcance.** Ya no es solo de Ficha: la misma pantalla arma plantillas de Ficha, Consentimiento **y** Recomendación. "Formato" se renombró a "Plantilla" en todo el sistema (`FormatoFicha` → `Plantilla` en el backend; `formato-service.ts` → `plantilla-service.ts`, rutas `/panel/documentos/plantillas/*` en el frontend).

**Nombre de historia — cambiar a:**
> "Constructor de Plantillas de Documento"

**Descripción — cambiar a:**
> "Como integrante del personal, quiero definir la estructura de campos de cualquier plantilla de documento clínico — ficha, consentimiento o recomendación —, para adaptar el registro y los documentos del paciente a lo que el centro necesita sin depender de los programadores."

**Bullets a revisar uno por uno:**

> "El sistema mantiene un único catálogo de formatos, con dos formas de creación: construido en el panel campo por campo, o cargado desde un documento externo."

⚠️ **Matizar: la elección de "con campos" o "documento externo" no aplica a Ficha.** El diagrama de flujo (caso AC1) es explícito: para tipo **Ficha**, el sistema va directo al constructor de campos, sin preguntar — no existe ruta de importar PDF para fichas. La pregunta "¿Cómo se arma? → Con campos | Documento externo" solo aparece para **Consentimiento** y **Recomendación**. Evidencia: `use-constructor-plantilla.ts`, función `cambiarTipoDocumento` — `setModo(tipo === "FichaClinica" ? "campos" : "elegir")`.

**Reemplazar por:**
> - "El sistema mantiene un único catálogo de plantillas. Para Consentimiento y Recomendación, el personal elige primero cómo se arma: construida en el panel campo por campo, o cargada desde un documento externo. Para Ficha, siempre se arma con campos — no existe una vía de importar un documento externo para ese tipo."

---

> "La carga desde documento externo admite archivos de procesador de texto. El sistema los convierte a un documento de presentación fija que conserva el formato original, y ese documento queda como cuerpo del formato."

🔴 **Esto no es lo que hace el sistema real.** La carga desde documento externo admite **PDF directamente** (no un procesador de texto que el sistema convierte). Evidencia: `PlantillaService.importarConsentimiento`/`importarRecomendacion` reciben un `archivo: File` y el backend valida que sea `application/pdf` por contenido real (mismo validador de tipo que fichas/adjuntos), no hay ninguna conversión de Word→PDF en el código.

**Reemplazar por:**
> - "La carga desde documento externo admite un archivo PDF ya redactado. El sistema valida que el archivo sea realmente un PDF por su contenido, no por su extensión declarada, y ese PDF queda como cuerpo de la plantilla."

---

> "Un formato puede declarar los recuadros de firma que le corresponden, indicando a quién pertenece cada uno."

🔴 **Este concepto de "recuadros de firma" quedó obsoleto** por el cambio de §2.4 más abajo (firma unificada dentro del PDF). Para una plantilla armada con campos, sigue existiendo un campo de tipo "Firma" dentro del constructor (`TipoCampoFormato` incluye `"Firma"`), pero ya no hay una noción de "recuadro" con coordenadas — la firma se captura dibujando sobre el documento generado, en cualquier posición, igual que sobre un PDF importado.

**Reemplazar por:**
> - "El constructor admite un campo de tipo Firma dentro de cualquier sección. Al firmarse el documento, el sistema genera un PDF con el contenido completado y quien firma dibuja su trazo directamente sobre ese PDF — no hay coordenadas fijas ni recuadros predefinidos."

---

> "El constructor presenta una vista previa de cómo quedará el formato al completarse."

✅ Se mantiene (`documento-detalle-modal.tsx` y el constructor tienen panel de vista previa en vivo).

---

> "Los formatos son versionados... El sistema advierte antes de modificar un formato en uso... y no permite eliminar un formato con documentos asociados."

✅ Se mantiene conceptualmente — verificar el mecanismo exacto de versionado contra `PlantillaService.actualizar` (usa confirmación explícita cuando hay documentos asociados, vía el código `PLANTILLA_EN_USO`), pero el comportamiento observable descrito coincide.

---

**Falta un bullet sobre a qué servicios sirve una plantilla.** El flujo (CP14 del diagrama) originalmente contemplaba elegir servicios *dentro* del asistente de creación de la plantilla. **Decisión tomada durante la implementación: se descartó esa opción** — la asignación de una plantilla a servicios vive únicamente en Configuración → Servicios, no en el wizard de creación. Esto es coherente con el bullet ya existente en DOC-001 ("La asignación de documentos a un servicio se realiza desde la configuración de servicios"), así que no hace falta agregar nada nuevo en FIC-003 — pero si la IA que edita encuentra en el flujo original la expectativa de que esto ocurriera en el wizard, **no es un gap**: fue una decisión explícita de producto, ya tomada.

⚠️ **Riesgo real detectado y sin resolver en HDU ni en código:** hoy no hay ningún aviso quality-of-life cuando una plantilla de Consentimiento/Recomendación se crea pero nunca se asigna a un servicio — queda huérfana y nunca se genera en ninguna cita. El frontend sí muestra una advertencia visual ("Sin servicios asignados") en el listado de plantillas, pero es informativa, no bloqueante. Si el negocio quiere que esto sea un requisito duro, falta una historia o un bullet que lo exija.

---

### 2.4 — DOC-001 "Documentos del Paciente y Firma Electrónica" (la historia con más cambios)

Esta es la historia con más deriva respecto del código. Recomiendo reescribirla bullet por bullet.

#### 2.4.1 — El modelo de firma "estampada" quedó completamente eliminado

**Texto actual:**
> - "Los consentimientos llevan además la firma del profesional, que se estampa siempre después de la firma del paciente."
> - "La firma del profesional se estampa a partir de la firma registrada en su perfil, con la identidad del usuario autenticado que ejecuta la acción."
> - "La estampa incorpora al documento únicamente el trazo de la firma. La fecha, la hora, la identidad de quien firmó y la huella del documento se conservan en el registro del sistema sin imprimirse sobre el documento."

🔴 **Estos tres bullets describen un mecanismo que ya no existe y hay que reemplazarlos por completo.** No hay "estampado": no se guarda una firma en el perfil del profesional para reutilizarla, ni se superpone un trazo pre-guardado sobre el documento en el servidor. Se eliminó por completo `UsuarioPersonal.FirmaRutaInterna`, el endpoint `PATCH /personal/firma`, y la sección "Firma" que existía en `/panel/perfil`.

**Lo que hace el sistema real:** cuando el profesional debe firmar, el sistema le muestra el **mismo documento PDF que el paciente ya firmó** (con el trazo del paciente ya incrustado). El profesional dibuja su firma **en vivo, en el momento**, directamente sobre ese PDF — exactamente el mismo mecanismo que usa el paciente. El resultado es un nuevo PDF con ambas firmas incrustadas dentro del archivo. La versión intermedia (solo con la firma del paciente) se conserva aparte para trazabilidad.

**Reemplazar los tres bullets por:**
> - "La firma, tanto del paciente como del profesional, se dibuja siempre en vivo sobre el documento en el momento de firmar — nunca se reutiliza una firma guardada de antemano. El profesional firma sobre el mismo PDF que el paciente ya firmó, viendo el documento completo antes de hacerlo."
> - "El trazo de cada firma queda incrustado dentro del propio archivo PDF, no como una capa ni una coordenada superpuesta por el servidor. El sistema conserva además, por separado, la versión del documento con solo la firma del paciente, previa a la firma del profesional, para trazabilidad."
> - "La fecha, la hora y la identidad de quien firmó se registran en el sistema junto al documento, sin necesidad de imprimirse como texto visible sobre el PDF."

**Nota para quien edite el código, no la HDU:** verificar si el negocio realmente no quiere fecha/hora impresa en el PDF (texto legal a veces lo exige). Esto no se tocó en el refactor porque no se implementaba antes tampoco — es fidelidad al comportamiento existente, no una decisión nueva.

---

Esto también obliga a **corregir AUT-002** (ver §2.6), que tiene el bullet:
> "Cada especialista registra su firma una sola vez en su perfil. El sistema la utiliza para estampar los documentos que le corresponde firmar, según DOC-001."

Este bullet debe **eliminarse por completo** de AUT-002.

---

#### 2.4.2 — La fórmula de expiración del enlace cambió y quedó resuelto un "pendiente por confirmar"

**Texto actual (DOC-001):** "El enlace de firma es de un solo uso, tiene expiración y no es predecible ni enumerable." — no dice la fórmula.

**"Pendientes por confirmar" (al inicio del documento):**
> "Vigencia del enlace de firma de documentos. Propuesta: expira al llegar la hora de la cita o al cargarse el documento firmado en papel, lo que ocurra primero."

🔴 **Este pendiente quedó resuelto, pero con una fórmula distinta a la propuesta original** — hay que corregir el texto de la propuesta, no solo tacharla como "resuelta". La fórmula implementada es puramente temporal, no depende de si se cargó papel:

```
expiración = max(emitido_en + 1 día, inicio_del_día_siguiente_a_la_fecha_de_la_cita)
```

Evidencia: `CalcularExpiracionToken` en `DocumentoService.cs` (`DocumentoService.cs:1786`); test `PF-239` del plan de pruebas ("Vencimiento con nueva fórmula... Vence 1 día después de la emisión, nunca en el pasado").

**Mover de "Pendientes por confirmar" a DOC-001, agregando el bullet:**
> - "El enlace vence al mayor entre estos dos momentos: un día después de haberse emitido, o el día siguiente a la fecha de la cita — lo que sea más tarde. Esto asegura que un enlace reemitido para una cita ya pasada nunca nazca vencido."

**Eliminar** el ítem correspondiente de "Pendientes por confirmar".

---

#### 2.4.3 — Reenvío por correo, como acción distinta de copiar el enlace

No hay ningún bullet sobre esto en DOC-001 hoy. El sistema real ofrece dos acciones separadas cuando un enlace debe reemitirse: **copiar el enlace** y **reenviarlo por correo** (que además genera un nuevo token). Evidencia: `useReenviarTokenMutation` / `useReenviarPorCorreoMutation`, botones "Copiar enlace" / "Reenviar por correo" en `documentos-tab.tsx`; `PF-240`.

**Agregar bullet:**
> - "Para regularizar un enlace vencido o por vencer, el sistema ofrece dos acciones independientes: copiar el enlace vigente, o reenviarlo directamente por correo al paciente. Ambas emiten un enlace nuevo; ninguna de las dos exige que el anterior haya vencido."

---

#### 2.4.4 — Distinción visual entre "firmado" y "cargado en papel"

**Texto actual:** "Cuando el paciente no firmó en línea, el profesional puede cargar el documento firmado en papel..." — no dice cómo se distingue visualmente después.

⚠️ Falta un criterio de aceptación explícito, aunque el comportamiento ya existe: el sistema nunca debe mostrar "firmado el [fecha]" para un documento cargado en papel — debe decir "cargado el [fecha]". Evidencia: `PF-241`/`PF-242`; campo `cargadoEnPapelEn` separado de `firmadoPacienteEn`/`firmadoProfesionalEn` en el modelo de respuesta.

**Agregar bullet:**
> - "Un documento cargado en papel se distingue siempre, en el listado y en el detalle, de uno firmado digitalmente. Nunca se le atribuye una fecha de 'firmado', sino de 'cargado' — evitando dar a entender una firma electrónica que no ocurrió."

---

#### 2.4.5 — Bloqueo por cita cancelada y cierre por baja de especialista (estados nuevos, sin equivalente en la HDU actual)

Esto no existe en absoluto en la HDU hoy. Son dos estados nuevos del documento, con su propio disparador automático:

- **Bloqueado**: al cancelarse la cita, todos sus documentos pasan a este estado, con motivo registrado. Sigue aparie­ciendo en el listado (no desaparece), visualmente distinguible de uno firmado. Evidencia: `BloquearPorCitaCanceladaAsync`, disparado desde `CitaService` al cancelar; `PF-243`, `PF-245`, `PF-246`.
- **CerradoPorBaja**: al dar de baja a un especialista, sus documentos vigentes pasan a este estado, con motivo registrado. Evidencia: `CerrarPorBajaEspecialistaAsync`, disparado desde `EspecialistaService.UpdateEstadoAsync`; `PF-244`, `PF-245`, `PF-246`.

**Agregar dos bullets nuevos a DOC-001:**
> - "Si se cancela una cita, todos sus documentos pasan al estado Bloqueado, con el motivo registrado, y siguen apareciendo en el listado — nunca desaparecen ni se confunden con uno completado."
> - "Si se da de baja a un especialista, sus documentos vigentes pasan al estado Cerrado por baja, con el motivo registrado, distinguible en todo momento de un documento firmado con normalidad."

---

#### 2.4.6 — Auditoría: "ver firma" y "ver auditoría" son acciones separadas, y nunca exponen IP ni token

No existe este nivel de detalle en la HDU hoy, más allá de "queda registrado en auditoría con identidad individual".

**Agregar bullets:**
> - "El detalle de un documento ofrece dos acciones de consulta distintas: quién firmó y cuándo (a la vista siempre), y el historial completo de auditoría (una acción separada, que se abre a pedido)."
> - "La auditoría de un documento nunca expone la dirección IP de origen ni el token de acceso utilizado, ni siquiera al personal autorizado a verla."

Evidencia: `PF-247`, `PF-248`; el DTO de auditoría (`AuditoriaEventoResponseDTO`) no incluye esos campos.

---

#### 2.4.7 — Consentimiento reutilizado: aparece una sola vez, y se indica cobertura

**Texto actual:** no hay ningún bullet sobre reutilización de consentimientos vigentes en el listado (aunque el mecanismo de vigencia ya existía de antes del refactor).

**Agregar bullets:**
> - "Un consentimiento reutilizado por seguir vigente aparece una sola vez en el listado general de documentos, en la cita donde efectivamente se firmó — no una fila por cada cita que cubre."
> - "Al abrir el detalle de una cita cubierta por un consentimiento anterior todavía vigente, el sistema lo indica de forma explícita."

Evidencia: `PF-249`, `PF-250`.

---

#### 2.4.8 — Adjuntos disponibles para los tres tipos, no solo Ficha

**Texto actual (FIC-002):** los adjuntos se describen únicamente en el contexto de la ficha clínica.

**Agregar bullet a DOC-001:**
> - "Un Consentimiento o una Recomendación admiten archivos adjuntos de respaldo con el mismo mecanismo que una Ficha clínica."

Evidencia: FK único `Adjunto.DocumentoId` (ya no exclusivo de `FichaClinica`); `PF-251`.

---

#### 2.4.9 — El listado unificado: menú renombrado, filtros, id sin prefijo, visor de solo lectura

Cinco cambios que hoy no están en la HDU, todos ya implementados y probados:

**Agregar bullets:**
> - "El menú de navegación dice 'Documentos', sin ningún contador de pendientes junto al nombre."
> - "El listado general de documentos se filtra por tipo, por texto de búsqueda, por rango de fechas, por estado y por especialista — los cinco filtros se resuelven contra el servidor, no recortando lo ya cargado en pantalla."
> - "Cada documento tiene un identificador entero único, sin prefijo por tipo. El listado nunca confunde una Ficha y un Consentimiento que compartan el mismo número consecutivo."
> - "Al consultar (no firmar) un documento cuyo origen es un PDF, el sistema lo muestra en un visor de solo lectura: se puede ver en pantalla completa, pero no se puede dibujar sobre él."

Evidencia: `PF-252`, `PF-253` (ver Anexo C — este último **no** se cumple hoy), `PF-254`, `PF-255`, `PF-256`.

---

### 2.5 — DOC-002 (historia nueva): "Envío de Recomendaciones al Paciente"

El plan de pruebas ya trae 8 casos completos para esta historia (`PF-229` a `PF-236`) bajo el nombre provisorio `DOC-002`, módulo "Recomendaciones". **Confirmo que corresponde crearla como historia nueva e independiente de DOC-001** — hoy vive apenas mencionada en un bullet de FIC-001 ("Los servicios de masoterapia generan recomendaciones... se rigen por DOC-001"), sin ningún detalle de flujo, y el flujo real (caso EC4 del diagrama, "Enviar una recomendación") es sustancialmente más rico que una nota de texto.

**Bloque completo, listo para pegar en el .docx con el mismo formato que las demás historias:**

> **Id:** DOC-002
> **Usuario:** Especialista
> **Nombre Historia:** Envío de Recomendaciones al Paciente
> **Prioridad en Negocio:** Alta
> **Riesgo de Desarrollo:** Medio
> **Hito asignado:** Hito 4
> **Programador responsable:** Maximiliano Bezares Leyton
>
> **Descripción:** Como especialista, quiero que al marcar una cita como atendida el sistema me pregunte si deseo enviar una recomendación al paciente, y poder elegir entre la recomendación estándar del servicio o una personalizada, para que el paciente reciba indicaciones de seguimiento sin que el envío sea automático ni obligatorio.
>
> **Validación:**
> - La recomendación es un tipo de documento propio, distinto de la ficha clínica y del consentimiento, y se rige por las reglas generales de documentos especificadas en DOC-001.
> - Al marcar una cita como atendida, si el servicio tiene una recomendación configurada, el sistema pregunta de forma obligatoria si se desea enviar una recomendación, antes de continuar. Si el servicio no tiene ninguna recomendación asignada, no se muestra ninguna pregunta.
> - Si el especialista cierra el diálogo sin responder, o responde que no, el sistema no envía ningún correo ni genera ningún documento.
> - Si el especialista responde que sí, puede elegir entre dos variantes: la recomendación Estándar, ya configurada para ese servicio, o una Personalizada para ese paciente en particular.
> - La variante Personalizada admite dos formas: adjuntar un archivo PDF ya redactado, o completar los campos de una plantilla de recomendación.
> - Elegir una recomendación Personalizada para una cita reemplaza a la Estándar en el mismo registro — el paciente recibe una sola recomendación por cita, nunca dos correos para la misma atención.
> - Ambas variantes, una vez enviadas, quedan visibles en el listado general de documentos, indicando su tipo y, si es personalizada, su contenido propio.
> - El envío de la recomendación es siempre por correo electrónico al paciente.
> - Toda recomendación enviada queda registrada en auditoría con la identidad del especialista que la generó.

Evidencia de implementación: `EnviarRecomendacionModal` (frontend), flujo de 3 pasos (preguntar → elegir → adjuntar/completar); `DocumentoService.EnviarRecomendacionAsync`/`AdjuntarRecomendacionAsync` (backend), índice único parcial por tipo `Recomendacion` que garantiza "una por cita" y hace que Personalizada-reemplaza-Estándar sea un `UPDATE` sobre el mismo registro, no un segundo insert.

**Cross-referencias a actualizar por esta historia nueva:**
- **AGE-003**, bullet "...documentos firmados y recomendaciones enviadas" → cambiar "según DOC-001" por "según DOC-001 y DOC-002".
- **NOT-001**, bullet "El sistema envía al paciente el documento de recomendaciones cuando la cita se marca como atendida, si el servicio lo contempla" → agregar "(ver DOC-002)".
- **FIC-001**, bullet "Los servicios de masoterapia generan recomendaciones... se rigen por DOC-001" → cambiar la referencia a "se rigen por DOC-002".

---

### 2.6 — FIC-004 (historia nueva): "Ciclo de Vida y Cierre de la Ficha Clínica"

El plan de pruebas trae 3 casos (`PF-224` a `PF-226`) bajo el nombre provisorio `FIC-004`. **Confirmo que corresponde crearla como historia nueva**, separada de FIC-001 (creación) y FIC-002 (consulta/adjuntos) — ninguna de las dos describe hoy el ciclo de vida Borrador → Cerrada, que es un comportamiento real y ya probado (caso EC3 del diagrama, pasos RF8 a RF12).

**Bloque completo, listo para pegar:**

> **Id:** FIC-004
> **Usuario:** Especialista
> **Nombre Historia:** Ciclo de Vida y Cierre de la Ficha Clínica
> **Prioridad en Negocio:** Alta
> **Riesgo de Desarrollo:** Medio
> **Hito asignado:** Hito 4
> **Programador responsable:** Maximiliano Bezares Leyton
>
> **Descripción:** Como especialista, quiero que una ficha clínica nazca como borrador editable y pueda seguir completándola en más de una sesión, y poder cerrarla explícitamente cuando esté conforme, para que una ficha ya cerrada quede protegida de modificaciones posteriores.
>
> **Validación:**
> - Toda ficha nace en estado Borrador, tanto si se completó con una plantilla del sistema como si se adjuntó ya hecha.
> - Mientras está en Borrador, la ficha admite edición completa y el especialista puede guardar y volver a editar tantas veces como necesite antes de cerrarla.
> - El cierre de una ficha es una acción explícita del especialista, distinta de guardarla. Antes de confirmar el cierre, el sistema advierte que la acción no podrá deshacerse.
> - Una vez cerrada, la ficha rechaza cualquier intento de edición, tanto desde la interfaz como directamente contra el servidor.
> - El cierre de una ficha registra la fecha y la identidad de quien la cerró.
> - El cierre queda registrado en auditoría, igual que la creación y cada edición previa.

Evidencia de implementación: `Documento.Estado` (`Borrador`/`Completado`), `CerrarFichaAsync` en el backend (irreversible, sin "reabrir"), `puedeEditar = esFicha && doc.estado === "Borrador"` en `documento-detalle-modal.tsx`, botón "CERRAR FICHA" con confirmación inline.

**Nota:** Consentimiento y Recomendación no pasan por Borrador (nacen ya Pendientes o Completadas según corresponda) — esta historia es específicamente sobre el ciclo de edición de la Ficha, no de los otros tipos.

---

### 2.7 — AUT-002 "Acceso Individual del Personal al Sistema"

**Bullet a eliminar por completo:**
> "Cada especialista registra su firma una sola vez en su perfil. El sistema la utiliza para estampar los documentos que le corresponde firmar, según DOC-001."

Ya no existe esa funcionalidad — ver §2.4.1.

**Bullet a corregir (acotar su alcance):**
> "El backend aplica autorización por rol en cada endpoint protegido: un especialista accede únicamente a sus propios recursos y el administrador accede a la totalidad."

Esto sigue siendo cierto para **Citas** y para la **escritura** de Documentos, pero ya no para la **lectura** de Fichas/Documentos (ver §2.1). Sugiero:

**Reemplazar por:**
> - "El backend aplica autorización por rol en cada endpoint protegido. Para Citas, un especialista accede únicamente a las suyas. Para Documentos, la lectura es abierta a todo el personal por continuidad de atención (ver FIC-001), pero la escritura (crear, editar, firmar) sigue acotada a las atenciones propias de cada especialista. El administrador accede a la totalidad en ambos casos."

---

### 2.8 — LEG-001 "Protección de Datos Personales y Confidencialidad"

El plan de pruebas trae tres casos (`PNF-065`, `PNF-066`, `PNF-067`) sobre el listado unificado de documentos que no tienen ningún bullet equivalente en LEG-001 hoy.

**Agregar bullets:**
> - "Todo listado de datos clínicos, incluido el listado unificado de documentos, limita su página a un máximo de 50 registros — el exceso se recorta silenciosamente, nunca se entrega una página más grande a pedido del cliente."
> - "Toda consulta al listado unificado de documentos queda registrada como un acceso a datos clínicos en la auditoría, igual que la consulta de un documento individual."

**Estado de implementación real (para quien iba a implementar, no para el texto de la HDU):** el límite de 50 (`PNF-065`) **ya está resuelto** — es una regla genérica de paginación del backend (`PaginacionParams.TamanoMaximo = 50`), aplicada a todos los listados incluido el de documentos. La traza de acceso al listado (`PNF-067`) **no está implementada** — el método `GetAllAsync` del listado unificado no llama al mecanismo de traza de lectura que sí usan la consulta de un documento puntual, el historial por paciente y la descarga de adjuntos (`_trazaAcceso.RegistrarLecturaAsync`, presente en otros 4 puntos de `DocumentoService.cs` pero ausente en `GetAllAsync`). **Es un gap real de código, no solo de documentación** — ver Anexo C.

**Sobre exportación CSV (`PNF-066`):** no existe ningún endpoint de exportación a CSV para el listado de documentos, ni en el backend ni en el frontend. Si el negocio efectivamente lo requiere, hace falta agregarlo como criterio de aceptación explícito en DOC-001 o LEG-001 (hoy no está en ninguna historia, ni siquiera en la versión desactualizada) — y luego implementarlo. Ver Anexo C.

---

## 3. "Pendientes por confirmar": qué se resolvió y qué sigue abierto

La sección inicial del documento lista 12 puntos. Esto es lo que cambió con el refactor de Documentos:

| # | Pendiente | Estado |
|---|---|---|
| 2 | Estructura de campos de la ficha de kinesiología, pendiente de entrega del cliente | **Resuelto por diseño, no por entrega.** El constructor de plantillas (FIC-003) permite crear y modificar la estructura libremente desde el panel, sin depender de que el cliente entregue una estructura fija de antemano ni de que un programador la codifique. Se puede retirar de "pendientes" con esa aclaración. |
| 6 | Plazo de conservación de los datos clínicos exigido por LEG-001 | **Sigue abierto.** No se implementó ningún mecanismo de expiración o anonimización de datos clínicos en este refactor. |
| 7 | Vigencia del enlace de firma de documentos | **Resuelto, con una fórmula distinta a la propuesta original.** Ver §2.4.2 — mover a DOC-001 con el texto correcto, no simplemente marcar como "hecho" la propuesta original (que mencionaba "o al cargarse el documento firmado en papel", cosa que el código no contempla). |
| 8 | Vigencia del consentimiento: ¿se firma en cada atención o mantiene validez por un período? | **Resuelto: mantiene validez por un período (VigenciaDias configurable por asignación servicio-plantilla).** Ver §2.4.7. Mover a DOC-001. |
| 10 | Regla de visibilidad de fichas clínicas entre especialistas | **Resuelto, y en sentido contrario a lo que AUT-002 asume hoy.** Lectura abierta, escritura restringida. Ver §2.1 y §2.7. Retirar de "pendientes" y reflejar la decisión en el cuerpo de las historias, no dejarlo como pregunta abierta. |

Los puntos 1, 3, 4, 5, 9, 11 y 12 son ajenos a Documentos (ventas, embarazadas, voucher, recordatorios, RUT en reserva manual, mejoras del sitio público, credenciales de Webpay) — no se tocan en este análisis.

---

## 4. Otras discrepancias menores encontradas

- **ADM-001 duplicado.** El documento tiene **dos historias con el mismo Id "ADM-001"**: una en el bloque principal ("Sección de Gestión de Contenido Institucional en el Panel", Hito 1, usuario Administrador) y otra en el bloque "Historias de Usuario orientado al diseño" ("Panel de Gestión de Contenido", Hito 4, usuario marcado como "Paciente" — probablemente un error de tipeo, debería decir Administrador). No es un problema de Documentos, pero es un error de numeración que conviene corregir de paso: renumerar la segunda como `ADM-002` y corregir su campo Usuario.
- **Terminología "ficha" vs "documento" en el resto de historias.** AGE-003 dice "documentos firmados" (ya usa el término nuevo); PAC-001 y otras historias no relacionadas con Documentos no necesitan cambios de terminología.

---

## Anexo A — Mapeo directo Plan de Pruebas → Historia (para no adivinar IDs)

| Caso(s) de prueba | Historia a la que pertenecen | Resolución de este análisis |
|---|---|---|
| PF-223, PF-237, PF-238 | FIC-001 | Bullets nuevos, ver §2.1 |
| PF-224, PF-225, PF-226 | **FIC-004 (nueva)** | Historia completa en §2.6 |
| PF-227, PF-228 | FIC-003 | Ya cubierto por bullets existentes ("tipo obligatorio", validación de backend) — verificar que el texto actual de FIC-003 sea explícito sobre el rechazo a nivel de API, no solo de interfaz |
| PF-229 a PF-236 | **DOC-002 (nueva)** | Historia completa en §2.5 |
| PF-239 a PF-256 | DOC-001 | Bullets nuevos, ver §2.4.2 a §2.4.9 |
| PNF-016, PNF-018, PNF-064 | AUT-002 / FIC-001 | Ver §2.1 y §2.7 |
| PNF-065, PNF-066, PNF-067 | LEG-001 | Ver §2.8 |

## Anexo B — Diagrama de flujo → Historia (por si hace falta trazar en sentido inverso)

| Caso del diagrama (`Flujo Seccion Documentos...md`) | Historia HDU |
|---|---|
| AC1 Crear una plantilla | FIC-003 |
| AC2 Reenviar un enlace vencido | DOC-001 §2.4.2, §2.4.3 |
| AC3 Recibir un documento firmado en papel | DOC-001 §2.4.4 |
| AC4 Cancelar una cita | DOC-001 §2.4.5 |
| AC5 Dar de baja a un especialista | DOC-001 §2.4.5 |
| PC1 Pagar la reserva | DOC-001 (ya cubierto, "se solicitan después de confirmado el pago") |
| PC2 Firmar un documento | DOC-001 §2.4.1 |
| PC3 Encontrar el enlace vencido | DOC-001 §2.4.2, §2.4.3 |
| EC1 Cerrar la atención | DOC-001 (ya cubierto) |
| EC2 Firmar como profesional | DOC-001 §2.4.1 |
| EC3 Registrar una ficha | FIC-001 + **FIC-004 (nueva)** |
| EC4 Enviar una recomendación | **DOC-002 (nueva)** |
| CC1 Consultar los documentos | DOC-001 §2.4.9 + FIC-002 |
| CC2 Ir a crear desde el listado | Sin historia dedicada — comportamiento de navegación, no requiere una |

## Anexo C — Gaps reales de implementación (no son cambios de texto en la HDU; son trabajo pendiente)

Estos puntos aparecen porque el Plan de Pruebas los espera y el código real no los cumple todavía. No hay que "arreglar" la HDU para estos — hay que decidir si el negocio los quiere y, si es así, implementarlos:

1. **No hay redirección desde las rutas viejas `/panel/fichas/*`.** El Plan de Pruebas (`PF-253`) espera que abrir la ruta vieja redirija a `/panel/documentos/*` sin error. Hoy esas rutas fueron eliminadas sin dejar redirección — un enlace o marcador viejo da 404. Se resuelve con un `redirects()` en `next.config.ts` o páginas puente; no toca ningún dato ni lógica de negocio.
2. **El listado unificado de documentos no deja traza de lectura.** `PNF-067` lo espera; `DocumentoService.GetAllAsync` no llama al mecanismo de traza de acceso clínico que sí usan el detalle de un documento, el historial por paciente y la descarga de adjuntos.
3. **No existe exportación a CSV del listado de documentos.** `PNF-066` lo espera. No hay endpoint ni acción de UI para esto en ningún lado del código actual — confirmar primero si el negocio realmente lo requiere (no está en la HDU actual tampoco) antes de construirlo.
4. **Impresión/exportación a PDF de una ficha armada con el constructor (sin archivo).** FIC-002 promete "exportar la ficha a PDF, con la identidad visual de KineFit". Hoy, para una ficha de tipo Constructor, "imprimir" es un `window.print()` del navegador sobre la vista renderizada — no genera un PDF con membrete real del lado del servidor. Confirmar si esto satisface la intención original antes de darlo por cumplido.
