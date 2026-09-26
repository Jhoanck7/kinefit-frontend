# Análisis de los no aprobados desde PF-089 hasta el final

Fecha: 2026-09-25. Reemplaza a los informes del 24 y del 25/09.
Alcance: los **76 casos no aprobados** entre PF-089 y PF-256, más los hallazgos H-021 a H-027.
Fuentes: `docs/Plan_de_Pruebas_KineFit (1).xlsx`, los dos manuales oficiales, el código en el HEAD actual y pruebas en vivo contra `api-test.kinefitchile.com`.

Nada está implementado. Cada propuesta espera aprobación.

---

## 0. Cómo leer esto

**El Excel es una foto de primera pasada.** Maxi confirmó que ninguna fila se re-ejecuta después de su primera corrida. Entonces un "Fallido" significa *"falló la primera vez que se probó"*, no *"falla hoy"*. Como nginx ya se corrigió y nadie volvió a correr lo que dependía de él, hay filas que describen un sistema que ya no existe.

Por eso clasifico cada caso en una de estas cuatro categorías, y **el criterio no es lo que dice el Excel sino lo que verifiqué en el código del HEAD actual**:

| Marca | Significa |
|---|---|
| **REAL** | Lo confirmé leyendo el código hoy. Falla de verdad. Tiene diagnóstico y propuesta |
| **HEREDADO** | El Excel lo marca mal, pero la causa ya se corrigió. Solo hay que re-ejecutarlo |
| **PASA** | Está implementado. Predigo Aprobado al ejecutarlo |
| **CASO** | El problema está en el caso de prueba, no en el sistema |

Resultado global de los 76:

| | Cantidad |
|---|---|
| **REAL** — fallos vigentes | **24** |
| **HEREDADO** — solo re-test | 21 |
| **PASA** — solo ejecutar | 25 |
| **CASO** — corregir el plan | 6 |

**No hubo cambios de código desde el informe anterior**: `kinefit-frontend` en `d117158`, `kinefit-backend` en `20383c3`, árboles limpios.

---

## 1. Las cinco causas raíz

Los 24 fallos reales se reducen a cinco causas. Atacándolas en orden se cierran 24 casos y 6 hallazgos.

| # | Causa raíz | Casos que cierra |
|---|---|---|
| **C1** | Dominio de envío no verificado en Resend | PF-125, 216, 217, 218, 219, 220, 240 |
| **C2** | La identidad del actor se guarda como id, nunca como nombre | PF-095, 172, 174 |
| **C3** | Funciones construidas en backend y servicio pero sin UI que las use | PF-146, 244, H-026, H-027 |
| **C4** | El mismo dato se interpreta con reglas distintas en cada vista | PF-113, 114, 101, 107, 092, 178 |
| **C5** | Piezas que nunca se implementaron | PF-198, 147, 170, 097, 127, 253, H-021, H-022, H-023, H-025 |

---

## 2. C1 — El correo nunca sale (7 casos)

### Diagnóstico

`appsettings.json` envía desde `KineFit <notificaciones@kinefit.cl>`. Verifiqué el DNS público hoy:

```
resend._domainkey.kinefitchile.com  -> SIN registro
resend._domainkey.kinefit.cl        -> SIN registro
```

**Ningún dominio tiene el DKIM que Resend exige.** Resend rechaza con 403 todo envío desde un dominio no verificado. `EmailService.EnviarAsync` captura la excepción, devuelve `Enviado = false`, la notificación reintenta cinco veces con espera creciente y termina en `Fallida`. Sin ruido visible.

El pipeline en sí está bien construido: `EncolarNotificacionesDeFirma` inserta la fila, `NotificacionesBackgroundService` la procesa cada 60 s, `Redactar` cubre los seis tipos y la plantilla HTML viaja en la imagen Docker (verificado en `bin/.../Templates/Email/Notificacion.html`). **No hay nada que arreglar en el código.**

| Caso | Estado | Marca |
|---|---|---|
| PF-125 Correo de respaldo con enlace | Fallido | **REAL** |
| PF-216 Correo de confirmación | Fallido | **REAL** |
| PF-217 Correo de documentos | Fallido | **REAL** |
| PF-218 Correo de recordatorio | Fallido | **REAL** |
| PF-219 Correo post atención | Fallido | **REAL** |
| PF-220 Nota del paciente en el correo | Fallido | **REAL** |
| PF-240 Reenvío por correo | Pendiente | **REAL** |

### S-13 — Solución (configuración, no código)

1. Verificar `kinefitchile.com` como dominio de envío en Resend y publicar los DKIM/SPF que indique el panel.
2. Cambiar `EmailConfiguration:From` a una dirección de ese dominio, en `/etc/kinefit/appsettings.json` **y** `/etc/kinefit-test/appsettings.json`.
3. Verificar que `Frontend:BaseUrl` no haya quedado en `http://localhost:3000` (el valor del repo), o los enlaces del correo serían inservibles aunque el correo llegara.

Confirmalo antes con:

```sql
SELECT id, tipo, estado, intentos, detalle_fallo, created_at
FROM notificaciones ORDER BY id DESC LIMIT 20;
```

### Los dos que sí pasan

- **PF-221 Registro de envíos** — **PASA**. La tabla `notificaciones` guarda `tipo`, `destinatario`, `estado`, `intentos`, `detalle_fallo` y `enviado_en`, y `NotificacionController` los expone. Lo que hoy no hay es una vista en el panel, pero el caso dice "consultar el registro", no "desde el panel".
- **PF-222 Reintento ante fallo** — **PASA**, y de hecho ahora mismo está demostrándose solo: `MaxIntentos = 5` con `Espera(n) = 2^(n-1) × 2` minutos, reclamo atómico vía SQL para que dos pasadas no tomen la misma fila, y la excepción capturada para que un fallo no corte el proceso. El estado `Fallida` con `detalle_fallo` es exactamente lo que el caso pide.

> **Manual del Sistema §6.7.4:** conviene documentar el requisito de dominio verificado y cuál es el remitente oficial. Es el dato cuya ausencia produjo siete fallos.

---

## 3. C2 — La identidad queda como número, nunca como nombre (3 casos)

### Diagnóstico

El sistema **sí** registra quién hizo cada cosa. Lo que no hace es resolver ese id a un nombre en ninguna respuesta.

- `AuditoriaCitaResponseDTO` tiene `TipoActor` (string: "Personal" / "Paciente" / "Sistema") y `UsuarioId` (`int?`). **No tiene nombre.**
- `audit-trail.tsx` renderiza una sola cosa: `{ETIQUETA_ACTOR[cambio.tipoActor]}`. O sea, muestra "Personal". Nunca *qué* persona.
- `DocumentoDetalleResponseDTO` tiene el mismo problema: `CreadoPorTipoActor` y `CreadoPorActorId`, sin nombre. Y **tampoco expone `CreatedAt`**.

Eso produce exactamente las tres observaciones:

| Caso | Observación | Marca |
|---|---|---|
| PF-095 Autor y fecha automáticos | *"No se muestra la fecha de creación de la ficha"* — falta la fecha **y el autor** | **REAL** |
| PF-172 Auditoría de la cita manual | *"Está la identidad de la especialista a atender, pero no quién lo reservó"* | **REAL** |
| PF-174 Auditoría del origen | *"Solo se ve el especialista en el que se registró"* | **REAL** |

El patrón es claro: en las tres vistas se ve **a quién le toca la cita**, porque eso viene de la relación con `Especialista`, y nunca **quién ejecutó la acción**, porque eso es un `UsuarioId` suelto que nadie resuelve.

### S-04 — Solución

1. **Backend, DTOs:** agregar `UsuarioNombre` a `AuditoriaCitaResponseDTO` y `AuditoriaEventoResponseDTO`; agregar `CreadoPorNombre` y `CreatedAt` a `DocumentoDetalleResponseDTO`.
2. **Backend, servicios:** resolver el nombre con una proyección puntual: `_context.UsuariosPersonal.Where(u => u.Id == id).Select(u => u.Nombre)`. Cuando `TipoActor` sea `Sistema` o `Paciente`, dejarlo nulo y que el frontend muestre la etiqueta genérica.
3. **Frontend:** en `audit-trail.tsx` mostrar `"{nombre} ({tipoActor})"`; en `documento-detalle-modal.tsx` partir el campo "Origen" en dos: "Creada por" y "Fecha de creación".

**Por qué una proyección y no un `Include`:** `UsuarioId` no es una FK navegable en `AuditoriaCita` ni `CreadoPorActorId` en `Documento` — apuntan a `UsuarioPersonal` solo cuando el actor es Personal, y son nulos en los otros dos casos. Un `Include` no compila. La proyección puntual es el patrón que el propio `SubirAdjuntoAsync` ya usa para resolver `SubidoPorNombre`; conviene seguirlo y no inventar otro.

**Por qué hacer los tres juntos:** es un solo cambio conceptual repetido en tres DTOs. Separarlos garantiza que el tercero quede a medias.

> **Impacto en manuales: SÍ.** Manual de Usuario §4.3 describe los Datos de la Atención como "paciente, servicio, fecha y horario, profesional y origen" — hay que sumar creador y fecha. Y §1.2.3 dice que el historial indica "quién ejecutó el cambio", que **hoy es falso**: el arreglo alinea el sistema con lo que el manual ya promete.

---

## 4. C3 — Construido pero sin cablear (4 casos)

Este grupo tiene algo en común que conviene ver junto: **el trabajo difícil ya está hecho** y falta el botón.

### 4.1 PF-146 y PF-244 — Desactivar un especialista — **REAL**

| Capa | Estado |
|---|---|
| Backend `PATCH /api/especialistas/{id}/estado` | **Existe.** `UpdateEstadoAsync` cuenta las citas vigentes, devuelve `citasVigentes` y una `advertencia`, **advierte sin bloquear**, y llama a `CerrarPorBajaEspecialistaAsync` |
| Servicio frontend `especialistaService.updateEstado` | **Existe** |
| Hook `useUpdateEspecialistaEstadoMutation` | **Existe y está exportado** |
| UI | **Nadie lo consume** |

`use-especialistas.ts` importa crear, actualizar y eliminar — el de estado no. La única acción disponible es el borrado duro. Y el modal de eliminación le dice al usuario *"te recomendamos cancelar el borrado y simplemente **Desactivarlo**"*, recomendando algo que no existe en ninguna pantalla.

**PF-244** (*"No hay opción para dejar de baja un documento"*) es el mismo bug visto desde el otro lado: como no se puede dar de baja a una especialista, nunca se dispara `CerrarPorBajaEspecialistaAsync` y no se puede comprobar que sus documentos pasen a "Cerrado por baja". **PF-244 no es un fallo propio: es PF-146.**

**S-10:** importar el hook en `use-especialistas.ts`, exponer `handleToggleEstado`, agregar el botón Desactivar/Activar en el pie de `especialista-card.tsx` junto al badge de estado (con `stopPropagation`, porque la tarjeta entera abre la edición), y mostrar la `advertencia` que el backend ya devuelve.

**Por qué no agregar `activo` al `UpdateEspecialistaDTO`**, que sería lo obvio: `UpdateEstadoAsync` tiene efectos laterales propios —contar citas, cerrar documentos— que `UpdateAsync` no tiene. Fusionarlos haría que editar una biografía dispare el cierre de documentos.

> **Manuales:** ninguno, y lo **corrige**. §6.2 ya dice *"desactivar a una integrante la retira de las nuevas reservas y cierra sus documentos vigentes"*. El manual describe una función sin botón.

### 4.2 H-027 — Eliminar plantillas — **REAL**

No hay `DELETE` para plantillas: `DocumentoController` solo tiene POST de creación, GET, `PUT` y `PATCH estado`.

Hay que separar dos situaciones que el hallazgo mezcla:

1. **Plantilla con documentos generados.** No se debe poder borrar, y el manual §4.5.1 lo dice explícitamente. El sistema hace lo correcto — por eso **PF-119 pasó**.
2. **Plantilla con cero documentos** (la de prueba, la del nombre mal escrito). Tampoco se puede borrar, y **para este caso el manual no dice nada**. Queda ensuciando el catálogo, y encima el nombre queda tomado: `ExistePlantillaConNombreAsync` impide reutilizarlo.

El caso 2 es el hallazgo real.

**S-22:** endpoint `DELETE /api/documentos/plantillas/{id}` que primero llame a `ContarDocumentosPorPlantillaAsync` y, si hay documentos, lance `UnprocessableException` con código `PLANTILLA_EN_USO` —**el mismo patrón que `ActualizarPlantillaAsync` ya usa**, así el frontend sabe interpretarlo sin código nuevo—. En el catálogo, botón Eliminar visible solo cuando `plantilla.documentosAsociados === 0`, dato que ya viene en el DTO y ya se usa para pintar el badge "En Uso".

> **Manuales: SÍ.** §4.5.1 hoy dice que una plantilla "no se elimina", en absoluto. Hay que matizar: se elimina mientras no tenga documentos; después, solo desactivar.

### 4.3 H-026 — Editar o quitar un POS — **REAL**

`TerminalPagoController` expone **solo GET y POST**. Un POS mal creado queda así para siempre y sigue apareciendo al registrar cobros.

Conviene distinguirlo de sus vecinos, que también son solo GET+POST pero **a propósito**:

| Entidad | ¿Intencional? |
|---|---|
| Acuerdos de reparto | **Sí.** §5.5.2: *"use Nueva Versión en lugar de editar"* |
| Tasa de IVA | **Sí.** §5.5.3: las ventas anteriores conservan su tasa |
| **Terminales POS** | **No.** El manual no dice nada parecido |

Pero el problema de fondo es el mismo que allá resolvieron con versiones: **las comisiones del POS entran en el cálculo de ventas ya registradas.** Editarlas a secas desalinearía el histórico.

**S-21, y hay que elegir:**
- **a.** Desactivar, no borrar: `PATCH /api/terminales/{id}/estado` e interruptor Activo/Inactivo. Es el patrón que ya usan especialistas, servicios, empresas y plantillas.
- **b.** Editar solo lo no contable (nombre, notas, plazo de abono), nunca las comisiones.
- **c.** Las dos.

Recomiendo **(c)**, y si hay que priorizar, **(a) primero**: cubre el caso real —"creé un POS de prueba y quedó ahí"— con un patrón ya existente y sin tocar el cálculo. **No recomiendo `DELETE` duro**: borraría el terminal al que apuntan ventas registradas.

> **Manuales: SÍ.** §5.5.1 solo describe agregar. Hay que documentar la desactivación y, si se hace (b), qué campos son editables. Conviene además una Advertencia explicando por qué las comisiones no se editan, en la línea de las que ya existen en §5.5.2 y §5.5.3.

---

## 5. C4 — El mismo dato, reglas distintas en cada vista (6 casos)

Este es el grupo con más fallos nuevos, y todos salen del mismo defecto estructural: **hay tres componentes que interpretan el `cuerpo` de una plantilla, cada uno con su propio criterio.**

| Vista | Respeta `completadoPor` | Renderiza `Firma` | Renderiza `TextoInformativo` |
|---|---|---|---|
| Constructor (vista previa) | No | No (caja gris genérica) | No |
| Firma pública del paciente | **Sí** (`filter(c => c.completadoPor === "Paciente")`) | n/a | **Sí** |
| Asistente de ficha | **No** | **No** (cae en `TextField`) | **Sí** |

### 5.1 PF-113 — Quién completa cada campo — **REAL** (Crítico)

> *"Al momento de crear la plantilla está la opción de quien lo completa y se guarda, pero no se marca quien lo debe completar al momento de registrar la ficha."*

La observación se queda corta: el problema no es que no se marque, es que **no se usa para nada**. En `documentos/nueva/contenido/index.tsx` la palabra `completadoPor` no aparece: el componente decide únicamente por `campo.tipo`. Entonces se le muestran a la profesional **todos** los campos, incluidos los del paciente, sin distinción.

Y la cadena de `if` cubre `TextoInformativo`, `Numerico`, `TextoLargo`, `Fecha` y `Seleccion`, y termina en `return <TextField {...comun} />`. **Un campo de tipo `Firma` se dibuja como caja de texto común.**

**S-18:**
1. Mostrar un distintivo por campo: "La profesional" / "El paciente".
2. **Decisión tuya**, porque cambia la semántica: los campos del paciente en una ficha se muestran **(a)** en solo lectura y agrupados aparte, **(b)** ocultos como hace la vista pública al revés, o **(c)** editables por la profesional pero marcados.
   Recomiendo **(c)**: una ficha clínica la llena la profesional en la consulta, y bloquearle campos no aporta. Pero necesita el distintivo para saber qué es de quién. (a) y (b) tienen sentido solo si algún día el paciente completa fichas por su cuenta, cosa que hoy no existe.
3. Agregar una rama para `tipo === "Firma"` antes del fallback, aunque sea un recuadro deshabilitado con la leyenda "Se firma aparte". Una caja de texto donde se espera una firma es peor que no mostrar nada.

**Por qué unificar y no parchar la vista de ficha:** hoy dos componentes leen el mismo `cuerpo` con reglas distintas, y esa divergencia es la que produjo el bug. Convenga lo que convenga, la regla tiene que quedar en un solo lugar.

> **Manuales: SÍ.** §4.5.3 dice que cada campo define quién lo completa; §4.4.2 solo dice "Complete los campos". Hay que actualizar §4.4.2.

### 5.2 PF-114 — Recuadros de firma — **REAL** (Crítico)

> *"Se declara solamente una sola firma, recuadro ambiguo"*

**Hay dos mecanismos de firma superpuestos que no se hablan.**

**Mecanismo 1, a nivel plantilla:** los interruptores `requiereFirmaPaciente` y `requiereFirmaProfesional`, condicionados así:

```tsx
{tipoDocumento === "Consentimiento" && modo !== "elegir" && (
  {modo !== "archivo" && (<SwitchField etiqueta="Requiere firma del paciente" …/>)}
  <SwitchField etiqueta="Requiere firma de la profesional" …/>
)}
```

De donde salen tres comportamientos:

| Caso | Interruptores visibles |
|---|---|
| Consentimiento con constructor | Los dos |
| **Consentimiento importado (PDF)** | **Solo el de la profesional** — el del paciente se fuerza a `true` en la importación |
| Ficha clínica y Recomendación | **Ninguno** |

El del medio es exactamente "se declara solamente una sola firma".

**Mecanismo 2, a nivel campo:** `TIPOS_CAMPO` incluye `Firma`, disponible **para los tres tipos de documento**. Podés ponerle un campo "Firma" a una ficha clínica. Pero nadie lo renderiza como firma: en la vista previa cae en el rectángulo genérico, y en el asistente de ficha sale como caja de texto (§5.1).

Ese es el "recuadro ambiguo": quien arma la plantilla ve un tipo de campo llamado "Firma" y dos interruptores llamados "Firmas Requeridas", sin forma de saber cuál manda — y el sistema no se comporta como si mandara ninguno de forma consistente.

**S-19. Requiere tu decisión antes de escribir nada**, porque son dos diseños incompatibles:

- **Opción A — manda la plantilla.** Se elimina el tipo de campo `Firma`. Los interruptores se muestran para los tres tipos y dejan de depender de `modo`. El recuadro se dibuja al pie del documento.
- **Opción B — mandan los campos.** Se eliminan los interruptores y la firma se declara con campos `Firma` y su `completadoPor`. Da control de dónde va cada firma, pero **obliga a reescribir el firmado**: hoy `PdfSignatureCanvas` estampa el trazo sobre la página completa y no hay coordenadas de recuadro.

**Recomiendo la A**, y con convicción: la B contradice la decisión ya cerrada de que la firma va dentro del PDF sin coordenadas ni estampado en backend, y multiplica el trabajo. En cualquier caso, lo mínimo es que los interruptores **dejen de depender de `tipoDocumento` y de `modo`**.

> **Manuales: SÍ, en cualquiera de las dos.** §4.5.3 lista **Firma** entre los siete tipos de campo: *"Un recuadro para firmar, sea del paciente o de la profesional."* Con la opción A **hay que sacar esa fila**. Es el caso más claro de todo el análisis en que arreglar el sistema obliga a tocar el manual.

### 5.3 PF-107 — Aviso de privacidad — **REAL** (Mayor)

El aviso existe en **un solo lugar** de todo el panel: `documentos/nueva/contenido/index.tsx:69`, *"Contenido privado. No visible para el paciente."* Es decir, en el paso 2 del asistente de creación. En el **detalle de un documento guardado** —que es donde uno abre una ficha el 99 % de las veces— no hay nada.

**S-20:** agregar el mismo aviso en `documento-detalle-modal.tsx`, arriba del bloque de contenido, reutilizando el componente `Alerta` que ese archivo ya importa para `doc.motivoCierre`. Condicionarlo a Ficha y Consentimiento: una Recomendación **sí** va dirigida al paciente, así que ahí el cartel sería falso.

> **Manuales: SÍ.** §4.3 describe el detalle sin aviso de privacidad.

### 5.4 PF-101 — Exportar la ficha a PDF — **REAL** (Mayor)

El botón **Descargar** está envuelto en `{doc.tieneArchivo && (…)}`. Una ficha del constructor no tiene archivo (su contenido son respuestas JSON), así que **el botón no se renderiza**. Y **Imprimir**, para ese caso, cae en `window.print()`, que imprime la página entera del panel, menú lateral incluido.

Para una ficha del constructor no hay ni exportación ni impresión utilizable.

**S-07:** generar el PDF en el cliente con `generarPdfDesdeConstructor`, que **ya existe** en `@/lib/documento-pdf` y ya se usa en la firma pública para armar el PDF de un consentimiento del constructor.

**Por qué en el cliente y no en el backend:** hay una decisión cerrada de no incorporar una librería de PDF al backend. Y reutilizar esa función mantiene **una sola definición** de cómo se ve un documento del constructor; con un segundo generador, el PDF que descarga la profesional y el que firma el paciente se irían separando con cada cambio.

> **Manuales:** ninguno, y lo **corrige**. §4.3.3 ya afirma que "Descargar lo obtiene como archivo". Hoy solo es cierto para documentos con archivo.

### 5.5 PF-092 — Indicador de reservas con ficha — **REAL** (Mayor)

El asistente de ficha **sí** distingue: muestra "Con Ficha" o "{estado}, lista para ficha" y deshabilita las que ya tienen. Donde no existe el indicador es en los dos listados a los que uno llega primero: el **Historial de Citas** del paciente y las **tarjetas de Agenda**.

**S-03:** replicar en el historial del paciente el cruce que ya hace el asistente — `useGetFichasPorPaciente` devuelve `{id, citaId, estado}` y se cruza por `citaId` contra `perfil.historial`, tal cual `use-nueva-ficha-reserva.ts:46-53`. Agregar un segundo badge "Con ficha" / "Sin ficha".

Para la **Agenda** es distinto: la tarjeta no tiene el dato y traerlo exige un campo nuevo en el DTO de agenda. **Propongo dejar la Agenda fuera** y cerrar PF-092 con el historial, salvo que definas lo contrario.

> **Manuales: SÍ.** §3.3.2 describe el Historial con "fecha y rango horario, servicio, profesional y estado".

### 5.6 PF-178 — Estado de documentos en el perfil del paciente — **REAL** (Mayor)

La pestaña Documentos del paciente renderiza por documento: `doc.nombre`, `etiquetaTipoDocumento(doc.tipo)` y `formatearFechaCorta(doc.fechaAtencion)`. **El estado no se muestra.** No hay forma de distinguir firmado de pendiente, que es justo lo que pide el caso.

**S-23:** agregar el badge de estado a cada línea, reutilizando `CATALOGO_ESTADOS_DOCUMENTO` y `COLOR_ROL`, que el detalle del documento ya usa para pintar exactamente ese badge. El dato ya viaja en `DocumentoResumenDTO`.

> **Impacto en manuales: SÍ.** §3.3.3 dice *"Cada línea muestra el nombre del documento, su tipo y su fecha"*. El manual coincide con el código actual, así que agregar el estado **obliga a actualizarlo**. Es uno de los pocos casos donde el manual no está adelantado al sistema sino alineado con él.

---

## 6. C5 — Piezas que nunca se implementaron (10 casos)

### 6.1 PF-198 — Exportación de ventas — **REAL** (Mayor)

```js
function handleExportar() {
  alert("Exportando Planilla de Ventas a formato Excel / CSV...");
}
```

Eso es todo. El botón existe, muestra un `alert` y no exporta nada. Es un *stub*.

Contrasta con **Reportes**, donde la exportación **sí** está implementada: `reporte-ventas-view.tsx` tiene "Exportar CSV" con estado `descargando`. O sea, el patrón existe en el repo; a Ventas no se le aplicó.

**S-24:** implementar la exportación reutilizando el mismo camino de Reportes. Dos opciones:
- **a.** Generar el CSV en el cliente a partir de las ventas ya cargadas. Simple, pero **solo exporta la página visible**, y el listado se pagina de diez en diez — contradiría *"respeta los filtros activos"*.
- **b.** Endpoint de exportación en el backend que reciba los mismos filtros y devuelva el archivo completo.

Recomiendo **(b)**. Con (a), un período de 200 ventas exportaría 10 filas, que es peor que no tener el botón.

> **Impacto en manuales:** ninguno, y lo **corrige**. §5.6 ya describe la exportación paso a paso, con la Nota *"la exportación respeta los filtros activos"*. El manual documenta en detalle una función que hoy es un `alert`. **Esta es la discrepancia manual↔sistema más grande de todo el análisis.**

### 6.2 PF-170 — Un especialista puede agendar en la agenda de otra — **REAL** (Crítico)

> *"Un especialista puede reservar a nombre de otro especialista"*

Confirmado. `EspecialistaAccessGuard.VerificarAcceso` existe y está bien construido: si el rol es Especialista y el recurso es de otra, lanza `ForbiddenException` con código `ESPECIALISTA_AJENO`. Se usa en `DocumentoService`, `BloqueoAgendaService`, `PlantillaHorarioService`, `TransaccionService` y otros.

En `CitaService` se invoca **una sola vez**, en `UpdateEstadoAsync` (línea 518). **`CreateManualAsync` no lo llama.** Entonces una especialista puede crear una reserva en la agenda de cualquier otra.

**S-25:** agregar `_especialistaAccessGuard.VerificarAcceso(especialista.Id)` en `CreateManualAsync`, después de resolver el especialista de los bloques y antes de crear la cita.

**Por qué en el servicio y no en el controlador:** el guard lee el rol del token vía `ICurrentUserContext`, y todos los demás usos están en la capa de servicio. Ponerlo en el controlador rompería esa consistencia y dejaría el servicio inseguro si alguien lo llama desde otro lado.

**Complemento en el frontend:** en el paso 3 del asistente, si el rol es Especialista, ofrecerle solo su propia ficha. Hoy el asistente lista a todas. El backend es la defensa real, pero dejar visible una opción que va a ser rechazada es mala UX.

> **Manuales:** ninguno, y lo **corrige**. La tabla de Roles y permisos dice *"Agenda: cambiar el estado de una cita de otra profesional → Especialista: No"*, y §2.3 no contempla que una especialista agende para otra. El manual ya describe el comportamiento correcto.

### 6.3 PF-097 — Vinculación por RUT — **REAL** (Crítico)

> *"Se intentó iniciar sesión con el mismo RUT, pero decía 'usuario ocupado por el mismo RUT'"*

`LoginGoogleAsync` intenta vincular en orden: por `GoogleSub`, **por RUT si viene `dto.Rut`**, por correo como respaldo, y si nada coincide crea un paciente con `Rut = null`.

El problema: **el frontend nunca envía el RUT en el login de Google.** `loginWithGoogleToken(idToken, consentimientoAceptado)` arma el body como `{ idToken, consentimientoAceptado }` y nada más. **La rama de vinculación por RUT —justo lo que prueba PF-097— es código muerto desde la web.**

Con un paciente creado a mano con RUT `X` y correo `A`, y un login de Google con correo `B`: no matchea por sub, no matchea por RUT (nunca se evalúa), no matchea por correo → **se crea un duplicado**. Después el `PATCH /auth/perfil` manda el RUT `X`, `ExistsByRutAsync` lo encuentra en el original y lanza *"El RUT ingresado ya está registrado por otro paciente en el sistema."*

El usuario queda en un callejón sin salida: ya tiene sesión, ya tiene una ficha duplicada, y no puede completar su perfil nunca.

**S-05:** la reconciliación tiene que ir en `UpdatePerfilAsync`, no en el login. Cuando `ExistsByRutAsync` dé positivo:
- Buscar al dueño de ese RUT.
- Si **no tiene `GoogleSub`** (ficha creada a mano, nunca reclamada), **fusionar**: trasladar `GoogleSub` y correo al original, mover lo que cuelgue del duplicado, borrarlo y re-emitir el JWT contra el id original.
- Si **ya tiene `GoogleSub`** y es otro, ahí sí es conflicto real: mantener el error, con mensaje accionable.

**Por qué en `UpdatePerfilAsync` y no en `LoginGoogleAsync`:** en el momento del login el sistema **no conoce** el RUT, y no puede conocerlo, porque no está en el token de Google. El único momento del flujo donde el RUT y la identidad de Google coexisten es el `PATCH /perfil`. Resolverlo en el login obligaría a pedir el RUT antes de autenticar: peor UX, y un dato sin validar en un endpoint anónimo.

> **Manual del Sistema §4.8:** hay que documentar la rama de reconciliación.

### 6.4 PF-127 — El paciente puede descargar — **REAL** (Crítico)

Dos fugas distintas:

**Fuga 1 — el paso de revisión usa el visor nativo.** `<embed src={pdfFirmadoBase64} type="application/pdf">` abre el visor de Chrome/Edge/Firefox, **con botón de descarga e impresión visibles**. El paso *anterior* está bien resuelto: `PdfSignatureCanvas` rasteriza el PDF a `<canvas>` con pdf.js, y de un canvas no hay descarga.

**Fuga 2 — el archivo de la plantilla es una URL directa.** `/documentos/publico/{token}/archivo` es pública (solo necesita el token, que el paciente tiene en la barra de direcciones) y el backend la sirve con `File(contenido, tipoMime)` sin `Content-Disposition`. Pegándola en una pestaña, se descarga.

**S-06:**
1. Reemplazar el `<embed>` por el mismo `PdfSignatureCanvas` en modo solo lectura (una prop que no monte los canvas de firma ni los handlers de puntero).
2. Servir el archivo público con `Content-Disposition: inline` como mínimo; lo correcto es un token separado del de firma.

**Por qué reutilizar el canvas y no un `<iframe>` con la toolbar oculta:** ocultar la toolbar del visor de PDF no es controlable de forma portable (`#toolbar=0` lo ignoran varios navegadores y no existe en Firefox). El canvas es la única garantía real, y ya está escrito y probado en este mismo flujo.

### 6.5 PF-253 — Redirección desde la ruta vieja — **REAL** (Mayor)

La única redirección que existe es `/panel` → `/panel/agenda` (`src/app/(panel)/panel/page.tsx`). **No hay ninguna para la ruta anterior del módulo de documentos**, que el refactor renombró desde "Fichas Clínicas". Un marcador guardado da 404.

**S-26:** agregar la redirección en `next.config.ts` mediante `redirects()`, o un `page.tsx` con `permanentRedirect` en la ruta vieja. Necesito que me confirmes **cuál era exactamente la ruta anterior** para no inventarla.

### 6.6 Los cuatro hallazgos de comportamiento — **REAL**

| Hallazgo | Diagnóstico | Solución |
|---|---|---|
| **H-021** Botón "Ir a la Web" visible para Especialista (Menor) | `header.tsx:69` lo renderiza sin condición de rol, a diferencia del sidebar que sí filtra por `soloAdministrador` | **Tu decisión.** Ver abajo |
| **H-022** La sesión se da por registrada sin RUT ni teléfono (Crítico) | `LoginGoogleAsync` crea el `Paciente` en el acto del login con `Rut = null` y `Telefono = null`, y devuelve JWT. El frontend muestra "Sesión Iniciada Correctamente". El backend **sí** devuelve `PerfilCompleto`; el frontend **lo ignora** | **S-16:** leer `perfilCompleto` y cambiar el cartel a "Completa tu RUT y teléfono para continuar"; enfocar el campo RUT |
| **H-023** El botón Adjuntar sigue visible en documento cerrado (Mayor) | El `<label>Adjuntar</label>` y los botones Eliminar se renderizan **sin condicionar por `doc.estado`**. El backend rechaza con `DOCUMENTO_CERRADO`, pero la llamada usa `mutate` sin `onError`, así que **el error no se muestra en ninguna parte** | **S-09:** ocultar según el catálogo de estados (no un array suelto) y cambiar `mutate` por `mutateAsync` en `try/catch` con `setErrorMsg` |
| **H-025** El login manual no manda ningún request (Crítico) | **No existe login manual de paciente** ni lo hubo: solo `POST /auth/google`. Lo que se probó fue llenar el paso 4 y presionar "Reservar y Pagar" sin sesión. El `disabled` del botón valida nombre, correo, teléfono y RUT **pero no `authToken`**, y `handleFormSubmit` hace `return` mudo | **S-15:** sumar `!authToken` al `disabled`, mostrar el motivo junto al botón, y reemplazar el `return` por `setAuthError` |

**Sobre H-021, hay que parar antes de arreglar**, porque el manual dice lo contrario:

> "La barra superior": *"se muestran tres elementos: el nombre del módulo abierto, **el enlace Ver Sitio Web / Landing Page**, y la identificación de la cuenta"*

El manual lo describe igual para todos los roles, la tabla de Roles y permisos no menciona ninguna restricción, y el sitio público es público: no hay nada que una especialista no pueda ver. **Dos caminos:** dejarlo y cerrar H-021 como "por diseño", o ocultarlo para Especialista — lo que **obliga a reescribir "La barra superior" y agregar una fila a la tabla de roles**.

**Sobre H-023, el `catch` importa tanto como ocultar el botón:** ocultarlo arregla el síntoma; el `catch` arregla la clase de bug —mutación sin manejo de error— que es la que hizo que el síntoma fuera indetectable.

---

## 7. HEREDADO — 21 casos que solo hay que volver a correr

### 7.1 Los 16 de nginx

Verifiqué el arreglo hoy 20:41 UTC: 1.049.000 bytes → 401, 5 MB → 401, 25 MiB → 401, y el endpoint de firma con 1,5 MB → 400. **Todo llega a la API.**

**No hace falta esperar al correo para probarlos.** El botón **Copiar Enlace** de la pestaña Documentos llama a `ReenviarTokenAsync`, que genera el token y **devuelve la URL en la respuesta HTTP**, copiándola al portapapeles. Resend no interviene.

| Orden | Casos | Nota |
|---|---|---|
| 1 | **PF-157**, PF-158 | Usar una imagen genuinamente grande (ver riesgo abajo) |
| 2 | **PF-126** | Copiar Enlace y abrirlo |
| 3 | PF-123 | Requiere servicio con consentimiento "Antes de la cita"; PF-120 ya está Aprobado |
| 4 | PF-130, 131, 132, 139 | Requieren PF-126 |
| 5 | PF-134, 135, 136, 137 | Escaneo y foto; ya no hay tope de 1 MiB |
| 6 | **PF-229**, PF-231 | Marcados *Bloqueado* por *"error de red al mandar una recomendación"*. El modal adjunta un **PDF** al endpoint `recomendaciones/cita/{id}/adjuntar`: cualquier PDF sobre 1 MiB daba 413 opaco. Misma causa |
| 7 | PF-128 | **Ojo:** hay que reabrir **el mismo** enlace con el que se firmó. Copiar Enlace de nuevo genera otro token e invalida el anterior, así que probaría otra cosa |
| 8 | PF-142 | Mirar qué identidad queda en el evento de firma (§8) |

**Riesgo nuevo en PF-157.** Con nginx destrabado, una imagen de 25 MB **llega por primera vez** a `FileService.RedimensionarAsync`, que la decodifica con ImageSharp. Un JPEG de ese tamaño puede ser de 100+ megapíxeles y **no hay ningún tope de píxeles configurado**. Hay mitigación parcial (`DecoderOptions.TargetSize` permite escalado durante el decode en JPEG), pero ese camino nunca se ejercitó. **Probá con una imagen grande de verdad y mirá la memoria del contenedor.** Si se cae, la corrección es fijar un límite de píxeles, no bajar el límite de bytes.

### 7.2 PF-223 — Ficha desde cita Confirmada

> *"No se puede agregar una ficha."*

`CrearFichaAsync` hoy acepta `Confirmada` **o** `Atendida`, y lanza `CITA_NO_HABILITADA` solo fuera de esos dos estados. Eso lo arregló el commit **`d117158` del 2026-09-20**, *"fix(documentos): permitir ficha en citas confirmadas y quitar el marcado de atendida"*. El hallazgo hermano H-020, del 19/09, ya figura como Corregido.

**HEREDADO**: la observación es anterior al arreglo. Re-ejecutar.

### 7.3 Los cuatro pendientes que no dependen de nada

Se pueden correr cuando quieras, sin precondiciones:

- **PF-129** Enlace expirado. `CalcularExpiracionToken` da el mayor entre "emisión + 1 día" y el fin del día de la cita: basta esperar, o adelantar `token_expira_en` en la base.
- **PF-133** La cita no se bloquea. `MaquinaEstadosCita` declara `Confirmada → Atendida` sin ninguna precondición sobre documentos.
- **PF-243** Cancelar cita bloquea sus documentos. `UpdateEstadoAsync` llama a `BloquearPorCitaCanceladaAsync(cita.Id, "Cita cancelada.")`.
- **PF-236** Kinesiología sin recomendación no pregunta nada.

---

## 8. PASA — 25 casos que solo hay que ejecutar

Están implementados. Los agrupo con el fundamento.

### Reportes (10)

El módulo existe con tres vistas —ventas, reservas y comisiones— y `ReporteController` está marcado `[Authorize(Policy = SoloAdministrador)]` a nivel de clase, más el filtro del sidebar y `RUTAS_SOLO_ADMINISTRADOR` en `proxy.ts`.

| Caso | Fundamento |
|---|---|
| PF-199 Acceso exclusivo del administrador | Triple defensa: política en backend, `proxy.ts`, filtro del sidebar |
| PF-200 a PF-207 | Cubiertos por las tres vistas del módulo |
| PF-208 Exportación | `reporte-ventas-view.tsx` tiene "Exportar CSV" con estado `descargando`. **Implementada de verdad**, a diferencia de PF-198 |
| PF-214 Reporte por profesional | `reporte-comisiones-view.tsx` + `GET /api/reportes/comisiones` |

**Salvedad:** PF-200 a PF-207 los doy por implementados por la existencia de las vistas, no por haber verificado cada indicador. Si alguno falla, será por un cálculo puntual, no por ausencia de la función.

### Documentos (12)

| Caso | Fundamento |
|---|---|
| PF-096 Paciente no accede a la ficha | Ya **Aprobado** |
| PF-128 Enlace de un solo uso | `BuscarPorTokenAsync` valida en orden: inexistente → `TOKEN_INVALIDO`; anulado/bloqueado/cerrado → `TOKEN_INVALIDO`; `TokenUsadoEn != null` o `Completado` → `TOKEN_YA_USADO`; vencido → `TOKEN_EXPIRADO` |
| PF-131 Estampa sólo con el trazo | `generarDocumentoFirmadoBase64` embebe únicamente el PNG del canvas. Fecha, hora, IP e identidad van a columnas del documento, nunca al PDF |
| PF-132 Copia congelada | `CuerpoCongelado` + `HuellaDocumento` al generar y al firmar — **para consentimientos**. Ver §9.1 |
| PF-137 Exclusión entre vías | Cubierto en ambos sentidos: `YA_FIRMADO_EN_LINEA` al subir escaneo sobre un firmado; `TOKEN_YA_USADO` al abrir el enlace de un cargado |
| PF-239 Vencimiento con nueva fórmula | `CalcularExpiracionToken` devuelve el **mayor** entre emisión+1d y fin del día de la cita: nunca queda en el pasado |
| PF-241, PF-242 Firmado digital vs. papel | El detalle distingue `FirmadoPacienteEn`, `FirmadoProfesionalEn` y `CargadoEnPapelEn`, con textos separados |
| PF-245, PF-246 Bloqueados siguen en el listado | Los estados `Bloqueado` y `CerradoPorBaja` están en `CATALOGO_ESTADOS_DOCUMENTO` con color propio y no se filtran del listado |
| PF-248 Auditoría nunca expone IP ni token | `CamposSensibles = { "TokenAcceso", "IpOrigen", "PasswordHash" }` en el interceptor, excluidos de `DescribirCambios` |
| PF-249, PF-250 Consentimiento reutilizado | `ListarPorCitaAsync` tiene la lógica de reutilización: marca `Reutilizado = true` y calcula `VigenteDesde`/`VigenteHasta` |
| PF-251 Adjuntos en Consentimiento y Recomendación | `SubirAdjuntoAsync` opera sobre `Documentos`, la tabla base de los tres tipos |
| PF-252 Menú sin contador | `sidebar.tsx:26` → `etiqueta: "Documentos"`, sin badge |
| PF-254 Cinco filtros en backend | `GetAllAsync` recibe `busqueda`, `tipo`, `estado`, `especialistaId`, `fechaDesde`/`fechaHasta` y pagina en el servidor |

### Notificaciones y plantillas (3)

- **PF-221**, **PF-222** — ver §2.
- **PF-228 Rechazo de tipo incorrecto a nivel de API** — `CrearFichaAsync` valida `plantilla.Tipo != FichaClinica` → `PLANTILLA_TIPO_INCOMPATIBLE`. **La validación está en el servicio, no en la interfaz**, que es justo lo que el caso quiere comprobar.

### PF-142 — Auditoría de documentos: pasa **con un matiz a verificar**

Creación, firma y carga las cubre `AuditingSaveChangesInterceptor` (audita altas y modificaciones de `FichaClinica`, `Consentimiento`, `Recomendacion`, `Adjunto` y `Plantilla`). Consulta la cubre `_trazaAcceso.RegistrarLecturaAsync`.

**El matiz:** la firma pública corre en un endpoint **anónimo**. `ResolverActor()` devuelve `(Sistema, null)` cuando no hay sujeto, así que el evento de firma queda **sin identidad** — y PF-142 exige "con identidad". Si se confirma al re-ejecutarlo, la corrección es barata: escribir un evento explícito con actor `Paciente` y el `PacienteId` del documento, que sí se conoce.

---

## 9. CASO — 6 casos donde el problema es el plan, no el sistema

| Caso | Estado | Qué pasa | Propuesta |
|---|---|---|---|
| **PF-154** Galería de instalaciones | Fallido | **No existe la sección y ninguno de los dos manuales la menciona.** Las diez secciones de `landing-config-schema.ts` (hero, reservas, about, process, vouchers, embarazadas, team, location, social, reviews) coinciden **exacta y ordenadamente** con las diez de §6.1. Buscar "instalacion" en todo el frontend solo encuentra dos textos de relleno | **Marcar No Aplica.** Si el cliente la quiere, es alcance nuevo y hay que sumar una sección 11 a §6.1 |
| **PF-149** (Aprobado) | — | Arrastra el mismo supuesto: *"aparece después de instalaciones y antes de ubicación"*. El orden real es Vouchers → Embarazadas → Especialistas → Ubicación | Corregir la redacción |
| **PF-119** Eliminación bloqueada | Aprobado | Pasó, pero *"Intentar eliminarlo"* **no es ejecutable**: no hay dónde. Y sí se ofrece desactivar (interruptor por fila) | Reescribir: *"Verificar que una plantilla con documentos no ofrece eliminación y sí desactivación"* |
| **PF-140** Recomendaciones al marcar atendida | Pendiente | El envío **no es automático**: marcar Atendida abre `EnviarRecomendacionModal` (`appointment-detail-modal.tsx:91-105`), un paso asistido. §1.3 del manual dice *"**habilita** el cierre operativo"*, consistente con lo implementado | Reescribir: *"el sistema ofrece el envío y, al confirmarlo, el paciente lo recibe"*. Ejecutar después de S-13 |
| **PF-244** Baja de especialista | Fallido | No es un fallo propio: es **PF-146**. Sin botón para dar de baja, nunca se dispara `CerrarPorBajaEspecialistaAsync` | Re-ejecutar después de S-10 |
| **PF-161, PF-185** | No aplica | Ya marcados por ustedes | Sin acción |

### 9.1 Un hueco de cobertura que hay que cubrir con un caso nuevo

**PF-117 (versionado) pasó, y no discuto el resultado**: para consentimientos el congelado funciona y está bien construido.

**Pero `CrearFichaAsync` no congela.** Guarda `Contenido`, `PlantillaId` (FK a la plantilla **viva**) y `EstructuraVersion = 1` hardcodeado. Y el detalle renderiza `etiquetaDeCampo(clave, plantilla?.cuerpo)` — de la plantilla actual. Entonces, sobre fichas ya cerradas:

- Renombrar un campo **relabela retroactivamente** todas las fichas anteriores.
- Eliminar un campo deja la respuesta huérfana, con su UUID crudo de etiqueta.
- Reordenar secciones reordena el historial clínico.

En un registro clínico eso es corrupción de datos. **El plan no tiene ningún caso que cubra este escenario sobre fichas.**

**Propongo dar de alta PF-257**, severidad Bloqueante: *"Registrar una ficha con una plantilla, editar esa plantilla renombrando y eliminando campos, y reabrir la ficha. Esperado: la ficha conserva las etiquetas con las que se registró."* Con el código de hoy, falla.

**S-08:** llamar a `CongelarPlantilla(plantilla)` —el helper ya existe— desde `CrearFichaAsync`, guardar `CuerpoCongelado` en la `FichaClinica`, exponerlo en el DTO y hacer que el frontend lo prefiera sobre la plantilla viva, dejándola como respaldo para las fichas históricas. **No migrar las existentes:** sería inventar historia.

> **Manual §4.5.2:** la Advertencia dice *"Los documentos ya **firmados** conservan el formato con el que se emitieron"*. Las fichas no se firman, así que la frase las excluye por omisión — técnicamente defendible, pero engañosa. Con el arreglo conviene reescribirla como *"los documentos ya **emitidos**"*.

---

## 10. Impacto en los dos manuales

### Manual de Usuario — Panel de Administración

| Sección | Motivo | Origen |
|---|---|---|
| **§4.5.3 Tipos de campo** | **Si se elige la opción A**, el tipo **Firma** desaparece y hay que sacar esa fila | S-19 |
| §4.4.2 Paso 2: Completar la ficha | Explicar qué ve la profesional y qué pasa con los campos del paciente | S-18 |
| §4.3 Detalle de un Documento | Agregar el aviso de privacidad | S-20 |
| §4.3 Detalle de un Documento | Agregar "Creada por" y "Fecha de creación" | S-04 |
| §4.3.1 Archivo y adjuntos | Nota: un documento cerrado no admite nuevos adjuntos | S-09 |
| §4.5.1 Catálogo de plantillas | Matizar: se elimina **mientras no tenga documentos** | S-22 |
| §4.5.2 Crear o editar | "documentos ya **firmados**" → "ya **emitidos**" | S-08 |
| §4.5.2 Crear o editar | El documento externo se sube en **PDF** | PF-115 |
| §5.5.1 Máquinas POS | Documentar desactivación y campos editables | S-21 |
| §3.3.2 Historial de Citas | Agregar el indicador de ficha | S-03 |
| **§3.3.3 Documentos del Paciente** | Agregar el estado a cada línea | S-23 |
| **§6.2 Especialistas — Precaución** | **Hoy está equivocada**: manda a revisar los servicios cuando la causa habitual es la plantilla horaria | S-11 |
| Solución de Problemas | Misma corrección; y precisar la fila de eliminar plantilla | S-11, S-22 |
| "La barra superior" + Roles y permisos | Solo si se oculta "Ir a la Web" al Especialista | H-021 opción b |
| "El menú lateral" | **Omisión ya existente**: lista 6 ítems y el menú real tiene 8 (faltan **Reportes** y **Mi Perfil**) | Propongo **H-028** |

### Manual del Sistema

| Sección | Motivo | Origen |
|---|---|---|
| §4.8 Inicio de Sesión del Paciente | Documentar la reconciliación por RUT | S-05 |
| §6.7.4 Resend | Requisito de dominio verificado y remitente oficial | S-13 |
| §3.3.3 Documentos Clínicos | Documentar el congelado también para fichas | S-08 |
| §6.4 y §7.4 | **Ninguno.** Ya decían lo correcto; el servidor ahora cumple | — |

### Dos discrepancias que no salen de ninguna prueba

1. **§5.6 Exportar el Listado** describe paso a paso la exportación de ventas, con la Nota *"respeta los filtros activos"*. **Hoy es un `alert()`.** Es la distancia más grande entre manual y sistema de todo el análisis. Propongo **H-029**.
2. **§6.3.1** promete que las imágenes admiten *"PNG, JPG, WEBP o SVG"*. `EsImagenValida` acepta **solo JPEG, PNG y WebP**: lee 12 bytes y compara esas tres firmas. Hay código muerto que delata la intención original —`RedimensionarAsync` empieza con una rama para SVG a la que **nunca se llega**, porque el validador corre antes—. O se acepta SVG de verdad (con el cuidado de que es XML y puede traer scripts, así que habría que sanitizarlo o servirlo con CSP), o se saca del manual. **Recomiendo lo segundo.** Propongo **H-030**.

---

## 11. Orden de ataque

1. **Correr las 21 filas HEREDADAS** (§7). No requieren código ni esperar al correo. Cambian la foto antes de tocar nada.
2. **S-13** — dominio verificado en Resend. No es código y cierra **7 casos de una**.
3. **Rotar la API key de Resend**, hoy en claro y versionada en `appsettings.json`, contra lo que declara §5.4 del Manual del Sistema. Propongo **H-031**.
4. **S-25** (PF-170) — un especialista agendando sobre otra es el agujero de permisos más serio. Una línea.
5. **Decidir S-19 (A o B).** Bloquea a S-17 y S-18, y es la única decisión que cambia un manual de forma estructural.
6. **S-18 + S-19 + S-17** juntas — el bloque de plantillas y fichas: PF-113, PF-114, PF-116/H-019.
7. **S-05** (PF-097) y **S-15/S-16** (H-025, H-022) — autenticación del paciente, críticos y entrelazados.
8. **S-08** (PF-117 en fichas) — el único con riesgo de corrupción de datos clínicos. Dar de alta PF-257.
9. **S-06** (PF-127) — fuga de descarga.
10. **S-04** (PF-095, 172, 174) — la identidad en las tres vistas, de una sola vez.
11. **S-24** (PF-198) — la exportación de ventas, que hoy es un `alert`.
12. **S-10** (PF-146 + PF-244), **S-11** (PF-147), **S-12** (PF-143 título del banner).
13. **S-20** (PF-107), **S-07** (PF-101), **S-09** (H-023), **S-03** (PF-092), **S-23** (PF-178).
14. **S-21** (H-026), **S-22** (H-027), **S-26** (PF-253).
15. **S-02** — validación de tamaño en el cliente, para que un 413 futuro no vuelva a decir "Error de red".
16. **Correcciones al plan**: PF-119, PF-140, PF-149, PF-154, PF-244, y alta de PF-257.

### Decisiones tomadas (2026-09-25)

Las nueve decisiones de diseño están cerradas. Quedan cuatro puntos administrativos.

| # | Decisión | Resuelto | Consecuencia |
|---|---|---|---|
| 1 | Firmas | **A — manda la plantilla** | Se elimina el tipo de campo `Firma`. Los interruptores dejan de depender de `tipoDocumento` y de `modo`. **→ quitar la fila "Firma" de §4.5.3** |
| 2 | Campos del paciente en la ficha | **c — editables, con distintivo** | La profesional puede llenarlos, pero ve de quién es cada campo. **→ actualizar §4.4.2** |
| 3 | POS | **c — desactivar + editar lo no contable** | `Activo` ya existe como columna y el DTO ya la expone: falta el `PATCH` y el interruptor. Comisiones, por versión. **→ actualizar §5.5.1** |
| 4 | Exportación de ventas | **b — en el backend** | Endpoint con los mismos filtros. Respeta §5.6, que hoy describe un `alert()` |
| 5 | Horario al crear especialista | **b2 — solo el aviso** | No se copia el horario del centro. Aviso "Sin horario cargado, configurar" en la tarjeta |
| 6 | "Ir a la Web" | **a — no ocultar** | **H-021 se cierra sin cambios de código.** El manual ya lo describe igual para todos los roles y no hay riesgo de seguridad. **→ ningún cambio de manual** |
| 7 | SVG | **b — sacarlo del manual** | **→ quitar SVG de §6.3.1.** El validador queda como está |
| 8 | Fuga de descarga (PF-127) | **a — mínimo** | Se reemplaza el `<embed>` por el canvas en modo lectura, y el archivo se sirve con `Content-Disposition: inline`. Sin token separado |
| 9 | Indicador de ficha | **a — solo el historial del paciente** | La Agenda queda fuera. **→ actualizar §3.3.2** |

**Nota sobre la decisión 3:** la advertencia que di inicialmente sobre el histórico contable era excesiva. Verificado en el modelo: `ComisionTerminal` ya está versionada con `VigenteDesde`/`VigenteHasta`, el listado muestra solo la vigente, y `Venta` no guarda la comisión sino que la calcula. El riesgo existe solo si se sobrescribe una fila de comisión en el lugar; el camino correcto ya está soportado.

### Pendiente de tu parte

| # | Qué | Bloquea |
|---|---|---|
| 10 | **PF-253**: cuál era exactamente la ruta anterior del módulo de documentos | S-26 |
| 11 | ¿Autorizás las correcciones al plan de pruebas? (PF-119, 140, 149, 154, 244 + alta de PF-257) | Cierre del plan |
| 12 | ¿Quién agrega H-028 a H-031 al Excel? | Registro de hallazgos |
| 13 | **PF-112**: ¿entra el ajuste de contraste de los placeholders? | — |

---

## 12. Índice caso por caso (los 76)

Para buscar cualquier caso puntual. **Marca** es mi veredicto tras verificar el código, no lo que dice el Excel.

### Ficha clínica y plantillas

| Caso | Sev | Excel | Marca | Causa / motivo | Acción |
|---|---|---|---|---|---|
| PF-092 Indicador de reservas con ficha | Mayor | Fallido | **REAL** | El asistente de ficha sí distingue; el Historial de Citas del paciente no | **S-03** — cruzar `useGetFichasPorPaciente` por `citaId`. Agenda queda fuera (dec. 9) |
| PF-095 Autor y fecha automáticos | Crítico | Fallido | **REAL** | El DTO no expone `CreatedAt` y `CreadoPorActorId` es un id sin nombre. Falta la fecha **y** el autor | **S-04** |
| PF-097 Vinculación por RUT | Crítico | Fallido | **REAL** | El frontend nunca manda el RUT en el login de Google → la rama de vinculación es código muerto → duplicado → choque en `PATCH /perfil` | **S-05** — reconciliar en `UpdatePerfilAsync` |
| PF-101 Exportación a PDF | Mayor | Fallido | **REAL** | Descargar está envuelto en `{doc.tieneArchivo && …}`; una ficha del constructor no tiene archivo. Imprimir cae en `window.print()` | **S-07** — reutilizar `generarPdfDesdeConstructor` |
| PF-107 Aviso de privacidad | Mayor | Fallido | **REAL** | El aviso existe solo en el paso 2 del asistente de creación, no en el detalle | **S-20** |
| PF-113 Quién completa cada campo | Crítico | Fallido | **REAL** | El asistente de ficha ignora `completadoPor`. Además `Firma` cae en el fallback y sale como caja de texto | **S-18** (dec. 2 = c) |
| PF-114 Recuadros de firma | Crítico | Fallido | **REAL** | Dos mecanismos superpuestos. En el consentimiento importado solo aparece un interruptor | **S-19** (dec. 1 = A) |
| PF-223 Creación desde cita Confirmada | Crítico | Fallido | **HEREDADO** | `CrearFichaAsync` ya acepta `Confirmada`. Lo arregló el commit `d117158` del 20/09 | Re-ejecutar |
| PF-228 Rechazo de tipo a nivel de API | Bloqueante | Pendiente | **PASA** | `CrearFichaAsync` valida y lanza `PLANTILLA_TIPO_INCOMPATIBLE` en el servicio, no en la interfaz | Ejecutar |

### Documentos y firma

| Caso | Sev | Excel | Marca | Causa / motivo | Acción |
|---|---|---|---|---|---|
| PF-123 Momento tras confirmar reserva | Bloqueante | Fallido | **HEREDADO** | **La lógica es correcta**: la cita web nace `PendientePago`, que no genera documentos; se generan tras el pago | Re-ejecutar con PF-120 montado |
| PF-125 Correo de respaldo con enlace | Crítico | Fallido | **REAL** | **C1** — dominio no verificado en Resend | **S-13** |
| PF-126 Firma del paciente | Bloqueante | Fallido | **HEREDADO** | Era nginx. Descarté 5 causas alternativas | Re-ejecutar con Copiar Enlace |
| PF-127 Paciente no puede descargar | Crítico | Fallido | **REAL** | `<embed>` abre el visor nativo con botón de descarga; y la URL del archivo es directa | **S-06** (dec. 8 = a) |
| PF-128 Enlace de un solo uso | Bloqueante | Pendiente | **PASA** | `BuscarPorTokenAsync` → `TOKEN_YA_USADO` | Ejecutar. **Ojo:** reabrir el mismo enlace, no copiar otro |
| PF-129 Enlace expirado | Bloqueante | Pendiente | **PASA** | `TOKEN_EXPIRADO`. **No depende de nada** | Ejecutar ya |
| PF-130 Firma del profesional posterior | Crítico | Pendiente | **HEREDADO** | Mismo `PdfSignatureCanvas`; lo frenaba el 1 MiB | Re-ejecutar |
| PF-131 Estampa sólo con el trazo | Mayor | Pendiente | **PASA** | Solo se embebe el PNG; fecha, hora e IP van a columnas | Ejecutar |
| PF-132 Copia congelada | Bloqueante | Pendiente | **PASA** | `CuerpoCongelado` + `HuellaDocumento` — **para consentimientos**. Ver PF-257 | Ejecutar |
| PF-133 La cita no se bloquea | Crítico | Pendiente | **PASA** | `Confirmada → Atendida` sin precondición de documentos. **No depende de nada** | Ejecutar ya |
| PF-134 Carga de documento en papel | Crítico | Pendiente | **HEREDADO** | Un escaneo supera 1 MiB casi siempre | Re-ejecutar |
| PF-135 Carga desde foto | Crítico | Pendiente | **HEREDADO** | Una foto de celular pesa 2–5 MB | Re-ejecutar |
| PF-136 Sin firma digital en escaneo | Mayor | Pendiente | **HEREDADO** | `SubirEscaneoAsync` deja el documento en `Completado` | Re-ejecutar |
| PF-137 Exclusión entre vías | Crítico | Pendiente | **PASA** | Cubierto en ambos sentidos: `YA_FIRMADO_EN_LINEA` y `TOKEN_YA_USADO` | Ejecutar |
| PF-139 Consulta previa a la atención | Crítico | Pendiente | **HEREDADO** | La pestaña está disponible en `Confirmada` | Re-ejecutar |
| PF-140 Recomendaciones al marcar atendida | Crítico | Pendiente | **CASO** | El envío **no es automático**: abre `EnviarRecomendacionModal`. §1.3 dice "habilita" | Reescribir el caso + **S-13** |
| PF-141 Reserva manual dispara el correo | Crítico | Pendiente | **PASA tras S-13** | Una cita manual nace `PorConfirmar`, que sí genera documentos | Ejecutar tras S-13 |
| PF-142 Auditoría de documentos | Crítico | Pendiente | **PASA con matiz** | Cubierto por el interceptor y `_trazaAcceso`. **Pero la firma pública es anónima** → el evento queda sin identidad | Ejecutar y mirar la identidad en el evento de firma |
| PF-239 Vencimiento con nueva fórmula | Bloqueante | Pendiente | **PASA** | `CalcularExpiracionToken` devuelve el mayor; nunca queda en el pasado | Ejecutar |
| PF-240 Reenvío por correo | Mayor | Pendiente | **REAL** | **C1** | **S-13** |
| PF-241 "cargado el…" nunca "firmado el…" | Mayor | Pendiente | **PASA** | El detalle distingue `FirmadoPacienteEn`, `FirmadoProfesionalEn` y `CargadoEnPapelEn` | Ejecutar |
| PF-242 Firmado digital vs. papel | Mayor | Pendiente | **PASA** | Ídem | Ejecutar |
| PF-243 Cancelar cita bloquea documentos | Crítico | Pendiente | **PASA** | `BloquearPorCitaCanceladaAsync`. **No depende de nada** | Ejecutar ya |
| PF-244 Baja de especialista cierra documentos | Crítico | Fallido | **CASO** | **No es un fallo propio: es PF-146.** Sin botón de baja, nunca se dispara `CerrarPorBajaEspecialistaAsync` | Re-ejecutar tras **S-10** |
| PF-245 Bloqueados siguen en el listado | Crítico | Pendiente | **PASA** | Los estados están en el catálogo y no se filtran | Ejecutar |
| PF-246 Cerrado por baja no se confunde con firmado | Bloqueante | Pendiente | **PASA** | Estados con color propio | Ejecutar |
| PF-247 "Ver auditoría" separado de "ver firma" | Mayor | Pendiente | **PASA** | Son dos bloques distintos: el toggle "Ver la Auditoría del Documento" y el bloque "Firma" | Ejecutar |
| PF-248 Auditoría nunca expone IP ni token | Bloqueante | Pendiente | **PASA** | `CamposSensibles = { TokenAcceso, IpOrigen, PasswordHash }` excluidos de `DescribirCambios` | Ejecutar |
| PF-249 Consentimiento reutilizado una sola vez | Mayor | Pendiente | **PASA** | `ListarPorCitaAsync` marca `Reutilizado` y calcula vigencia | Ejecutar |
| PF-250 Cobertura visible en cada cita | Mayor | Pendiente | **PASA** | Ídem | Ejecutar |
| PF-251 Adjuntos en Consentimiento y Recomendación | Mayor | Pendiente | **PASA** | `SubirAdjuntoAsync` opera sobre `Documentos`, la tabla base | Ejecutar |
| PF-252 Menú sin contador | Menor | Pendiente | **PASA** | `sidebar.tsx:26` → `etiqueta: "Documentos"`, sin badge | Ejecutar |
| PF-253 Redirección desde la ruta vieja | Mayor | Pendiente | **REAL** | La única redirección es `/panel` → `/panel/agenda` | **S-26** — falta el dato de cuál era la ruta |
| PF-254 Cinco filtros en backend | Crítico | Pendiente | **PASA** | `GetAllAsync` recibe los cinco y pagina en el servidor | Ejecutar |

### Recomendaciones

| Caso | Sev | Excel | Marca | Causa / motivo | Acción |
|---|---|---|---|---|---|
| PF-229 Pregunta obligatoria al marcar atendida | Crítico | Bloqueado | **HEREDADO** | *"Error de red al mandar una recomendación"*: el modal adjunta un **PDF**; sobre 1 MiB daba 413 opaco | Re-ejecutar |
| PF-231 Recomendación estándar del servicio | Crítico | Bloqueado | **HEREDADO** | Bloqueado por PF-229 | Re-ejecutar |
| PF-235 Ambas variantes en el listado | Mayor | Pendiente | **PASA** | Las dos vías crean filas `Recomendacion`; el listado muestra tipo y fecha | Ejecutar tras PF-229 |
| PF-236 Kinesiología sin recomendación no pregunta | Mayor | Pendiente | **PASA** | **No depende de nada** | Ejecutar ya |

### Notificaciones

| Caso | Sev | Excel | Marca | Causa / motivo | Acción |
|---|---|---|---|---|---|
| PF-216 Correo de confirmación | Crítico | Fallido | **REAL** | **C1** | **S-13** |
| PF-217 Correo de documentos | Crítico | Fallido | **REAL** | **C1** | **S-13** |
| PF-218 Correo de recordatorio | Mayor | Fallido | **REAL** | **C1** | **S-13** |
| PF-219 Correo post atención | Crítico | Fallido | **REAL** | **C1** | **S-13** |
| PF-220 Nota del paciente en el correo | Crítico | Fallido | **REAL** | **C1**. `Redactar` ya separa `NotaPaciente` de `NotaInterna` | **S-13** |
| PF-221 Registro de envíos | Mayor | Fallido | **PASA** | `notificaciones` guarda tipo, destinatario, estado, intentos y `detalle_fallo` | Ejecutar |
| PF-222 Reintento ante fallo | Crítico | Fallido | **PASA** | `MaxIntentos = 5` con espera creciente y reclamo atómico. **Hoy se está demostrando solo** | Ejecutar |

### Agenda, reserva manual y auditoría de citas

| Caso | Sev | Excel | Marca | Causa / motivo | Acción |
|---|---|---|---|---|---|
| PF-170 Especialista agenda sólo su agenda | Crítico | Fallido | **CASO** | **Corregido el 25/09: es por diseño, no un fallo.** Tres fuentes coinciden — ver §13 | Reescribir el caso. **S-25 descartada** |
| PF-172 Auditoría de la cita manual | Mayor | Fallido | **REAL** | **C2** — `AuditoriaCitaResponseDTO` tiene `UsuarioId` pero no nombre; la UI solo pinta `tipoActor` | **S-04** |
| PF-174 Auditoría del origen | Mayor | Fallido | **REAL** | **C2** | **S-04** |

### Pacientes

| Caso | Sev | Excel | Marca | Causa / motivo | Acción |
|---|---|---|---|---|---|
| PF-178 Estado de documentos | Mayor | Pendiente | **REAL** | La pestaña muestra nombre, tipo y fecha. **El estado no** | **S-23** — badge con `CATALOGO_ESTADOS_DOCUMENTO` |

### Configuración del sitio

| Caso | Sev | Excel | Marca | Causa / motivo | Acción |
|---|---|---|---|---|---|
| PF-146 Desactivación de integrante | Crítico | Fallido | **REAL** | Endpoint, servicio y hook **existen**; nadie los consume. El modal de borrado recomienda "Desactivarlo", que no existe | **S-10** |
| PF-147 Servicios habilitados por integrante | Crítico | Fallido | **REAL** | No es por servicios: sin plantilla horaria no hay bloques, y sin bloques no aparece en el paso 3 | **S-11** (dec. 5 = b2) |
| PF-154 Galería de instalaciones | Mayor | Fallido | **CASO** | **No existe ni la mencionan los manuales.** Las 10 secciones del código coinciden con las 10 de §6.1 | Marcar **No Aplica** |
| PF-157 Carga de imagen pesada | Crítico | Fallido | **HEREDADO** | Era nginx | Re-ejecutar con imagen grande, **vigilando memoria** |
| PF-161 Auditoría de contenido | Mayor | No aplica | — | Ya marcado por ustedes | Sin acción |

### Ventas y reportes

| Caso | Sev | Excel | Marca | Causa / motivo | Acción |
|---|---|---|---|---|---|
| PF-185 Notas del terminal | Mayor | No aplica | — | Ya marcado por ustedes | Sin acción |
| PF-198 Exportación a hoja de cálculo | Mayor | Fallido | **REAL** | **Es un stub**: `handleExportar()` solo hace `alert(…)`. §5.6 la documenta paso a paso | **S-24** (dec. 4 = b) |
| PF-199 Acceso exclusivo del administrador | Bloqueante | Pendiente | **PASA** | Triple defensa: `SoloAdministrador` en el controlador, `proxy.ts` y filtro del sidebar | Ejecutar |
| PF-200 a PF-207 (8 casos) | Mayor | Pendiente | **PASA** | Cubiertos por las tres vistas del módulo Reportes | Ejecutar. *Salvedad: los doy por implementados por la existencia de las vistas, no por haber verificado cada indicador* |
| PF-208 Exportación | Mayor | Pendiente | **PASA** | `reporte-ventas-view.tsx` tiene "Exportar CSV" con estado `descargando`. **Implementada de verdad**, a diferencia de PF-198 | Ejecutar |
| PF-214 Reporte por profesional | Crítico | Pendiente | **PASA** | `reporte-comisiones-view.tsx` + `GET /api/reportes/comisiones` | Ejecutar |

### Alta propuesta

| Caso | Sev | Motivo |
|---|---|---|
| **PF-257** Ficha conserva su formato de origen | Bloqueante | `CrearFichaAsync` no congela el cuerpo. Renombrar un campo **relabela retroactivamente fichas cerradas**. Ningún caso cubre esto hoy → **S-08** |

---

## 13. Corrección: PF-170 no es un fallo (2026-09-25)

En §6.2 clasifiqué PF-170 como REAL y propuse S-25: agregar `_especialistaAccessGuard.VerificarAcceso` en `CreateManualAsync`. **Estaba equivocado.** Al ir a implementarlo encontré que el comportamiento actual es deliberado y está documentado. Tres fuentes independientes coinciden:

**1. El test lo declara en su propio nombre.** `api-dotnet.Tests/AgendaPanelTests.cs:124`:

```csharp
public async Task UnaEspecialista_VeYAgendaLaAgendaDeOtra_PeroNoLeCambiaElEstado()
```

Y en el cuerpo, con el token de una especialista sobre la agenda de otra:

```csharp
var agendarParaOtra = await SendAuthorizedAsync(HttpMethod.Post, "/api/citas/manual", franchesca.Token, new { … especialistaId = valeria.Id … });
Assert.Equal(HttpStatusCode.Created, agendarParaOtra.StatusCode);   // agendar: PERMITIDO

var cambiarEstadoAjena = await SendAuthorizedAsync(HttpMethod.Patch, $"/api/citas/{citaDeValeria.CitaId}/estado", franchesca.Token, …);
Assert.Equal(HttpStatusCode.Forbidden, cambiarEstadoAjena.StatusCode);   // cambiar estado: PROHIBIDO
```

**2. El manual traza la misma línea.** Su tabla de Roles y permisos distingue exactamente esos dos casos:

| Módulo o acción | Administrador | Especialista |
|---|---|---|
| Agenda: cambiar el estado de una cita propia | Sí | Sí |
| Agenda: cambiar el estado de una cita de otra profesional | Sí | **No** |
| **Nueva Reserva** | Sí | **Sí** (sin restricción de agenda) |

**3. El código es coherente con las dos.** En `CitaService` el guard se invoca una sola vez y está donde corresponde: en `UpdateEstadoAsync`. Su ausencia en `CreateManualAsync` no es un olvido.

**Por qué tiene sentido:** en un centro chico, quien contesta el teléfono toma la reserva, sin importar quién vaya a atender. Exigir que cada reserva la cree la profesional que atiende, o el administrador, dejaría el agendamiento telefónico dependiendo de que esté la persona correcta.

**Qué hacer:** reescribir PF-170. El criterio verificable no es "la acción se rechaza", sino la separación que el manual ya define: *"Una especialista puede crear una reserva en la agenda de otra, pero no puede cambiar el estado de una cita ajena"*. La segunda mitad ya está cubierta y pasa.

**Dónde falló mi análisis:** tomé la redacción del caso de prueba como la especificación y busqué en el código la validación que faltaba. No verifiqué si el sistema tenía una posición deliberada y documentada al respecto. Con el test y el manual en la mano, el que estaba equivocado era el caso de prueba.

### Línea base de los tests (con Docker arriba)

```
Superado: 213, Con error: 2, Total: 215
```

Los dos fallos son **preexistentes**, sin relación con nada de este análisis:

- `FlujoReservaWebTests.ReservaConElOrdenNuevo_ServicioFechaHorarioEspecialista_TerminaEnCitaPendientePagoConBloqueOcupado`
- `PacientesAdminTests.DesactivarPaciente_QuedaInactivoYaNoAparece_EnElListadoDeSoloActivos`

Ninguno de los dos corresponde a un caso del plan de pruebas. **Conviene mirarlos**: son dos comportamientos que el equipo consideró lo bastante importantes para cubrir con un test, y hoy están rotos sin que ninguna PF lo refleje. El segundo además toca el patrón de desactivación que vamos a usar en S-10 y S-21.

---

## 14. Pasada de contraste contra la suite de tests (2026-09-25)

Después del error en PF-170, contrasté las soluciones restantes contra los **136 tests** del backend. La suite es, en la práctica, una segunda especificación: lo que un test afirma es comportamiento decidido, no accidental.

### 14.1 Una solución cambia por completo: S-05 (PF-097)

**La vinculación por RUT ya funciona en el backend, y hay un test que lo prueba.** `FlujoReservaWebTests.cs:156`:

```csharp
public async Task LoginGoogle_ConRutDeUnPacienteExistente_VinculaLaCuentaEnVezDeDuplicarAlPaciente()
{
    var rut = GenerarRutValido();
    await SendAuthorizedAsync(HttpMethod.Patch, "/api/auth/perfil", primerLogin.Token, new { rut, telefono = "+56911112222" });

    var segundoLoginResponse = await _client.PostAsJsonAsync("/api/auth/google",
        new { idToken = segundaIdentidad.ToIdToken(), rut, consentimientoAceptado = true });

    Assert.Equal(primerLogin.Paciente.Id, segundoLogin.Paciente.Id);   // mismo paciente, no un duplicado
}
```

Ese test **pasa**. Y hay un segundo, `CrearPacienteManual_SinCuentaDeGoogle_LuegoIniciaSesionConGoogleUsandoElMismoRut_VinculaElRegistroExistente`, que cubre exactamente el escenario de PF-097 y también pasa.

La diferencia con lo que ocurre en producción está en una sola línea: el test manda `rut` en el cuerpo del login, y **el frontend no**. `GoogleLoginRequestDTO` lo declara opcional y documentado:

```csharp
/// <summary>Si ya se conoce, evita duplicar al paciente bajo dos cuentas de Google</summary>
public string? Rut { get; set; }
```

**Entonces S-05 ya no es lo que propuse.** Descarto la reconciliación con fusión de registros en `UpdatePerfilAsync`: era backend, compleja, y tocaba borrar filas de pacientes. La corrección real es de frontend y consiste en **mandar el RUT que el formulario ya tiene**.

**S-05 revisada:**

1. En `auth-service.ts`, `loginWithGoogleToken` pasa a aceptar el RUT y lo incluye en el cuerpo.
2. En `booking-card.tsx`, el callback de Google lee el RUT con un `ref`, igual que ya hace con `consentimientoRef.current`.
3. **Y acá está el punto fino:** hoy el botón de Google está arriba del campo RUT, así que en el orden natural de lectura el paciente inicia sesión *antes* de escribirlo. Si no hay RUT, seguimos con el duplicado. La forma robusta es **condicionar el botón de Google a que el RUT sea válido, con el mismo mecanismo con el que ya está condicionado a la casilla de privacidad** (`opacity-40 pointer-events-none`). Así el RUT existe siempre que Google se dispare.

Ventaja lateral: eso también cierra la mitad de **H-022**, porque el perfil ya no puede quedar incompleto en el momento del login.

### 14.2 Cinco casos suben de "predicción" a "certeza"

Estos ya tienen test propio y **pasa**, así que no hay que verificarlos a mano:

| Caso | Test que lo cubre |
|---|---|
| PF-096 Paciente no accede a la ficha | `TokenDePaciente_Recibe403EnTodosLosEndpointsDeFicha_IncluidaLaDescargaDeAdjuntos` |
| PF-105 Validación por contenido real | `UnArchivoQueDiceSerPdfPeroNoLoEs_SeRechaza` |
| PF-128 Enlace de un solo uso | `TokenYaUsado_RechazaUnSegundoIntento` |
| PF-129 Enlace expirado | `TokenExpirado_SeRechaza` |
| PF-222 Reintento ante fallo | `UnaFallaTransitoria_ReintentaConEsperaCreciente_YSoloFallaAlAgotarLosIntentos` + `UnaFallaTransitoria_NoSeReintentaDeInmediato_RespetaLaEsperaCreciente` |

### 14.3 Tres diagnósticos quedan confirmados por tests que pasan

- **C1 (el correo)** — `ElProcesoEnSegundoPlano_EnviaLaNotificacionPendiente_YLaMarcaEnviada`, `ConfirmarUnaCita_EncolaUnaNotificacionDeConfirmacionPendiente` y `LaNotaDirigidaAlPaciente_SeIncorporaAlCorreoDeConfirmacion` pasan. **El pipeline de correo funciona.** Confirma que los 7 casos de C1 son exclusivamente el dominio no verificado en Resend, y que no hay nada que corregir en el código.
- **S-10 (PF-146)** — `DesactivarUnEspecialistaConCitasVigentes_Advierte_PeroNoBloquea` pasa. Confirma que la desactivación es puro cableado de frontend.
- **S-11 (PF-147)** — `EspecialistaConPlantillaAcotada_SoloTieneBloquesDentroDeSuHorario`, `ConsultarUnaHoraFueraDelHorarioDeConstanza_NoLaDevuelveEntreLosEspecialistas` y `NingunServicioActivo_QuedaSinEspecialistaHabilitada` confirman que la causa es el horario y no los servicios.

### 14.4 Tres restricciones que las soluciones nuevas deben respetar

- **S-24 (PF-198, exportar ventas):** ya existe `ExportarVentasACsv_UsaFormatoChilenoYNeutralizaInyeccionDeFormulas`. O sea, el proyecto **ya tiene** un camino de exportación con formato chileno y neutralización de inyección de fórmulas en CSV. La exportación de Ventas debe reutilizar ese camino, no escribir un CSV nuevo — o duplicaríamos el criterio y perderíamos la protección.
- **S-21 (H-026, POS):** `LaConfiguracionDeTerminalesYRepartos_EsExclusivaDelAdministrador`. Los endpoints nuevos van con `SoloAdministrador`.
- **S-22 (H-027, borrar plantillas):** `UnaEspecialista_PuedeLeerPeroNoEscribirPlantillaNiBloqueDeOtra`. El `DELETE` tiene que respetar ese alcance.

### 14.5 Falsa alarma revisada

`CrearFicha_SobreUnaCitaQueNoEstaAtendida_SeRechaza` parecía contradecir el commit `d117158`, que permitió fichas en citas Confirmadas. No lo hace: el test usa una cita en **`PorConfirmar`**, que se rechaza con razón. El nombre del test es lo confuso. **PF-223 sigue siendo HEREDADO.**

### 14.6 Dos tests rotos que ninguna PF cubre

```
FlujoReservaWebTests.ReservaConElOrdenNuevo_ServicioFechaHorarioEspecialista_TerminaEnCitaPendientePagoConBloqueOcupado
PacientesAdminTests.DesactivarPaciente_QuedaInactivoYaNoAparece_EnElListadoDeSoloActivos
```

Son los 2 fallos de la línea base. **No corresponden a ningún caso del plan de pruebas**, y son dos comportamientos que el equipo consideró lo bastante importantes para cubrirlos con un test. El primero toca el flujo de reserva web completo; el segundo, el patrón de desactivación que vamos a usar en S-10 y S-21. Conviene mirarlos antes de apoyarnos en ese patrón.

---

## 15. Trabajo ejecutado — los 2 tests rotos (2026-09-25)

**Resultado: 215/215 tests pasan.** Antes: 213/215.

### 15.1 `DesactivarPaciente_QuedaInactivoYaNoAparece_EnElListadoDeSoloActivos` — test desactualizado

**No era un fallo del producto.** El `PATCH /api/pacientes/{id}/estado` devolvía 200 correctamente; el test reventaba una línea después, al deserializar el listado.

Causa: `GET /api/pacientes` pasó a devolver `PacientesPaginadosDTO` (`{ total, page, pageSize, items }`) y el test seguía deserializando a `List<PacienteAdminDTO>`. Nadie lo actualizó cuando se agregó la paginación — de hecho **ningún test usaba `PacientesPaginadosDTO` todavía**.

Cambio en `api-dotnet.Tests/PacientesAdminTests.cs`:

```csharp
var busqueda = $"busqueda={Uri.EscapeDataString(paciente.Email)}";

var listadoActivos = await GetWithApiKeyAsync<PacientesPaginadosDTO>($"/api/pacientes?soloActivos=true&{busqueda}");
Assert.DoesNotContain(listadoActivos.Items, p => p.Id == paciente.Id);

var listadoInactivos = await GetWithApiKeyAsync<PacientesPaginadosDTO>($"/api/pacientes?soloActivos=false&{busqueda}");
Assert.Contains(listadoInactivos.Items, p => p.Id == paciente.Id && !p.Activo);
```

**Por qué agregué `busqueda` y no solo cambié el tipo:** `PaginacionParams.TamanoMaximo` es 50, así que no se puede pedir "todo". Sin acotar, el `DoesNotContain` pasaría de forma vacía en cuanto la base tenga más de una página de pacientes — daría verde sin probar nada. Acotando por el correo, que es único en el test, la ausencia es real. Es el mismo cuidado que ya tiene `PerfilDelPaciente_LosContadoresCoincidenConElTotal_NoConLaPagina`.

### 15.2 `ReservaConElOrdenNuevo_...` — sí era un fallo del producto

El test fallaba en `Assert.Equal(HttpStatusCode.Created, citaResponse.StatusCode)`. **Y era flaky por hora del día**: pasaba si se corría antes de la primera hora agendable, fallaba después.

**Confirmado en vivo** contra `api-test`, con Chile a las 23:06 del 25/09:

```
GET /api/disponibilidad/horas?servicioId=3&fecha=2026-09-25&duracionMinutos=30
  -> 20 horas, empezando en '10:00'          (pasaron hace 13 horas)

GET /api/disponibilidad/especialistas?...&horaInicio=10:00&...
  -> 2 especialistas ofrecidos para un bloque que ya pasó
```

**La causa raíz es una divergencia entre dos endpoints:** el que **ofrece** disponibilidad no aplicaba la regla de "el bloque ya pasó", y el que **acepta** la reserva sí. `CitaService.ValidarBloqueNoPasado` la tenía; `DisponibilidadService` no. Resultado: la API anuncia horarios que ella misma va a rechazar.

Y es un problema real, no solo de tests. El frontend lo tapa con un filtro propio en `booking-card.tsx`:

```tsx
const horasVigentes = esFechaHoy ? horasDisponibles.filter(h => h > horaActualHHMM) : horasDisponibles;
```

Ese parche existe **porque** el backend no filtraba. Y conecta con **H-002** del plan de hallazgos —*"permite el ingreso de una hora que ya no está disponible"*—, marcado como **Corregido**: se corrigió en el frontend, no en el backend. Cualquier otro consumidor de la API (o el propio frontend si el filtro se toca) vuelve a exponer el bug.

**La corrección: una sola definición de la regla, compartida.** En `ChileTimeZone`:

```csharp
public static bool YaPaso(DateOnly fecha, TimeOnly hora) =>
    AUtc(fecha, hora) <= DateTime.UtcNow;
```

`CitaService.ValidarBloqueNoPasado` pasa a usarla, y `DisponibilidadService` la aplica en sus tres métodos (`GetFechasDisponiblesAsync`, `GetHorasDisponiblesAsync`, `GetEspecialistasDisponiblesAsync`):

```csharp
.Where(b => !ChileTimeZone.YaPaso(b.Fecha, b.HoraInicio))
```

**Por qué en `ChileTimeZone` y no duplicando el `if`:** el defecto no fue que faltara una validación, fue que **había dos lugares que debían coincidir y solo uno tenía la regla**. Copiar la condición reproduce el problema en cuanto alguien toque una de las dos. Con una sola definición no pueden divergir. Y va en `ChileTimeZone` porque la regla depende del huso horario, que es justo lo que esa clase encapsula.

**Pendiente derivado (no lo toqué):** el filtro de `booking-card.tsx` quedó redundante. Es inofensivo, así que lo dejo hasta que confirmemos el arreglo en el entorno de pruebas; sacarlo antes sería quedarnos sin red.

**Sugerencia de plan de pruebas:** esto no lo cubre ningún caso. Propongo **PF-258**: *"Consultar la disponibilidad de hoy después de la primera hora agendable. Esperado: no se ofrecen horas ya pasadas."*

---

## 16. Trabajo ejecutado — S-04 y S-05 (2026-09-25)

### 16.1 S-04 — La identidad del actor (PF-095, PF-172, PF-174)

Tres casos, un solo cambio conceptual: el sistema guardaba **quién** hizo cada cosa como un id, y ninguna respuesta lo resolvía a un nombre.

**El patrón ya existía en el proyecto.** `AuditoriaEventoResponseDTO` ya tenía `UsuarioNombre`, poblado con `e.Usuario?.Nombre`. Lo apliqué igual a `AuditoriaCita`, que tiene la navegación `Usuario` y nadie la usaba.

Archivos:

| Archivo | Cambio |
|---|---|
| `AuditoriaCitaResponseDTO.cs` | `+ UsuarioNombre`, `+ ConfirmadoPor` |
| `AuditoriaService.cs` | Poblar ambos desde `a.Usuario?.Nombre` y `a.ConfirmadoPor` |
| `AuditoriaCitaRepository.cs` | `.Include(a => a.Usuario)` |
| `DocumentoDetalleResponseDTO.cs` | `+ CreadoPorNombre`, `+ CreatedAt` |
| `DocumentoService.cs` | Resolver el nombre por proyección en `ObtenerDetalleAsync` |
| `models/responses/auditoria.ts` | `usuarioNombre`, `confirmadoPor` |
| `models/responses/documento.ts` | `creadoPorNombre`, `createdAt` |
| `audit-trail.tsx` | Mostrar nombre y medio de confirmación |
| `documento-detalle-modal.tsx` | "Origen" → "Creada por" + "Fecha de Creación" |

**El `Include` era imprescindible y fácil de olvidar.** Sin él, `a.Usuario?.Nombre` devuelve `null` siempre y el arreglo se ve como si no funcionara, sin ningún error.

**En `Documento` fue distinto, a propósito.** `CreadoPorActorId` **no tiene** navegación, a diferencia de `CerradaPorUsuario` que sí. No es un olvido del modelo: el actor puede ser Personal, Paciente o Sistema, así que una FK a `UsuarioPersonal` no sería válida en los tres casos y EF no compilaría un `Include`. Por eso va por proyección, condicionada al tipo de actor — el mismo criterio que `SubirAdjuntoAsync` ya usa para `SubidoPorNombre`:

```csharp
var creadoPorNombre =
    documento.CreadoPorTipoActor == TipoActorAuditoria.Personal
    && documento.CreadoPorActorId != null
        ? await _context.UsuariosPersonal.Where(u => u.Id == documento.CreadoPorActorId)
            .Select(u => u.Nombre).FirstOrDefaultAsync()
        : null;
```

**PF-174 pedía algo más, y un test con nombre engañoso casi me hizo darlo por cubierto.** El caso pide *"el origen queda junto a la identidad de quien confirmó"*: ese origen es `ConfirmadoPor` (Profesional / Correo / WhatsApp). El dato **se guardaba** —el interceptor lo escribe— pero el DTO no lo exponía. Existe un test llamado `ConfirmarManualmente_RegistraConfirmadoPor_VisibleEnElDetalleY**EnLaAuditoria**`, pero solo verifica `detalle.ConfirmadoPor`, del detalle de la cita: **la parte de la auditoría no está testeada**. El historial ahora muestra, por ejemplo, *"Franchesca Soto (Personal), confirmada por WhatsApp"*.

### 16.2 S-05 — Vinculación por RUT (PF-097)

**Corrección de rumbo importante.** En §6.3 había propuesto reconciliar en `UpdatePerfilAsync`, con fusión y **borrado de filas de pacientes**. Eso queda descartado: la pasada de contraste (§14.1) mostró que **el backend ya resuelve esto y tiene dos tests que pasan**. El bug era que el frontend nunca mandaba el RUT, así que esa rama era código muerto en producción.

Cambio, solo frontend:

| Archivo | Cambio |
|---|---|
| `auth-service.ts` | `loginWithGoogleToken` acepta y envía `rut` |
| `use-auth-service.ts` | La mutación acepta `rut` |
| `booking-card.tsx` | `rutRef` para leerlo desde el callback; gating del botón; guards con mensaje |

`limpiarRut` del frontend es **idéntico** a `RutHelper.Clean` del backend (mismos reemplazos, trim y mayúsculas), así que mandar el RUT ya limpio es consistente y el backend lo re-limpia sin efecto.

**El gating era la parte no obvia.** El botón de Google está **arriba** del campo RUT en el paso 4, así que en el orden natural de lectura el paciente inicia sesión antes de escribirlo — y sin RUT el bug sigue igual. Lo condicioné con el mismo mecanismo con el que ya estaba condicionado a la casilla de privacidad:

```tsx
const puedeIniciarSesion = consentimientoAceptado && rutEsValido;
```

Y reemplacé el `return` mudo del callback por dos guards con mensaje, que era el mismo antipatrón de H-025.

**Mejora de UX que NO hice:** mover el bloque de Google debajo del campo RUT sería más claro que pedirle al usuario que complete algo "más abajo". No lo toqué porque es la disposición del sitio público, que es territorio de Jhoan. Queda como sugerencia.

### 16.3 Decisión de diseño tomada sobre la vinculación

Al explicar cómo funciona la vinculación surgió una pregunta que vale registrar, porque la respuesta es una decisión consciente y no un descuido.

El orden de resolución es: `GoogleSub` → **RUT** → correo → crear nuevo. En el paso del RUT, si el paciente encontrado **ya tiene otra cuenta de Google asociada**, el sistema **sobreescribe** el `GoogleSub`: no bloquea, transfiere. Está deliberado, el comentario del código lo explica —*"El RUT es la identidad real del paciente en Chile... el Google es solo el método de acceso"*— y el test lo consagra citando **RF-NRV-038**, con el caso de uso "cambió de correo".

**Consecuencia aceptada:** el RUT pasa a operar como credencial. Quien conozca un RUT puede atarse ese paciente a su propia cuenta de Google. Hasta ahora eso **no era alcanzable desde el sitio**, precisamente porque el RUT no se enviaba; con este cambio lo es.

Alcance del riesgo, verificado endpoint por endpoint. Un token de paciente alcanza cuatro cosas:

| Endpoint | Permite |
|---|---|
| `GET /api/citas/mias` | Ver sus citas: servicio, fecha, profesional |
| `PATCH /api/auth/perfil` | Cambiar RUT, teléfono y convenio |
| `POST /api/citas` | Reservar a su nombre |
| `POST /api/transacciones/iniciar` | Iniciar un pago |

**No alcanza documentos clínicos** — PF-096 lo confirma con test. Y no hay bloqueo permanente: el dueño vuelve a entrar y el `GoogleSub` se sobreescribe de vuelta.

Se le planteó a Maxi la alternativa de vincular **solo fichas sin `GoogleSub`** (no reclamadas) y rechazar el resto. **Decisión del 25/09: dejarlo como está diseñado**, respetando RF-NRV-038 y sin tocar el test.

### 16.4 Verificación

```
dotnet build     -> 0 errores
dotnet test      -> 215/215
npx tsc --noEmit -> 0
npx eslint       -> 0
```

**Lo que no pude verificar:** el flujo de Google en un navegador real. El intercambio con Google Identity necesita el cliente OAuth y una cuenta, así que la correctitud del envío del RUT queda respaldada por los tipos y por los dos tests de backend que ya cubren la rama, no por una ejecución de punta a punta. **Conviene que PF-097 se re-ejecute a mano.**

---

## 17. Trabajo ejecutado — S-15 y S-16 (2026-09-25)

### 17.1 Una regresión que introdujo S-05, cazada antes de seguir

Al abrir el archivo para S-15 revisé qué hacía el callback después del login y encontré un problema **creado por mi propio cambio anterior**:

```tsx
setPatientInfo({
  ...
  phone: result.data.paciente.telefono || "",
  rut: result.data.paciente.rut || "",     // <-- borra lo que el usuario escribió
});
```

Para un paciente **nuevo**, `LoginGoogleAsync` crea el registro con `Rut = null` a propósito —*"Inicia nulo para evitar violar la restricción UNIQUE"*—, así que la respuesta trae `rut: null` y esa línea lo reemplaza por `""`.

Antes de S-05 eso era inofensivo: el RUT se escribía **después** del login. Con el gating nuevo se escribe **antes**, así que el login le borraba al usuario el RUT que acababa de tipear, dejándole el botón de reservar deshabilitado sin explicación.

**Corregido** conservando lo escrito cuando el servidor no trae nada:

```tsx
const escrito = useBookingStore.getState();
...
phone: result.data.paciente.telefono || escrito.patientPhone,
rut: result.data.paciente.rut || escrito.patientRut,
```

**Por qué `getState()` y no otro `ref`:** el callback se registra una sola vez (`useEffect` con `[]`), así que cualquier variable del render queda congelada en su valor inicial — ese es el motivo por el que existía `consentimientoRef`. `useBookingStore` es Zustand, y `getState()` lee el valor actual sin necesidad de mantener refs sincronizados. Aproveché para **eliminar el `rutRef` que había agregado**: una pieza menos que mantener en sincronía.

### 17.2 S-15 — El botón que no hacía nada (H-025)

El `disabled` del botón validaba nombre, correo, teléfono y RUT **pero no `authToken`**, así que quedaba habilitado sin sesión. Y `handleFormSubmit` empezaba con un `if (...) return;` que abarcaba once condiciones y **no decía nada**. De ahí el hallazgo: *"si se hace manual, no se manda ningún request"*.

Reemplacé la condición monolítica por tres guards, cada uno con su mensaje:

```tsx
if (!datosCompletos) { setAuthError("Completá tus datos antes de continuar."); return; }
if (!authToken)      { setAuthError("Iniciá sesión con tu cuenta de Google para confirmar la reserva."); return; }
if (!selectedServiceId || !selectedSpecialistId || !selectedBloqueHorarioId || !duracionMinutos) {
  setAuthError("Falta elegir el servicio, el horario o la profesional. Volvé atrás para completarlo."); return;
}
```

Y el botón pasó a `disabled={submitMutation.isPending || !puedeReservar}`, con `puedeReservar` incluyendo el token.

**Un detalle de TypeScript que vale anotar:** al principio extraje el tercer guard a un booleano `seleccionCompleta`. Compilaba mal, porque TS pierde el *narrowing*: `selectedServiceId` volvía a ser `number | null` en la llamada a `mutate`. Por eso ese chequeo quedó inline —narra los tipos **y** da el mensaje— y el booleano derivado se usa solo para el estado del botón.

**Además**, como el bloque de Google está arriba y el botón abajo, agregué un aviso proactivo para que el usuario no tenga que apretar para enterarse:

```tsx
{!authToken && datosCompletos && (
  <p>Iniciá sesión con Google, arriba, para habilitar la reserva</p>
)}
```

### 17.3 S-16 — El cartel que mentía (H-022)

El cartel verde decía "Sesión Iniciada Correctamente" con solo mirar `authToken`, sin importar si el perfil estaba completo. El backend **sí** devuelve `PerfilCompleto`; el frontend lo ignoraba.

Ahora el cartel es verde o ámbar según el estado real:

```tsx
{authToken && (perfilCompleto
  ? <div className="...bg-emerald-600">Sesión Iniciada Correctamente</div>
  : <div className="...bg-amber-600">Sesión iniciada. Completá tu teléfono para poder reservar</div>)}
```

**Decisión: `perfilCompleto` se deriva del estado local (`rutEsValido && telefonoEsValido`), no del flag del servidor.** El flag es una foto del momento del login y queda obsoleto en cuanto el usuario escribe el teléfono: el cartel ámbar se quedaría pegado aunque ya hubiera completado todo. Derivándolo, el cartel se actualiza mientras escribe.

Y el texto menciona **solo el teléfono**, no el RUT: con el gating de S-05 el RUT ya es obligatorio antes de iniciar sesión, así que lo único que puede faltar es el teléfono. Pedirle el RUT sería confuso.

### 17.4 Verificación

```
npx tsc --noEmit -> 0
npx eslint       -> 0 errores en los archivos tocados
dotnet test      -> 215/215 (sin cambios de backend en este bloque)
```

**Nota sobre el linter:** `npx eslint src` reporta **26 errores preexistentes en 11 archivos** que no toqué (`admin-panel-button.tsx`, `instagram-video-card.tsx`, `use-agenda.ts`, `use-landing.ts`, `use-constructor-plantilla.ts`, entre otros): mayormente `prettier/prettier`, algunos `no-explicit-any` y varios "setState synchronously within an effect". No los toqué —sería una pasada ajena a este trabajo— pero **conviene limpiarlos en algún momento**, porque hoy `eslint src` no pasa y eso impide usarlo como barrera en CI.

**Lo que no pude verificar:** igual que en S-05, el flujo de Google en un navegador real. Los mensajes nuevos y el gating son lógica de render verificada por tipos, pero **PF-097, H-022 y H-025 hay que re-ejecutarlos a mano.**

---

## 18. Trabajo ejecutado — S-08, opción B (2026-09-26)

### 18.1 Por qué se descartó la opción A

La primera versión agregaba `CuerpoCongelado` a `FichaClinica`. Maxi la objetó, y con razón. Al rastrear la historia:

| Clase | ¿Tuvo `CuerpoCongelado`? |
|---|---|
| `Consentimiento` | **Sí, hoy lo tiene** |
| `Recomendacion` | Nunca |
| `FichaClinica` | **Nunca** |

Lo que existió fue `DocumentoPaciente`, una clase única que el refactor `DocumentoHierarchyRefactor` reemplazó por la jerarquía actual, **dejando el campo solo en `Consentimiento`**. Y ese mismo refactor borró el comentario que explicaba su propósito:

> `CuerpoCongelado` y `HuellaDocumento` **protegen la firma** de un cambio posterior al formato

O sea: el mecanismo nació atado a las firmas, y las fichas no se firman. La opción A estiraba un concepto más allá de su propósito. Y tenía un defecto técnico concreto: al ser TPH, EF mapeó la propiedad nueva a la **misma columna** `cuerpo_congelado` que usa `Consentimiento` —la migración salió vacía por eso—, con lo que una sola columna habría quedado con dos formatos JSON distintos según el tipo de documento. El mismo problema de ambigüedad, movido de lugar.

### 18.2 Lo que se hizo: el nombre viaja con la respuesta

`Contenido` pasa de `{campoId: valor}` a `{campoId: {nombre, valor}}` para las fichas. La ficha queda **autocontenida**: ya no depende de la plantilla para saber cómo se llamaba cada campo.

**El backend no se tocó.** `Contenido` se almacena como texto opaco y se devuelve como `JsonElement`; lo verifiqué método por método: solo se comprueba `string.IsNullOrEmpty` y se parsea para devolverlo. No hay inspección de forma ni validación de obligatorios del lado del servidor —esa validación es del frontend—, así que no hubo DTO nuevo, ni modelo, ni migración.

Toda la tolerancia vive en un solo archivo, `src/lib/documento-contenido.ts`:

| Función | Para qué |
|---|---|
| `valorDeRespuesta(bruto)` | Lee el valor, venga plano o anidado |
| `nombreDeRespuesta(bruto)` | El nombre congelado, si lo hay |
| `etiquetaDeCampo(id, bruto, cuerpo)` | Prioriza el nombre guardado; si no está, cae a la plantilla viva |
| `conNombresDePlantilla(contenido, cuerpo)` | Al crear: adosa el nombre de cada campo |
| `conValoresActualizados(original, valores, cuerpo)` | Al editar: **conserva los nombres ya congelados** y solo cambia los valores |
| `soloValores(contenido)` | Aplana para los formularios de edición |

**`conValoresActualizados` es la pieza que evita el bug sutil.** Si al guardar una edición se volvieran a derivar los nombres de la plantilla actual, editar una ficha vieja después de renombrar un campo la "arreglaría" al nombre nuevo: exactamente lo que queremos impedir. Por eso preserva el nombre original y usa la plantilla solo como respaldo para fichas heredadas que no tienen ninguno.

### 18.3 Compatibilidad con las fichas que ya existen

**Sin migración de datos, a propósito.** Las fichas anteriores tienen `{campoId: valor}` plano:

- Al mostrarlas, `valorDeRespuesta` toma la rama de string y `etiquetaDeCampo` cae a la plantilla viva: **se ven exactamente igual que antes**.
- Si alguien edita una, `conValoresActualizados` les adosa los nombres de la plantilla actual. Es lo mejor disponible —no hay registro de cómo se llamaban antes— y a partir de ahí quedan congeladas.

Rellenar las viejas con la plantilla de hoy habría sido inventar historia: afirmaría que una ficha de marzo tenía las etiquetas de septiembre.

### 18.4 Un detalle de imports

`lib/documento-contenido.ts` necesita el tipo `CuerpoFormato` de los modelos, y los modelos necesitan los tipos de contenido de la lib: un ciclo. Resuelto con `import type` en los modelos —se borra en compilación, así que no hay ciclo en tiempo de ejecución— y apuntando a `@/models/responses/plantilla` en vez del barrel.

### 18.5 Verificación

```
npx tsc --noEmit -> 0
npx eslint       -> 0 errores en los archivos tocados
dotnet test      -> 215/215
```

**Pendiente de prueba manual:** el caso propuesto **PF-257** — registrar una ficha, renombrar y eliminar campos de su plantilla, y reabrirla. Debe conservar las etiquetas originales.

### 18.6 Aviso de herramientas

`dotnet ef migrations remove` regeneró el `AppDbContextModelSnapshot.cs` con 177 inserciones y 644 borrados: las herramientas de EF instaladas son **10.0.8** y el runtime es **10.0.9**. Restauré el snapshot desde git. **Hay que actualizar las herramientas antes de crear cualquier migración real**, o el snapshot va a quedar corrupto.

---

## 19. Trabajo ejecutado — S-19, S-18 y S-17 (2026-09-26)

Los tres van juntos porque atacan el mismo defecto de fondo: **tres componentes leían el cuerpo de una plantilla con reglas distintas.**

### 19.1 S-19 — Un solo mecanismo de firma (PF-114)

Decisión 1 = A: manda la plantilla.

| Cambio | Archivo |
|---|---|
| `Firma` sale de la lista de tipos ofrecidos | `use-constructor-plantilla.ts` (`TIPOS_CAMPO`) |
| El consentimiento importado deja de forzar `requiereFirmaPaciente: true` | `use-constructor-plantilla.ts` |
| Los **dos** interruptores se muestran también en modo archivo | `plantillas/nuevo/index.tsx` |
| Un tipo en desuso de una plantilla vieja no se pierde en silencio | `plantillas/nuevo/index.tsx` |

**Desviación de lo que había propuesto, con motivo.** Dije que los interruptores se mostrarían "para los tres tipos de documento". **No lo hice, y creo que hacerlo habría sido un error:** `FirmarPublicoAsync` solo opera sobre `Consentimiento`; fichas y recomendaciones no tienen flujo de firma. Mostrar interruptores de firma ahí sería prometer algo que el sistema no puede cumplir — exactamente la clase de bug que venimos corrigiendo. Los interruptores siguen siendo exclusivos de Consentimiento, que es donde la firma existe de verdad.

Lo que sí se arregló es la causa de la observación *"se declara solamente una sola firma"*: en el consentimiento **importado** solo aparecía el interruptor de la profesional, porque el del paciente estaba escondido por `modo !== "archivo"` y forzado a `true` en la llamada de importación. Ahora se declaran los dos, en los dos modos, y el valor elegido viaja hasta el backend (verificado: `plantilla-service.ts` → `use-plantilla-service.ts` → `ImportarPlantillaConsentimientoAsync`).

**Sobre los datos existentes:** el tipo `Firma` deja de ofrecerse, pero se sigue leyendo. Si una plantilla vieja tiene un campo de ese tipo, el desplegable lo muestra como "Firma (en desuso)" en vez de coercionarlo al primer tipo de la lista y cambiar el dato sin aviso al guardar.

**El backend no se tocó.** El enum `TipoCampoFormato` **no se usa en ninguna parte** —el cuerpo es JSON opaco— así que borrar el valor `Firma` de ahí no cambiaría ningún comportamiento y solo agregaría riesgo. Queda como está.

### 19.2 S-18 — Quién completa cada campo (PF-113)

| Cambio | Detalle |
|---|---|
| Distintivo por campo | *"Lo completa el paciente"* / *"Lo completa la profesional"* |
| Rama para `Firma` | Recuadro punteado con *"Se firma aparte, no se completa desde acá"* |
| Contador de sección corregido | Ya no cuenta los campos que no se pueden llenar |

**El distintivo va en el slot de `ayuda` que ya existía**, no en un elemento nuevo:

```tsx
ayuda: [campo.ayuda, quienCompleta].filter(Boolean).join(" · "),
```

Así funciona para los cinco tipos de campo de una sola vez, sin tocar la disposición ni duplicar markup en cada rama del render. Si el campo ya tenía texto de ayuda, los dos conviven.

**La rama de `Firma` era necesaria aunque el tipo ya no se ofrezca**, porque las plantillas existentes pueden tenerlo: antes caía en el fallback `<TextField>` y se dibujaba como una caja de texto común, que es peor que no mostrar nada.

**El contador estaba mal y nadie lo había reportado.** Contaba `seccion.campos.length` completo, incluidos `TextoInformativo` y `Firma`, que no se rellenan. Una sección con dos campos y un párrafo informativo mostraba "0/3 completados" y nunca llegaba a 3. Ahora `contadorDeSeccion` cuenta solo los rellenables, lo que además hace verdadero el "(0/1 completados)" que describe §4.4.2 del manual.

### 19.3 S-17 — La vista previa (H-019, PF-116)

| Cambio | Antes | Ahora |
|---|---|---|
| Punto de quiebre | `lg:` (1024px) | `md:` (768px) |
| `sticky` | siempre | solo desde `md:` |
| `TextoInformativo` | caja gris genérica | el párrafo real |
| `Firma` | caja gris genérica | recuadro de firma |
| Quién completa | no se mostraba | `· paciente` / `· profesional` |

**H-019 decía que la previa no reflejaba los cambios en vivo. Sí los reflejaba** —lee el estado `secciones` directamente, sin debounce— pero por debajo de 1024px la grilla colapsaba a una columna y la previa quedaba **debajo de todo el constructor**, fuera de pantalla. Con el navegador a media pantalla no se veía cambiar nada. Bajarlo a `md:` y quitar el `sticky` en móvil la deja visible en la mayoría de los casos reales.

El `sticky` solo desde `md:` importa: apilada en una columna, un panel pegajoso persigue al usuario mientras escribe y molesta más de lo que ayuda.

### 19.4 Verificación

```
npx tsc --noEmit -> 0
npx eslint       -> 0 errores nuevos
dotnet test      -> 215/215 (sin cambios de backend)
```

El único error de eslint en los archivos del bloque es **preexistente**: `use-constructor-plantilla.ts:162` *"Calling setState synchronously within an effect"*, en el `useEffect` que carga la plantilla a editar. Ese archivo ya figuraba entre los 11 con errores previos; mi diff fueron 3 líneas, ninguna cerca de la 162.
