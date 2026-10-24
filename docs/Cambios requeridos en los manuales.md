# Cambios requeridos en los manuales

Registro vivo. Se actualiza con **cada** cambio de código que contradiga, complete o deje obsoleto algo escrito en los manuales oficiales.

Documentos afectados:
- `docs/Manual de Usuario Panel de Administracion Kinefitchile.docx`
- `docs/Manual del Sistema KineFit.docx`

## Cómo leer la columna Estado

| Estado | Significa |
|---|---|
| **YA APLICA** | El código ya cambió. El manual **está desactualizado ahora mismo** |
| **PENDIENTE** | El cambio de código está aprobado pero no implementado |
| **A DECIDIR** | Depende de una decisión que aún no se tomó |
| **OBSOLETA** | Un cambio posterior la dejó sin efecto. **No se aplica**; la entrada indica cuál la reemplaza |

Los **YA APLICA** son los urgentes: hoy el manual dice algo que el sistema no hace.

---

## Resumen

*Contado con expresión regular sobre las cabeceras de este archivo, no a ojo, el 2026-10-23.*

| Manual | YA APLICA | PENDIENTE | A DECIDIR | OBSOLETA | Total |
|---|---|---|---|---|---|
| Manual de Usuario | 34 | 6 | 2 | 4 | 46 |
| Manual del Sistema | 17 | 2 | 1 | 0 | 20 |

**66 entradas en total, de las cuales 4 son OBSOLETAS y no se aplican (M-16, M-17, M-25 y M-27).** Quedan 62 por aplicar o decidir.

**Ronda del 18 al 23 de octubre:** se agregaron M-31 a M-46 y S-05 a S-20, al final del archivo, en la sección "Ronda del 18 al 23 de octubre de 2026". Por esa ronda, M-16, M-17, M-25 y M-27 pasaron a OBSOLETA, y M-23 lleva una precisión en M-40.

*El texto que sigue describe el estado al 2026-09-28 y se conserva como historial.*

Las 12 PENDIENTE, agrupadas por qué las produjo:

| Grupo | Entradas |
|---|---|
| Correcciones de texto que nunca dependieron de código | M-10, M-16, M-17 |
| Correo, depende de que Resend quede operativo (S-13) | S-02 |
| Ronda de pruebas del 26 y 27 de septiembre | M-24, M-25, M-26, M-27 |
| Ronda del 27 y 28: servicios, tablero de hitos y archivos | M-28, M-29, M-30, S-04 |

**Y una corrección importante:** S-01 describía que el sistema transfiere la ficha a una cuenta de Google nueva cuando coincide el RUT. **Eso se retiró el 27 de septiembre** por ser un agujero de seguridad, así que el texto que estaba propuesto ahí ya no sirve. La entrada trae el reemplazo.

Las 21 YA APLICA son las que el sistema cambió y el manual quedó atrás, con el texto propuesto listo para pegar.

---

## Manual de Usuario — Panel de Administración

### M-01 · §2.2 Paso 2: Selección del Horario — Nota · **YA APLICA**

**Origen:** corrección del filtro de disponibilidad (informe §15.2, 2026-09-25).

Ahora hay una cuarta razón por la que un horario no aparece: **ya pasó**. Antes el backend ofrecía horas pasadas y el frontend las escondía; ahora las filtra el backend, así que la razón es real y visible para cualquier consumidor.

**Texto actual:**

> Nota: si un horario no aparece es porque ya está ocupado, está bloqueado o queda fuera del horario del centro. Si necesita liberar un tramo bloqueado, revise el subcapítulo 1.4.

**Texto propuesto:**

> Nota: si un horario no aparece es porque ya pasó, ya está ocupado, está bloqueado o queda fuera del horario del centro. Si necesita liberar un tramo bloqueado, revise el subcapítulo 1.4.

### M-02 · Solución de Problemas — fila "Falta un horario en el paso 2 de la reserva" · **YA APLICA**

**Origen:** el mismo cambio que M-01.

**Texto actual (columna Causa probable):**

> El bloque está ocupado, bloqueado o fuera del horario del centro.

**Texto propuesto:**

> El bloque ya pasó, está ocupado, está bloqueado o queda fuera del horario del centro.

**Y en la columna Qué hacer**, agregar al final: *"Si la cita es para hoy, verifique que la hora no haya pasado ya."*

### M-03 · §4.5.3 Tipos de campo — quitar la fila "Firma" · **YA APLICA**

**Origen:** decisión 1 = A (manda la plantilla). S-19, PF-114.

El tipo de campo `Firma` se elimina porque es redundante: la firma se resuelve estampando el trazo sobre el PDF, y ese campo no se renderiza ni se guarda en ninguna vista.

**Fila a eliminar de la tabla de siete tipos:**

> | Firma | Un recuadro para firmar, sea del paciente o de la profesional. |

La tabla queda con **seis** tipos. Hay que ajustar también la frase introductoria, que hoy dice *"Cada campo de una plantilla es de uno de estos siete tipos"* → **seis**.

**Y agregar**, al final del subcapítulo, una aclaración de dónde quedó la firma:

> Nota: las firmas no se declaran como campos. Se activan con los interruptores de **Firmas Requeridas** al crear la plantilla, y el recuadro se presenta al pie del documento.

### M-04 · §4.4.2 Paso 2: Completar la ficha · **YA APLICA**

**Origen:** decisión 2 = c (campos editables con distintivo). S-18, PF-113.

Hoy el manual dice solo *"Complete los campos. Los obligatorios impiden guardar si quedan vacíos."*, sin mencionar que cada campo indica quién lo completa.

**Agregar después de ese paso:**

> Cada campo muestra quién debe completarlo: **La profesional** o **El paciente**. Los marcados como del paciente se pueden completar igualmente desde el panel —por ejemplo, si la profesional los pregunta durante la atención—, pero la marca indica a quién corresponden en el formato original.

### M-05 · §4.3 Detalle de un Documento — aviso de privacidad · **YA APLICA**

**Origen:** S-20, PF-107.

**Agregar** al comienzo de §4.3, antes de la descripción de los bloques:

> Al abrir una Ficha Clínica o un Consentimiento, el sistema advierte **"Contenido privado. No visible para el paciente."** Ese aviso no aparece en las Recomendaciones, porque están dirigidas al paciente.

### M-06 · §4.3 Detalle de un Documento — Datos de la Atención · **YA APLICA**

**Origen:** S-04, PF-095. Implementado el 2026-09-25.

El campo "Origen", que mostraba el tipo de actor ("Personal"), se reemplazó por dos campos: **Creada por** —con el nombre de la persona— y **Fecha de Creación**.

**Texto actual:**

> Al costado se muestran los Datos de la Atención: paciente, servicio, fecha y horario, profesional y origen.

**Texto propuesto:**

> Al costado se muestran los Datos de la Atención: paciente, servicio, fecha y horario, profesional, **quién creó el documento y la fecha de creación**.

Nótese que **el campo "origen" ya no existe** como tal: lo que antes mostraba ("Personal", "Paciente", "Sistema") ahora acompaña al nombre entre paréntesis, por ejemplo *"Franchesca Soto (Personal)"*.

### M-19 · §1.2.3 Historial de la Cita · **YA APLICA**

**Origen:** S-04, PF-172 y PF-174. Implementado el 2026-09-25.

Dos cambios en lo que muestra cada línea del historial:

1. **La identidad ahora es el nombre de la persona**, no el tipo de actor. Antes decía solo "Personal"; ahora dice *"Franchesca Soto (Personal)"*. El manual ya prometía *"quién ejecutó el cambio"*, así que en este punto **el texto era correcto y el sistema no lo cumplía**: el arreglo alinea el sistema al manual y no hace falta reescribir nada.
2. **Se agrega el origen de la confirmación** cuando corresponde, que antes no se mostraba en ninguna parte.

**Texto actual:**

> Cada línea indica el estado que tomó la cita, quién ejecutó el cambio y la fecha y hora exactas, partiendo por su creación.

**Texto propuesto:**

> Cada línea indica el estado que tomó la cita, quién ejecutó el cambio con su nombre, la fecha y hora exactas, y —cuando se trata de una confirmación— **por qué medio se confirmó**: por la profesional, por correo o por WhatsApp.

**Y agregar** una Nota al final del subcapítulo:

> Nota: cuando la acción la ejecutó el sistema, por ejemplo al confirmarse un pago en línea o al expirar una reserva, la línea indica "Sistema" en lugar de un nombre.

**Ampliación del 26/09 — la creación ahora aparece en el historial.**

El manual ya decía que el historial arranca *"partiendo por su creación"*. **Era falso:** crear una cita no generaba ninguna fila de auditoría, porque el interceptor solo miraba modificaciones y `Cita` no estaba entre las entidades vigiladas. La única huella era la columna `creado_por_usuario_id`, que no se mostraba en ninguna parte.

Ahora el alta genera su propia fila y el historial abre con, por ejemplo, **"Creada en Por Confirmar — Franchesca Soto (Personal)"**.

**Tampoco hay que reescribir este texto:** el manual describía el comportamiento correcto y el sistema no lo cumplía. El arreglo lo alinea.

**Salvedad para quien pruebe:** solo aplica a citas creadas de ahora en adelante. Las anteriores no tienen fila de creación y no se rellenó de forma retroactiva, porque no hay registro de cuándo se creó cada una más allá de su `CreatedAt`. Para verificar PF-172 hay que **crear una reserva nueva**.

### M-07 · §4.3.1 Archivo y adjuntos · **YA APLICA**

**Origen:** S-09, H-023.

**Agregar** al final del subcapítulo:

> Nota: un documento cerrado, bloqueado o anulado no admite nuevos adjuntos. En ese caso el sistema no ofrece la acción **Adjuntar**.

### M-08 · §4.5.1 Catálogo de plantillas · **YA APLICA**

**Origen:** S-22, H-027.

**Texto actual:**

> Nota: una plantilla que ya tiene documentos generados no se elimina, para no dejar esos documentos sin su formato de origen. Si no quiere seguir usándola, desactívela.

**Texto propuesto:**

> Nota: una plantilla se puede eliminar **solo mientras no tenga documentos generados con ella**. En cuanto se emite el primer documento, la eliminación deja de ofrecerse, para no dejar ese documento sin su formato de origen. Si no quiere seguir usándola, desactívela.

### M-09 · §4.5.2 Crear o editar una plantilla — Advertencia · **YA APLICA**

**Origen:** S-08, PF-117 sobre fichas.

La advertencia actual dice "ya **firmados**", que excluye por omisión a las fichas clínicas —que no se firman— y por eso resultaba engañosa. Con el congelado aplicado también a fichas, la afirmación más fuerte es verdadera.

**Texto actual:**

> Advertencia: modificar una plantilla que ya está en uso afecta a los documentos que se generen de aquí en adelante. Los documentos ya firmados conservan el formato con el que se emitieron.

**Texto propuesto:**

> Advertencia: modificar una plantilla que ya está en uso afecta a los documentos que se generen de aquí en adelante. Los documentos ya **emitidos** —fichas, consentimientos y recomendaciones— conservan el formato con el que se emitieron.

### M-10 · §4.5.2 Crear o editar una plantilla — formato del archivo · **PENDIENTE**

**Origen:** PF-115.

El manual no dice en qué formato se sube un documento externo. El sistema acepta **solo PDF**, validado por contenido.

**Agregar** al paso de carga de archivo:

> El documento debe estar en formato **PDF**. Si lo tiene en Word, expórtelo a PDF antes de subirlo.

### M-11 · §5.5.1 Máquinas POS · **YA APLICA**

**Origen:** decisión 3 = c. S-21, H-026.

Hoy el manual solo describe agregar un terminal.

**Agregar** después de *"Para sumar un terminal, presione Agregar POS y complete sus datos y comisiones"*:

> Para retirar un terminal de uso, desactívelo con su interruptor **Activo / Inactivo**. Un terminal inactivo deja de ofrecerse al registrar cobros nuevos, y las ventas ya registradas con él conservan su cálculo.
>
> El nombre, las notas y el plazo de abono de un terminal se pueden editar en cualquier momento.
>
> Advertencia: las comisiones no se editan. Al igual que los acuerdos de reparto y la tasa de impuesto, funcionan por versiones con fecha de vigencia, de modo que cada venta conserva la comisión que estaba vigente el día en que se registró.

### M-12 · §3.3.2 Historial de Citas · **YA APLICA**

**Origen:** decisión 9 = a. S-03, PF-092.

**Texto actual:**

> Cada línea indica la fecha y el rango horario, el servicio, la profesional que atendió y el estado en que quedó la cita.

**Texto propuesto:**

> Cada línea indica la fecha y el rango horario, el servicio, la profesional que atendió, el estado en que quedó la cita y **si ya tiene ficha clínica registrada**.

### M-13 · §3.3.3 Documentos del Paciente · **YA APLICA**

**Origen:** S-23, PF-178.

**Texto actual:**

> Cada línea muestra el nombre del documento, su tipo y su fecha, con el botón Ver Documento para abrirlo.

**Texto propuesto:**

> Cada línea muestra el nombre del documento, su tipo, **su estado** y su fecha, con el botón Ver Documento para abrirlo.

### M-14 · §6.2 Especialistas — Precaución · **YA APLICA** · ⚠ EL TEXTO ACTUAL ESTÁ EQUIVOCADO

**Origen:** S-11, PF-147. **Este no es un cambio por una mejora: el texto actual manda al lugar equivocado.**

La causa más frecuente de que una profesional no aparezca en el paso 3 **no** son los servicios habilitados, sino que no tenga plantilla horaria cargada. Sin plantilla no se generan bloques de agenda, y sin bloques no aparece nunca, tenga los servicios que tenga.

**Texto actual:**

> Precaución: los servicios habilitados aquí determinan en qué reservas aparece la profesional. Si no la ve en el paso 3 del asistente de reserva, revise primero esta pestaña.

**Texto propuesto:**

> Precaución: para que una profesional aparezca en el paso 3 del asistente de reserva se deben cumplir dos condiciones. Primero, tener su **plantilla horaria** cargada en Configuración → Horarios: sin horario no se generan bloques de agenda y no aparecerá nunca. Segundo, tener habilitado el servicio de la reserva en esta pestaña. Si no la ve, revise el horario antes que los servicios.

**Y agregar**, junto al aviso de "Sin cuenta de acceso":

> Si una integrante aún no tiene horario cargado, su tarjeta lo advierte con el enlace **Sin horario cargado, configurar**.

### M-15 · Solución de Problemas — fila "No aparece ninguna profesional en el paso 3 de la reserva" · **YA APLICA**

**Origen:** el mismo que M-14.

**Texto actual (Causa probable):**

> Ninguna de las habilitadas para ese servicio tiene libre ese horario.

**Texto propuesto:**

> Ninguna tiene plantilla horaria cargada, o ninguna de las habilitadas para ese servicio tiene libre ese horario.

**Y en Qué hacer**, agregar al inicio: *"Revise que la profesional tenga horario en Configuración → Horarios."*

### M-16 · §6.3.1 Catálogo de servicios — quitar SVG · **OBSOLETA, ver M-40**

**Esta entrada ya no se aplica.** El 19 de octubre se eliminó la imagen del servicio por completo, así que la frase sobre formatos de imagen desaparece entera. El texto correcto está en M-40.

**Origen:** decisión 7 = b.

El sistema acepta **solo JPEG, PNG y WebP**: `FileService.EsImagenValida` valida por contenido y no reconoce SVG. El manual promete un formato que se rechaza.

**Texto actual:**

> La imagen admite archivos PNG, JPG, WEBP o SVG de hasta 25 MB.

**Texto propuesto:**

> La imagen admite archivos PNG, JPG o WEBP de hasta 25 MB.

### M-17 · "El menú lateral" — faltan dos ítems · **OBSOLETA, ver M-31**

**Esta entrada ya no se aplica y no debe ejecutarse.** El 19 de octubre se quitaron Reportes y Mi Perfil del menú lateral, así que el manual **no** debe agregarlos. Lo que corresponde está en M-31.

**Origen:** H-028 propuesto. **Omisión preexistente, no la causa ningún cambio nuestro.**

El manual lista seis ítems más Cerrar Sesión. El menú real tiene **ocho**.

**Agregar a la lista:**

> **Reportes**: indicadores de ventas, reservas y comisiones del centro. Solo visible para el rol Administrador.
>
> **Mi Perfil**: datos de la propia cuenta y cambio de contraseña.

Y agregar la fila correspondiente a la tabla de **Roles y permisos**:

> | Reportes | Sí | No |

### M-20 · §5.6 Exportar el Listado · **YA APLICA**

**Origen:** S-24, PF-198. Implementado el 2026-09-26.

**El manual ya describía esta función correctamente; lo que no existía era la función.** Era un `alert()`. Ahora la exportación es real, devuelve el período completo sin paginar y respeta los filtros, exactamente como el manual dice.

**No hay que cambiar el texto.** Queda registrado solo para que conste que §5.6 pasó de ser una promesa incumplida a una descripción verdadera. Conviene agregar una sola precisión, porque el archivo es CSV y no XLSX:

> Nota: el archivo se descarga en formato CSV, listo para abrirse en Excel o en una planilla de cálculo.

### M-21 · §4.3.3 Imprimir, descargar y cerrar la ficha · **YA APLICA**

**Origen:** S-07, PF-101. Implementado el 2026-09-26.

Mismo caso que M-20: el manual describía las tres acciones y **Descargar solo funcionaba en documentos con archivo adjunto**, mientras que **Imprimir**, en una ficha del constructor, imprimía la página entera del panel. Ahora las dos generan el PDF del documento.

**No hay que cambiar el texto**, pero conviene agregar:

> Nota: en las fichas completadas con una plantilla del sistema, el PDF se genera en el momento a partir del contenido registrado.

### M-22 · §1.4 Gestión de Bloqueos y "El menú lateral" · **YA APLICA**

**Origen:** S-26, PF-253. Implementado el 2026-09-26.

Las rutas antiguas del panel ahora redirigen en lugar de dar 404:

| Ruta antigua | Destino |
|---|---|
| `/panel/fichas` | `/panel/documentos` |
| `/panel/fichas/formatos` | `/panel/documentos/plantillas` |
| `/panel/fichas/formatos/nuevo` | `/panel/documentos/plantillas/nuevo` |
| `/panel/agenda/bloqueos` | `/panel/agenda` |

**Sin cambios de texto en el manual**, que ya describe las rutas nuevas. Queda anotado porque un marcador viejo del navegador ahora funciona, y eso cambia lo que hay que responder en Solución de Problemas si alguien reporta que "el enlace que tenía guardado no anda".

### M-23 · §6.3.1 y §4.3.1 — mensajes de límite de tamaño · **YA APLICA**

**Origen:** S-02. Implementado el 2026-09-26.

Antes, un archivo por encima del límite producía el mensaje genérico *"Error de red"*, porque un 413 de nginx no llega legible al navegador. Ahora se valida antes de subir y el mensaje nombra el archivo y los dos tamaños.

**El texto de §6.3.1 sigue siendo correcto** (25 MB para imágenes). Lo que conviene agregar es el límite de los adjuntos clínicos, que el manual no menciona en ninguna parte, en §4.3.1:

> Nota: cada archivo adjunto admite hasta 15 MB. Si lo supera, el sistema lo informa antes de subirlo.

### M-18 · "La barra superior" y tabla de Roles y permisos · **A DECIDIR**

**Origen:** H-021, decisión 6 = a (no ocultar).

**Con la decisión tomada, este cambio NO se hace.** Queda registrado solo para que conste que se evaluó: si en algún momento se decide ocultar el enlace **Ir a la Web** al rol Especialista, habría que reescribir "La barra superior" y agregar una fila a la tabla de roles. Mientras la decisión siga siendo (a), el manual es correcto como está.

---

## Manual del Sistema

### S-01 · §4.8 Inicio de Sesión del Paciente · **YA APLICA**

**Origen:** S-05 revisada, PF-097. Implementado el 2026-09-25.

El flujo documentado no menciona que el RUT viaja en el login de Google para evitar duplicar al paciente. Hay que documentar que `POST /api/auth/google` acepta un `rut` opcional, y el orden de resolución de identidad que ya implementa `AuthService`:

> 1. Por `GoogleSub`, si la cuenta ya inició sesión antes.
> 2. **Por RUT**, cuando el cliente lo envía: el RUT es la identidad real del paciente, y prevalece sobre el correo para no duplicar a la misma persona bajo otra cuenta de Google.
> 3. Por correo, como respaldo.
> 4. Si nada coincide, se crea un registro nuevo con RUT y teléfono nulos, que el paciente completa antes de reservar.

**Y documentar** que el sitio público condiciona el botón de Google a que el RUT sea válido, precisamente para que el paso 2 pueda aplicarse siempre.

**⚠ Este último punto cambió el 2026-09-27 y el texto de arriba quedó obsoleto.** Lo que decía —que el sistema transfiere la vinculación a la cuenta nueva— era el comportamiento anterior y **se retiró por ser un agujero de seguridad**: el RUT no es secreto en Chile, así que quien lo conociera podía quedarse con la ficha ajena y dejar sin acceso a su dueño.

El texto correcto para el manual es este:

> El RUT solo vincula una cuenta nueva cuando la ficha **todavía no tiene una asociada**, que es el caso de la ficha creada por recepción en una atención presencial. Si la ficha ya tiene cuenta, el login se rechaza con `RUT_CON_OTRA_CUENTA` y se le indica al paciente que se acerque al centro.

**Y corregir el paso 2 de la lista de resolución de identidad**, que ahora lleva condición:

> 2. **Por RUT**, cuando el cliente lo envía **y la ficha encontrada no tiene cuenta asociada**.

### S-02 · §6.7.4 Resend · **PENDIENTE**

**Origen:** S-13, los 7 casos de correo.

La sección no menciona el requisito que hizo fallar los siete casos.

**Agregar:**

> Resend exige que el dominio del remitente esté verificado en su panel, con los registros DKIM y SPF publicados en el DNS. Un envío desde un dominio no verificado se rechaza con 403 y la notificación queda en estado `Fallida` tras agotar los reintentos, sin ningún aviso en la interfaz.
>
> El dominio de envío oficial es **kinefitchile.com**. La clave `EmailConfiguration:From` debe usar una dirección de ese dominio en todos los entornos.

### S-03 · §3.3.3 Documentos Clínicos · **YA APLICA**

**Origen:** S-08, PF-117 sobre fichas.

La sección documenta `CuerpoCongelado` y `HuellaDocumento` para consentimientos. Hay que extender la explicación a las fichas clínicas, que hasta ahora guardaban solo la FK a la plantilla viva:

> Las fichas clínicas también congelan el cuerpo de su plantilla al crearse. Sin ese snapshot, renombrar o eliminar un campo de la plantilla cambiaría retroactivamente cómo se lee una ficha ya cerrada.

---

## Sin impacto en manuales

Cambios ejecutados o aprobados que **no** tocan ningún manual, anotados para que no se revisen dos veces:

| Cambio | Por qué no aplica |
|---|---|
| Corrección de `DesactivarPaciente_…` (informe §15.1) | Solo toca un test |
| S-25 (PF-170) | **Descartada.** El manual ya era correcto |
| S-06 (PF-127) | Ningún manual describe el paso de revisión del paciente |
| S-07 (PF-101) | Al contrario: §4.3.3 ya prometía Descargar, el arreglo lo vuelve verdadero |
| S-10 (PF-146) | §6.2 ya describe la desactivación y su advertencia |
| S-15, S-16 (H-025, H-022) | El flujo público de reserva está fuera del alcance de ambos manuales |
| S-17 (H-019, PF-116) | §4.5.2 ya dice que la vista previa refleja los cambios en vivo |
| S-24 (PF-198) | §5.6 ya describe la exportación; el arreglo la vuelve real |
| S-02 (validar tamaño en cliente) | §6.3.1 ya declara el límite de 25 MB |
| S-26 (PF-253) | Redirección técnica, no documentada |

### M-24 · §4.3 Detalle del Documento — acciones de firma · **PENDIENTE**

**Origen:** pedido de Maxi en la prueba del 2026-09-27.

El manual describe las acciones de firma **solo** dentro del detalle de la reserva. Ahora las mismas acciones están también en el detalle del documento, que es donde uno las busca cuando llega por el listado de Documentos.

Hay que agregar en §4.3, después de Imprimir y Descargar:

> Desde el detalle de un documento también podés copiar el enlace de firma, reenviarlo por correo, cargar el documento firmado en papel y, cuando el paciente ya firmó, firmarlo como profesional. Son las mismas acciones que ofrece la pestaña Documentos de la reserva.

### M-25 · §4.4 Firmar un consentimiento — leer antes de firmar · **OBSOLETA, ver M-42**

**Esta entrada ya no se aplica.** El 19 y el 20 de octubre se quitó la exigencia de llegar al final del documento para poder firmar. El texto correcto está en M-42.

**Origen:** S-xx del 2026-09-26, ajustado el 2026-09-27.

El documento que firma **el paciente** se abre en modo Leer y la pestaña Firmar se habilita al llegar al final. **La profesional no pasa por eso**: entra directo a firmar. El manual tiene que decir cuál es cuál, porque si no parece que la función está fallando.

> Al paciente, el documento se le abre en modo Leer y el botón Firmar se habilita cuando llega al final. La profesional, en cambio, entra directamente en modo firma.

### M-26 · §5.x Recomendaciones — cuando el servicio no tiene una estándar · **PENDIENTE**

**Origen:** PF-236.

Al marcar una cita como Atendida **siempre** se pregunta si se envía una recomendación. Lo que cambia es que, si el servicio no tiene una estándar configurada, esa opción no se ofrece y queda solo la personalizada.

> La pregunta aparece en toda cita que se marca como Atendida. Si el servicio no tiene una recomendación estándar configurada, la única opción disponible es armar una personalizada.

### M-27 · §2.x Ficha del Paciente — Desvincular Cuenta · **OBSOLETA, sin reemplazo**

**Esta entrada ya no se aplica.** El 23 de octubre se eliminó la función Desvincular Cuenta del panel y de la API. No se documenta en ningún manual.

**Origen:** H-033, decisión del 2026-09-27.

Función nueva y con consecuencias, así que necesita texto propio en el manual.

Antes, una persona que cambiaba de correo entraba con su cuenta nueva indicando su RUT y el sistema se la vinculaba sola. Eso se quitó, porque el RUT no es secreto y cualquiera que lo conociera podía quedarse con la ficha ajena. Ahora ese traspaso lo autoriza el personal.

> **Desvincular Cuenta.** Si un paciente cambió de correo y ya no puede entrar con su cuenta anterior, en Datos Personales aparece la opción Desvincular Cuenta. Hazlo solo con la persona presente y su identidad verificada: la cuenta actual pierde el acceso de inmediato y la próxima que inicie sesión indicando ese RUT queda asociada a la ficha.
>
> Si el paciente intenta entrar por su cuenta con un RUT que ya está asociado a otra cuenta, el sistema le responde que se acerque al centro.

También conviene agregarlo a Solución de Problemas, porque es el síntoma que va a llegar por teléfono: *"no puedo entrar, me dice que mi RUT ya está en otra cuenta"*.

### M-28 · §6.3 Servicios — "Documentos Exigidos" rehecho · **PENDIENTE**

**Origen:** pedido de Maxi y decisión de quitar la vigencia, 2026-09-27.

Esta sección hay que **reescribirla entera**, porque la pantalla ya no se parece a lo que describe el manual. Cambió en cuatro cosas:

1. **Dos secciones separadas**, Consentimiento y Recomendación estándar, en vez de una lista mezclada donde había que leer la etiqueta de cada fila.
2. **De cada tipo se elige uno solo**, y cada sección incluye la opción de no exigir nada. Antes las recomendaciones eran casillas y se podían marcar varias, pero el sistema tomaba una sola en silencio.
3. **Las fichas clínicas ya no se listan.** Nunca se usaron desde acá: la profesional elige la plantilla al registrar la ficha.
4. **Desaparecieron la casilla "Obligatorio" y el campo "Vigencia (días)".**

Texto propuesto:

> **Documentos Exigidos.** Cada servicio define qué consentimiento firma el paciente antes de la atención y cuál es su recomendación estándar. De cada uno se elige uno solo, y cualquiera de los dos puede quedar sin asignar.
>
> Las fichas clínicas no se configuran acá: la profesional elige la plantilla en el momento de registrar la ficha.

**Hay que eliminar del manual toda mención a la vigencia del consentimiento**, si la tiene. Esa función se retiró: un consentimiento se firma en cada cita, sin excepción. La decisión fue de Maxi, por no corresponder a ningún requerimiento real.

**Consecuencia en el plan de pruebas:** PF-249 y PF-250 probaban la reutilización por vigencia, así que **dejan de aplicar**.

### M-29 · §1.2 Detalle de la Reserva — se retiró el tablero de progreso · **PENDIENTE**

**Origen:** decisión de Maxi, 2026-09-28.

La franja con los cuatro pasos numerados —Anticipo Pagado, Pago Total Registrado, Documentos Firmados, Recomendaciones Enviadas— **ya no existe**. Si el manual la describe o la muestra en una captura, hay que quitar esa parte.

El motivo, por si alguien pregunta: se dibujaba como una secuencia, pero los cuatro eran hechos independientes y tres de ellos no siempre corresponden —el anticipo no existe en una cita manual, y los documentos y la recomendación no existen si el servicio no los exige—. Un paso en gris no distinguía "falta hacerlo" de "esto no aplica". Además, el de documentos se marcaba como cumplido cuando la cita no tenía ningún consentimiento.

El detalle de la reserva ahora abre directo en sus dos pestañas, Detalle y Documentos.

**Y hay que documentar dónde quedó el cobro**, porque se accedía desde ese tablero:

> Para registrar el pago de una reserva Confirmada o Atendida, usa **Registrar Venta**, al pie del detalle. También puedes hacerlo desde Ventas, eligiendo la cita.

### M-30 · §4.3 Detalle del Documento — consentimientos cargados en papel · **PENDIENTE**

**Origen:** hallazgo del 2026-09-27.

Cuando el consentimiento se carga como foto en vez de PDF, antes el visor respondía *"error al cargar el documento PDF"* y la descarga entregaba un archivo `.pdf` que no abría en ningún programa. Las dos cosas están corregidas.

> Nota: un consentimiento firmado en papel se puede cargar como PDF o como foto. Si es una foto, se muestra como imagen y se descarga con su formato original.

### S-04 · §3 Modelo de Datos y §5 API — campos retirados · **PENDIENTE**

**Origen:** acompaña a M-28 y M-29.

Tres cambios que el Manual del Sistema tiene que reflejar, todos por retiro:

| Dónde | Qué se fue |
|---|---|
| `servicios_documento` | La columna `vigencia_dias` (migración `QuitarVigenciaConsentimiento`) |
| Respuesta de consentimiento | `Reutilizado`, `VigenteDesde` y `VigenteHasta`, que solo tenían sentido con la vigencia |
| Detalle de cita | El objeto `Hitos` completo |

**Nota para quien mantenga el repositorio:** las herramientas de EF estaban en 10.0.8 contra un runtime 10.0.9, y con ese desfase `dotnet ef migrations add` reescribía el snapshot entero. Se subieron a 10.0.9 antes de generar esta migración. Conviene dejarlo anotado en el apartado de entorno de desarrollo.

---

## Ronda del 18 al 23 de octubre de 2026

Cambios hechos después de la reunión del 6 de octubre y de las pruebas funcionales del 18 de octubre. **Todos son YA APLICA salvo que se indique otra cosa:** el código ya está en `dev` (backend) y en `test-production` (frontend).

**Instrucciones para quien aplique estos cambios:** cada entrada indica la sección exacta del manual, el texto que hay hoy, citado tal cual, y el texto que debe quedar. Respetar las convenciones del Manual de Usuario: nombres de botones y campos en negrita, mensajes del sistema entre comillas, rutas con flechas y avisos con los rótulos **Advertencia**, **Precaución** y **Nota**. En los textos de pantalla los elementos se separan con coma, nunca con "·" ni "•". Las entradas M-16, M-17 y M-25 quedaron **obsoletas** por esta ronda y no deben aplicarse.

### Manual de Usuario — Panel de Administración

### M-31 · "El menú lateral" y tabla de Roles y permisos — se quitaron Reportes y Mi Perfil · **YA APLICA**

**Origen:** decisión de Maxi del 19 de octubre. El módulo de reportes quedó fuera de la entrega según el acta del 6 de octubre, y Mi Perfil solo mostraba datos de lectura.

El menú lateral tiene ahora **seis** ítems, que son exactamente los que el manual ya lista: Agenda, Nueva Reserva, Pacientes, Documentos, Ventas y Configuración, más **Cerrar Sesión** al pie.

**El texto actual de "El menú lateral" es correcto y no se modifica.** Lo que hay que hacer es:

1. **No aplicar M-17**, que proponía agregar Reportes y Mi Perfil.
2. Revisar que ninguna otra parte del manual mencione **Reportes** o **Mi Perfil** como opciones del menú, ni los muestre en una captura. Si una figura del menú los muestra, reemplazarla.
3. La tabla de **Roles y permisos** no debe llevar una fila de Reportes.

### M-32 · Acceso y Navegación General, "Cerrar la sesión" — recargar ya no cierra la sesión · **YA APLICA**

**Origen:** corrección del 19 de octubre (commit `c0f97c9` del frontend). Antes, al recargar la página con un detalle abierto (una reserva, un documento o un paciente), el panel dejaba de responder a los botones Cerrar, Anterior y Siguiente y a las pestañas de Configuración. Eso se corrigió. Además, la sesión del panel se conserva al recargar: lo que la termina es su vencimiento por tiempo.

**Texto actual:**

> Precaución: la sesión también termina si se recarga la página del navegador. En ese caso deberá ingresar nuevamente sus credenciales. Por eso conviene desplazarse entre módulos usando el menú lateral y no los botones de recarga o de historial del navegador.

**Texto propuesto:**

> Nota: recargar la página del navegador no cierra la sesión. La sesión termina al presionar **Cerrar Sesión** o cuando vence por tiempo; en ese caso el sistema vuelve a la pantalla de ingreso y hay que ingresar nuevamente las credenciales.

**En Solución de Problemas**, reemplazar la fila:

> | El sistema volvió a la pantalla de ingreso | Se recargó la página del navegador y la sesión terminó. | Ingrese nuevamente y desplácese usando el menú lateral en vez de recargar. |

**por:**

> | El sistema volvió a la pantalla de ingreso | La sesión venció por tiempo. | Ingrese nuevamente con su correo y contraseña. |

### M-33 · §1.4.2 Registrar un bloqueo, §6.6.1 Horario del Centro y Solución de Problemas — las horas del bloqueo se escriben · **YA APLICA**

**Origen:** cambio del 19 de octubre. Los campos **Hora Inicio** y **Hora Término** del bloqueo dejaron de ser listas desplegables con horas fijas y pasaron a ser campos de hora. El sistema bloquea todos los bloques de agenda que se cruzan con el rango indicado.

**En §1.4.2, texto actual del paso 4:**

> Seleccione la Hora Inicio y la Hora Término del tramo.

**Texto propuesto:**

> Escriba la **Hora Inicio** y la **Hora Término** del tramo.

**En §1.4.2, texto actual de la Nota:**

> Nota: los desplegables de hora solo ofrecen horas dentro del horario de atención del centro. Si una hora no aparece en la lista, es porque el centro no atiende en ese tramo. El horario del centro se define en Configuración → Horarios.

**Texto propuesto:**

> Nota: el bloqueo cierra todos los bloques de agenda que se cruzan con el rango indicado. Por ejemplo, un bloqueo de 10:15 a 11:00 cierra los bloques de 10:00 a 10:30 y de 10:30 a 11:00, y la agenda lo muestra como "Bloqueado, 10:00 – 11:00". Si el rango incluye una hora con una cita en firme, el sistema rechaza el bloqueo e indica qué bloques están ocupados.

**En §6.6.1, texto actual de la Nota:**

> Nota: los cortes del día, como la colación, se representan simplemente como dos franjas separadas. Por eso esas horas no aparecen en los desplegables de bloqueo ni en los bloques de reserva.

**Texto propuesto:**

> Nota: los cortes del día, como la colación, se representan simplemente como dos franjas separadas. Por eso esas horas no generan bloques de reserva.

**En Solución de Problemas**, eliminar la fila:

> | Una hora no aparece al registrar un bloqueo | El centro no atiende en ese tramo. | Ajuste primero el Horario del Centro en Configuración → Horarios. |

**y agregar:**

> | No se puede guardar un bloqueo | El rango incluye una hora con una cita en firme, o la hora de término no es posterior a la de inicio. | Revise el mensaje del sistema, que indica los bloques ocupados. Ajuste el rango o reagende primero la cita. |

### M-34 · §1.1 Vista de Agenda y §1.2.1 Pestaña Detalle — horarios reales · **YA APLICA**

**Origen:** cambios del 19 de octubre (commits `2d30ede` del frontend y `3c5a708` del backend). Antes, la agenda solo dibujaba las citas que empezaban dentro de un horario fijo escrito en el panel (09:00 a 14:00 y 15:00 a 21:00 en la semana). Ahora dibuja todos los bloques que genera el sistema a partir del Horario del Centro y de la plantilla de cada profesional.

**No hay que cambiar texto en §1.1.** Agregar al final del subcapítulo:

> Nota: la agenda muestra las reservas en cualquier horario que el centro tenga configurado. Si el centro amplía su horario en Configuración → Horarios, las reservas de esas horas aparecen automáticamente en la agenda.

**En §1.2.1, sin cambiar texto:** el campo **Fecha y Horario** muestra ahora el rango completo de la cita. Antes, una cita de 60 o 90 minutos se mostraba en el detalle como si durara 30 minutos. Si alguna captura del manual muestra un horario de 30 minutos para un servicio de 60, reemplazarla.

### M-35 · §1.2.2 Pestaña Documentos — Rechazar Documento · **YA APLICA**

**Origen:** funcionalidad nueva del 22 de octubre (commits `e3edced` del backend y `0007894` del frontend). Cubre el caso en que el paciente entrega el consentimiento mal firmado, sin firmar o con otro problema, o se cargó el archivo en papel equivocado.

**Texto actual:**

> Cada consentimiento ofrece cinco acciones:

**Texto propuesto:**

> Según su estado, cada consentimiento ofrece estas acciones:

**Agregar como sexta acción de la lista, después de Cargar Archivo:**

> **Rechazar Documento**: descarta la firma o el archivo entregado cuando no es válido, por ejemplo si el paciente lo entregó sin firmar o se cargó el archivo equivocado. El documento vuelve a quedar **Pendiente** y se pueden usar otra vez **Copiar Enlace**, **Reenviar por Correo** o **Cargar Archivo**.

**Agregar después de la lista** el procedimiento:

> Para rechazar un consentimiento:
>
> 1. Abra la reserva y vaya a la pestaña **Documentos**.
> 2. En el consentimiento, presione **Rechazar Documento**.
> 3. Escriba el **Motivo** del rechazo. El campo es obligatorio.
> 4. Presione **Confirmar Rechazo**.
>
> Resultado: el consentimiento queda en estado Pendiente, sin firmas, y bajo su estado se muestra "Motivo de Rechazo:" seguido del motivo escrito. El enlace de firma anterior deja de funcionar; para que el paciente firme de nuevo, use **Copiar Enlace** o **Reenviar por Correo**.
>
> Advertencia: rechazar descarta la firma del paciente y, si existía, también la de la profesional. El rechazo queda registrado en la auditoría del documento con el motivo y la identidad de quien lo hizo.
>
> Nota: el botón **Rechazar Documento** aparece solo cuando el consentimiento ya tiene una firma o un archivo entregado, y solo mientras la cita no esté **Atendida**. Una vez que la cita se marca como Atendida, el rechazo deja de ofrecerse. Al rechazar no se envía ningún correo automático: el aviso al paciente lo hace la profesional al reenviarle el enlace.
>
> Nota: el motivo del rechazo se muestra solo mientras el documento sigue rechazado. Cuando el paciente vuelve a firmar o se carga el archivo en papel, la línea desaparece, y el motivo queda guardado en la auditoría.

**Agregar una captura nueva:** la ventana "Rechazar Documento", con el aviso naranja, el campo **Motivo** y los botones **Cancelar** y **Confirmar Rechazo**.

### M-36 · §4.3 Detalle de un Documento — Rechazar Documento y Motivo de Rechazo · **YA APLICA**

**Origen:** el mismo que M-35. Complementa M-24, que ya pide documentar que el detalle del documento tiene las acciones de firma.

**Agregar en §4.3, junto al texto de M-24:**

> En los consentimientos, el detalle también ofrece **Rechazar Documento**, con el mismo funcionamiento que en la pestaña Documentos de la reserva (ver subcapítulo 1.2.2).

**Sobre los Datos de la Atención** (cuyo texto ya actualizó M-06), agregar:

> Si un consentimiento fue rechazado y todavía no se ha vuelto a firmar, se muestra además el **Motivo de Rechazo**. Si el documento no está rechazado, esa fila no aparece.

### M-37 · §4.3.2 Auditoría del documento — mensajes legibles · **YA APLICA**

**Origen:** cambio del 22 de octubre (commits `df37a72` del backend y `fc46040` del frontend). Antes cada línea mostraba nombres técnicos de campos y valores, por ejemplo *"Modificacion, Especialista de prueba, … — Estado: Pendiente → Completado; ArchivoFirmadoRuta: se reemplazó el archivo; FirmaUsuarioId: — → 5"*. Ahora cada acción escribe una frase.

**Texto actual:**

> El botón Ver la Auditoría del Documento despliega el registro completo de lo que ha ocurrido con él. Cada línea indica la acción, quién la realizó y la fecha y hora exactas, desde su creación hasta cada lectura posterior.

**Texto propuesto:**

> El botón **Ver la Auditoría del Documento** despliega el registro completo de lo que ha ocurrido con él. Cada línea indica la fecha y hora, quién realizó la acción y qué hizo, por ejemplo: "18-10-2026 18:17, Franchesca Soto: Firmó como profesional". El registro va desde la creación del documento hasta cada lectura posterior.

**Agregar** una tabla con las frases que puede mostrar la auditoría:

> | Acción | Frase que muestra la auditoría |
> |---|---|
> | Creación del documento | "Creó el documento." |
> | Firma del paciente en línea | "El paciente firmó el documento en línea." |
> | Firma de la profesional | "Firmó como profesional." |
> | Carga del documento en papel | "Cargó el documento firmado en papel." |
> | Rechazo | "Rechazó el documento. Motivo: …" |
> | Nuevo enlace de firma | "Generó un nuevo enlace de firma." |
> | Reenvío por correo | "Reenvió el enlace de firma por correo." |
> | Edición de una ficha | "Editó el contenido de la ficha." |
> | Cierre de una ficha | "Cerró la ficha." |
> | Recomendación actualizada | "Actualizó la recomendación." o "Adjuntó una nueva recomendación en PDF." |
> | Bloqueo por cancelación de la cita | "Se bloqueó el documento. Cita cancelada." |
> | Apertura del detalle | "Abrió el documento." |
> | Apertura del archivo | "Abrió el archivo." |

**Conservar la Nota actual**, que sigue siendo correcta:

> Nota: toda apertura de un documento clínico queda registrada, incluida la propia. La auditoría no muestra direcciones IP ni datos técnicos: solo identidad, acción y momento.

**Agregar:**

> Nota: cuando la acción la ejecutó el sistema o el paciente desde su enlace de firma, la línea indica "Sistema" en lugar de un nombre. Los registros anteriores al 22 de octubre de 2026 conservan el formato con el que se guardaron.

**Reemplazar la Figura IV.2** (detalle de un documento con la auditoría desplegada) por una captura con el formato nuevo.

### M-38 · §4.1 Listado y Filtros — columna Fecha de Creación, orden y filtros · **YA APLICA**

**Origen:** pedido de Maxi del 22 de octubre (commits `df37a72` y `fc46040`).

**Texto actual:**

> La pantalla muestra el total de documentos generados y un listado de siete columnas: Documento, Tipo, Estado, Paciente, RUT, Especialista y Fecha de atención. El listado se pagina de diez en diez.

**Texto propuesto:**

> La pantalla muestra el total de documentos generados y un listado de ocho columnas: Documento, Tipo, Estado, Paciente, RUT, Especialista, Fecha de atención y **Fecha de Creación**, esta última con fecha y hora. El listado se ordena por fecha de creación, del documento más reciente al más antiguo, y se pagina de diez en diez.

**Texto actual del filtro:**

> Desde y Hasta: acotan por rango de fechas de atención.

**Texto propuesto:**

> **Desde** y **Hasta**: acotan por rango de **fechas de creación** del documento. Cada fecha incluye el día completo.

**Reemplazar la Figura IV.1** (listado de documentos con sus filtros) por una captura con la columna nueva.

### M-39 · §4.2 Estados de los Documentos — fila Pendiente · **YA APLICA**

**Origen:** el mismo que M-35.

**Texto actual de la fila Pendiente:**

> | Pendiente | El documento fue generado y espera que el paciente lo firme o que se cargue firmado. |

**Texto propuesto:**

> | Pendiente | El documento fue generado, o fue rechazado, y espera que el paciente lo firme o que se cargue firmado. También queda Pendiente un consentimiento que el paciente ya firmó y que todavía espera la firma de la profesional. |

### M-40 · §6.3.1 Catálogo de servicios — se eliminó la imagen del servicio · **YA APLICA**

**Origen:** decisión de Maxi del 19 de octubre (migración `EliminarImagenServicio`). La imagen del servicio nunca se usó en el sitio ni en el panel. Reemplaza a M-16.

**Texto actual:**

> Al editar un servicio se pueden definir su imagen, su nombre, su orden de presentación, su duración y su descripción. La imagen admite archivos PNG, JPG, WEBP o SVG de hasta 25 MB.

**Texto propuesto:**

> Al editar un servicio se pueden definir su nombre, su orden de presentación, su duración y su descripción.

Si alguna captura de §6.3 muestra el campo **Imagen del Servicio**, reemplazarla. Revisar también M-23, que dice que el límite de 25 MB "para imágenes" de §6.3.1 sigue siendo correcto: **ese límite ya no corresponde a esta sección**, porque los servicios no tienen imagen. Sigue valiendo para las fotos de la Landing y de las especialistas.

### M-41 · §5.3 Registrar un Cobro Manual — sin aviso de reparto, terminal y monto · **YA APLICA**

**Origen:** pedido de Maxi del 22 de octubre (commit `86845f3`) y correcciones del 19 de octubre (`0a68864`, `aa85942` y `ae0b3c0`).

**Eliminar la Precaución** que hoy cierra el procedimiento:

> Precaución: si deja el paciente vacío, el sistema advierte que "Esta venta no entra en el cálculo de reparto porque no está asociada a una atención". Úselo solo para cobros que realmente no correspondan a una atención agendada.

**El sistema ya no muestra ese aviso**, porque el módulo de reportes quedó fuera de la entrega.

**En el paso del terminal**, texto actual:

> Seleccione el Terminal POS utilizado.

**Texto propuesto:**

> Si el método de pago es Débito o Crédito, seleccione el **Terminal POS** utilizado. La lista muestra solo los terminales activos. En Efectivo y Transferencia no se pide terminal.

**Agregar después del paso del monto:**

> Nota: el monto se escribe tal como se cobró, por ejemplo 29.990. Debe ser mayor a cero; si no lo es, el sistema muestra "El monto debe ser mayor a cero".

**Agregar al final del subcapítulo:**

> Nota: si asocia la venta a una cita, la cita debe pertenecer al paciente seleccionado. El selector de citas solo ofrece las del paciente elegido.

### M-42 · Firma del consentimiento por el paciente — se firma sin leer hasta el final · **YA APLICA**

**Origen:** correcciones del 19 y el 20 de octubre (commits `a3e897e` y `8d034fb` del frontend). Reemplaza a M-25. El problema que apareció en la reunión del 6 de octubre era que, al presionar "Volver a firmar", la pestaña **Firmar** quedaba deshabilitada y el botón **Guardar** no se activaba.

El Manual de Usuario no describe la pantalla pública de firma, porque el sitio público está fuera de su alcance; lo que hay que reflejar es cómo se comporta, para que la profesional pueda orientar al paciente. Agregar en §1.2.2, después de la descripción de **Copiar Enlace**:

> Nota: al abrir el enlace, el paciente ve el documento con dos pestañas: **Leer**, para recorrerlo, y **Firmar**, para dibujar la firma con el dedo o el mouse. Puede pasar a Firmar en cualquier momento, sin necesidad de leer hasta el final, y el botón **Guardar** está siempre disponible. Si el paciente entrega el documento sin firmar o con una firma que no corresponde, la profesional lo revisa y, si corresponde, usa **Rechazar Documento**.

**Eliminar** del manual cualquier mención a la opción **Pantalla completa** de la pantalla de firma: se quitó. Tampoco aparece al firmar como profesional.

### M-43 · §3.3.2 Historial de Citas — botón Ver Reserva y fechas · **YA APLICA**

**Origen:** pedido de Maxi del 22 de octubre (commit `b3eacab`). Complementa M-12.

**Al texto propuesto en M-12 agregar**, al final:

> Cada línea tiene además el botón **Ver Reserva**, que cierra el detalle del paciente y abre la agenda en el día de esa cita, con su detalle a la vista.

**Sin cambio de texto, pero a tener en cuenta:** en las pestañas **Historial de Citas** y **Documentos** del detalle del paciente, las fechas se mostraban un día antes; por ejemplo, una cita del 19 de octubre aparecía como "18 oct". Se corrigió. Si alguna captura de §3.3.2 o §3.3.3 muestra una fecha corrida, reemplazarla.

### M-44 · §2.4.2 y §3.2 Registro de un paciente — el teléfono · **A DECIDIR**

**Origen:** hallazgo de las pruebas funcionales del 18 de octubre. Todavía no se decidió si se cambia el código.

El formulario de registro de un paciente permite guardarlo **sin teléfono**, pero la reserva manual exige RUT y teléfono, y responde con un mensaje pensado para el paciente: "Su perfil de paciente está incompleto. Por favor complete su RUT y teléfono en el perfil."

**Mientras no se decida**, conviene agregar en §2.4.2, después del paso del teléfono:

> Precaución: aunque el formulario permite registrar al paciente sin teléfono, no se puede crear una reserva para un paciente que no lo tenga. Complete siempre el teléfono.

### M-45 · Solución de Problemas — filas nuevas · **YA APLICA**

**Origen:** M-35 y M-41.

**Agregar estas filas a la tabla:**

> | El paciente entregó el consentimiento sin firmar o con una firma que no corresponde | El sistema acepta la entrega tal como llega; la revisión la hace la profesional. | Abra el consentimiento y use **Rechazar Documento** indicando el motivo. Después envíele un enlace nuevo con **Copiar Enlace** o **Reenviar por Correo**. |
> | No aparece el botón Rechazar Documento | La cita ya está Atendida, o el documento todavía no tiene una firma ni un archivo entregado. | Revise el estado de la cita y del documento. Una vez que la cita se marca como Atendida, el rechazo deja de ofrecerse. |
> | El enlace de firma que tenía el paciente dejó de funcionar | Se emitió un enlace nuevo o el documento fue rechazado. | Envíele el enlace vigente con **Copiar Enlace** o **Reenviar por Correo**. |
> | Un terminal no aparece al registrar un cobro | El terminal está desactivado. | Actívelo en Ventas → **Tarifas / POS** → Máquinas POS. |

### M-46 · Glosario — término nuevo · **YA APLICA**

**Origen:** M-35.

**Agregar a la tabla del Glosario:**

> | Rechazo de documento | Acción de la profesional que descarta la firma o el archivo entregado de un consentimiento y lo devuelve a Pendiente, con un motivo que queda en la auditoría. |

---

### Manual del Sistema

### S-05 · §2.4.1 Enrutamiento y §2.8 Decisiones de Arquitectura — parámetros de URL con la History API · **YA APLICA**

**Origen:** corrección del 19 de octubre (commit `c0f97c9` del frontend).

En Next.js 16.2.9, después de cargar directamente una página con parámetros de búsqueda (por ejemplo `/panel/documentos?documento=239`), `router.push` y `router.replace` hacia la **misma ruta** con otros parámetros no navegaban. Eso dejaba sin funcionar el botón Cerrar de los detalles, Anterior y Siguiente en la agenda y las pestañas de Configuración tras una recarga.

**Agregar en §2.4.1:**

> Los detalles que se abren como ventana dentro de una pantalla se controlan con parámetros de la URL: `fecha`, `cita` y `cancelar` en la agenda, `documento` en Documentos, `paciente` en Pacientes y `tab` en Configuración. Esos parámetros se cambian con `window.history.pushState` o `window.history.replaceState`, que Next.js sincroniza con `useSearchParams`, y no con `router.push`. Las navegaciones a otra ruta siguen usando `router.push`.

**Agregar una fila a la tabla de §2.8:**

> | Los cambios de parámetros dentro de una misma ruta usan la History API del navegador. | En Next.js 16.2.9, `router.push` a la misma ruta no navega después de una carga directa con parámetros. | Al actualizar Next.js se puede revisar si el error se corrigió y volver a `router.push`, probando antes el caso de la recarga. |

### S-06 · §2.4.1 y §2.4.3 — menú sin Reportes ni Mi Perfil · **YA APLICA**

**Origen:** M-31 (commit `a6b04b1` del frontend).

El menú lateral ya no ofrece Reportes ni Mi Perfil. Las páginas `/panel/reportes` y `/panel/perfil` **siguen existiendo** y se abren si se escribe la ruta a mano; `proxy.ts` sigue reservando `/panel/reportes` al rol Administrador.

**En §2.4.3, texto actual:**

> … y reserva las rutas /panel/especialistas y /panel/landing al rol Administrador.

**Texto propuesto:**

> … y reserva las rutas /panel/especialistas, /panel/landing y /panel/reportes al rol Administrador. Las páginas /panel/reportes y /panel/perfil existen, pero no tienen enlace en el menú: el módulo de reportes quedó fuera de la entrega.

**En la tabla de grupos de rutas de §2.4.1**, en la fila `(panel)`, el texto *"Panel de Administración: agenda, nueva reserva, pacientes, documentos, ventas, configuración y perfil."* debe decir *"Panel de Administración: agenda, nueva reserva, pacientes, documentos, ventas y configuración."*

### S-07 · §2.7 Inventario de Controladores — endpoint nuevo y cifras · **YA APLICA**

**Origen:** M-35 y M-41.

**Texto actual:**

> La API expone 122 endpoints en 26 controladores.

**Texto propuesto:**

> La API expone 123 endpoints en 26 controladores.

**En la tabla de controladores**, la fila **Documento** pasa de 34 a **35** endpoints, por `POST /api/documentos/{id}/rechazar`.

**Fila TerminalPago:** `GET /api/terminales` acepta ahora el parámetro opcional `soloActivos`, que por omisión vale `false` y devuelve todos los terminales; el modal de cobro lo usa con `true`. Además, ese controlador expone hoy **cuatro** endpoints (listar, crear, editar y cambiar estado) y no dos como dice la tabla: la cifra ya estaba desactualizada antes de esta ronda. Si se corrige esa fila, el total de la API sube a 125; conviene recontar los atributos `[Http…]` de los controladores antes de escribir la cifra final.

**En la tabla de endpoints que sostienen los flujos críticos**, agregar:

> | POST /api/documentos/{id}/rechazar | Personal | Rechazo de un consentimiento entregado, con motivo. |

### S-08 · §3.3.2 Personas y Catálogo — tabla servicios · **YA APLICA**

**Origen:** M-40. Migración `20261019003317_EliminarImagenServicio`.

**Eliminar estas dos filas** del diccionario de la tabla `servicios`:

> | imagen_alt | text | Sí | | Texto alternativo de la imagen. |
> | imagen_public_id | text | Sí | | Identificador público de la imagen en Cloudinary. |

**En §6.7.5 Cloudinary**, verificar que no se diga que Cloudinary aloja imágenes de servicios: aloja las de la portada, la Landing y las especialistas.

### S-09 · §3.3.3 Documentos Clínicos — columna motivo_rechazo · **YA APLICA**

**Origen:** M-35. Migración aditiva `20261022212209_AgregarMotivoRechazoConsentimiento`.

**Agregar al diccionario de la tabla `documentos`**, en orden alfabético, después de `motivo_cierre`:

> | motivo_rechazo | text | Sí | | Consentimiento: motivo del último rechazo. Se guarda al rechazar y se vacía cuando el paciente vuelve a firmar o se carga el archivo en papel. |

### S-10 · §3.6 Migraciones y §2.3.4 — cantidad y última migración · **YA APLICA**

**Origen:** las migraciones agregadas desde el 11 de septiembre.

**Texto actual de §3.6:**

> El historial del esquema está en 62 migraciones, en src/Infrastructure/Data/Migrations, desde InitialCreate, del 30 de junio de 2026, hasta AddEmbarazadasToLandingConfig, del 11 de septiembre de 2026.

**Texto propuesto:**

> El historial del esquema está en 67 migraciones, en src/Infrastructure/Data/Migrations, desde InitialCreate, del 30 de junio de 2026, hasta AgregarMotivoRechazoConsentimiento, del 22 de octubre de 2026.

**En §2.3.4**, el texto *"el sembrador inicial y las 62 migraciones"* debe decir **67**.

Las cinco migraciones posteriores a `AddEmbarazadasToLandingConfig` son, en orden:

| Migración | Fecha | Qué hace |
|---|---|---|
| `QuitarVigenciaConsentimiento` | 27-09-2026 | Quita `vigencia_dias` de `servicios_documento` (ya registrada en S-04) |
| `AddOrdenToEspecialista` | 10-10-2026 | Agrega el orden de presentación de las especialistas |
| `AddNutricionToLandingConfig` | 11-10-2026 | Agrega la sección de nutrición del sitio público |
| `EliminarImagenServicio` | 19-10-2026 | Quita `imagen_alt` e `imagen_public_id` de `servicios` |
| `AgregarMotivoRechazoConsentimiento` | 22-10-2026 | Agrega `motivo_rechazo` a `documentos` |

`EliminarImagenServicio` **no es aditiva**: borra dos columnas. Se aplicó porque estaban vacías en test y en producción.

### S-11 · §4.4 Generación de Agenda — bloques retirados y agenda sin horario fijo · **YA APLICA**

**Origen:** corrección del 19 de octubre (commits `f23ff58` del backend y `2d30ede` del frontend).

**Texto actual (fragmento):**

> Es idempotente: no modifica los bloques existentes que siguen correspondiendo, elimina los Disponible que ya no corresponden y reporta como conflicto los Reservado que quedaron fuera del horario, sin borrarlos, para que el personal los resuelva.

**Texto propuesto:**

> Es idempotente: no modifica los bloques existentes que siguen correspondiendo y reporta como conflicto los Reservado que quedaron fuera del horario, sin borrarlos, para que el personal los resuelva. Los Disponible que ya no corresponden se eliminan, salvo que alguna cita los referencie por `citas.bloque_horario_id`, por ejemplo una cita cancelada: esos no se pueden borrar y se **retiran**, es decir, pasan a Bloqueado sin bloqueo asociado. Un bloque retirado no se ofrece en la reserva ni aparece en la agenda del panel, y vuelve a quedar Disponible si el horario lo cubre de nuevo.

**Por qué importa:** antes, borrar o achicar un tramo de plantilla cuando había una cita cancelada en ese horario producía un error 500, y los bloques seguían Disponible y reservables desde el sitio público. Como la generación diaria corre para todas las especialistas a la vez, ese error también la cortaba.

**Agregar en §2.4.2, o donde se describa la agenda del frontend:**

> La agenda del panel se dibuja exclusivamente con los bloques que devuelve `GET /api/agenda`: agrupa en una tarjeta los bloques seguidos de una misma cita y en una sola fila los bloqueados contiguos. El frontend no tiene horarios propios: el horario del centro y la plantilla de cada especialista, que viven en el backend, determinan qué se muestra. El formulario de bloqueos pide las horas con campos de hora y el backend aplica el bloqueo a los bloques que se cruzan con el rango.

### S-12 · §4.3 Reserva Manual — horario de la cita en el detalle y el listado · **YA APLICA**

**Origen:** corrección del 19 de octubre (commit `3c5a708` del backend).

El detalle (`GET /api/citas/{id}`) y el listado (`GET /api/citas`) devolvían la fecha y la hora del **primer bloque** de la cita, por lo que una cita de 60 o 90 minutos aparecía como de 30. Ahora devuelven `citas.fecha`, `citas.hora_inicio` y `citas.hora_fin`, que se fijan al crear la cita a partir de su primer y su último bloque y se conservan aunque la cita termine cancelada o atendida.

**Agregar en §4.3:**

> El rango horario de una cita se lee siempre de sus columnas `fecha`, `hora_inicio` y `hora_fin`, no del bloque inicial ni de `citas_bloques`, cuyas filas se eliminan cuando la cita pasa a un estado que libera sus bloques.

### S-13 · §4.5 Consentimientos y Firma Pública — rechazo y firma sin bloqueos · **YA APLICA**

**Origen:** M-35 y M-42.

**Agregar al final de §4.5:**

> Un consentimiento entregado se puede rechazar con `POST /api/documentos/{id}/rechazar` y un motivo obligatorio de hasta 500 caracteres. Solo puede hacerlo la especialista de la cita o el administrador, y solo si el documento está Completado o Pendiente con la firma del paciente y la cita no está Atendida. En cualquier otro caso la API responde 422, con `CITA_ATENDIDA` o `NO_RECHAZABLE`. La respuesta del consentimiento y del detalle del documento incluye `puedeRechazarse`, calculado en el backend, y el panel solo muestra el botón cuando vale `true`.
>
> Al rechazar, el documento vuelve a Pendiente con origen Firmado, y se vacían la firma del paciente (fecha e IP), la firma de la profesional, las referencias a los PDF firmados y al archivo en papel, y el contenido llenado por el paciente. También se vacía el token de acceso: sin eso, el enlace anterior volvería a funcionar, porque su marca de uso se reinicia. El motivo queda en `motivo_rechazo` y en la auditoría. Los archivos rechazados no se borran del volumen de adjuntos; solo dejan de estar referenciados.
>
> `motivo_rechazo` se vacía cuando el paciente vuelve a firmar en línea o cuando se carga el archivo en papel.

**Sobre la firma pública, reemplazar lo que el manual diga sobre leer antes de firmar** por:

> La pantalla pública de firma tiene dos modos, Leer y Firmar, para que en el celular el dedo pueda recorrer el documento o dibujar la firma. El paciente puede pasar a Firmar en cualquier momento y el botón Guardar está siempre habilitado: si no dibuja, se entrega el PDF sin trazos y la revisión queda a cargo de la especialista, que puede rechazarlo. Los pasos Firmar y Revisar usan cada uno su propia instancia del visor, para que "Volver a firmar" empiece con el lienzo limpio. La opción de pantalla completa se eliminó.

### S-14 · §4.6 Notificaciones por Correo y §6.7.4 Resend — una plantilla HTML por tipo · **YA APLICA**

**Origen:** cambios del 19 y el 22 de octubre (commits `ee1b19d` y `21b6c3a` del backend). Complementa S-02, que sigue PENDIENTE.

**Texto actual de §6.7.4:**

> Envía los correos al paciente. EmailService usa el cliente oficial de Resend con ResendAPIKey y el remitente EmailConfiguration:From, cuyo dominio debe estar verificado en Resend. El cuerpo se arma con la plantilla Templates/Email/Notificacion.html. Una falla no afecta a las reservas: la notificación queda pendiente y se reintenta como se explica en la sección 4.6.

**Texto propuesto:**

> Envía los correos al paciente. EmailService usa el cliente oficial de Resend con ResendAPIKey y el remitente EmailConfiguration:From, cuyo dominio debe estar verificado en Resend, y solo envía el HTML que recibe. El HTML lo arma NotificacionService con una plantilla por tipo de notificación, ubicada en src/Application/Templates/Email y copiada a la salida de la compilación y de la publicación. Una falla no afecta a las reservas: la notificación queda pendiente y se reintenta como se explica en la sección 4.6.

**Agregar en §4.6 una tabla** con los cinco tipos de correo:

> | Tipo | Plantilla | Asunto | Cuándo se encola |
> |---|---|---|---|
> | Confirmacion | Confirmacion.html | Tu cita en KineFit está confirmada | Cuando la cita pasa a Confirmada, por el pago web o por el personal. |
> | Recordatorio | Recordatorio.html | Recordatorio de tu cita en KineFit | Notificaciones:AntelacionRecordatorioHoras antes de una cita confirmada (24 por omisión), si se reservó con más antelación que esa. |
> | CambioEstado | CambioEstado.html | Actualización sobre tu cita en KineFit | Cuando el personal marca la cita como Cancelada o No Asistida. |
> | DocumentoParaFirma | DocumentoParaFirma.html | Documentos por firmar antes de tu cita en KineFit | Al generarse los consentimientos de la cita (momento TrasConfirmarReserva) y al usar Reenviar por Correo. |
> | DocumentoPostAtencion | DocumentoPostAtencion.html | Documentos de tu atención en KineFit | Al marcar la cita Atendida si el servicio tiene consentimientos AlFinalizarAtencion, y al enviar una recomendación. |

**Agregar en §4.6:**

> Las plantillas usan los marcadores {{ASUNTO}}, {{NOMBRE}} (nombre del paciente), {{SERVICIO}}, {{ESPECIALISTA}}, {{FECHA}} (dd-MM-yyyy), {{HORA}} (HH:mm), {{ESTADO}} (texto de la cancelación o de la inasistencia), {{NOTA}} (la nota para el paciente, solo en la confirmación) y {{ENLACES}} (una fila por documento, con el botón "Firmar" o "Ver Documento"). Los valores se escapan como HTML. El logo, la dirección, el teléfono y el correo del centro están escritos directamente en cada plantilla: si cambian, hay que editar los cinco archivos. El estilo sigue al del panel: fuente Roboto, azul de marca #0c5dc5, textos en tonos slate y tablas con estilos en línea para que Gmail y Outlook las muestren bien.
>
> Si un correo falla al armarse, por ejemplo porque falta su plantilla, se registra como un envío fallido de esa notificación, con los mismos reintentos, y el proceso continúa con las demás. Antes, una excepción al armar un correo cortaba el ciclo y dejaba sin enviar todas las notificaciones que venían detrás.

**Agregar como limitación conocida:**

> Nota: el correo de recomendación se encola con el nombre de la recomendación y sin enlace, porque el paciente no tiene una página donde verla. El correo le avisa que hay una recomendación, pero no le entrega su contenido.

**Eliminar** toda mención a `Notificacion.html`: el archivo se borró.

### S-15 · §4.9 Venta y Reparto — validaciones nuevas · **YA APLICA**

**Origen:** M-41. Commit `ae0b3c0` del backend.

**Agregar al final de §4.9:**

> Cada ítem de una venta debe tener un monto mayor a cero; si no, la API responde 400 con "El monto debe ser mayor a cero". El total puede quedar en cero solo si un convenio descuenta el 100 % del servicio. Si la venta trae una cita y un paciente, la cita debe pertenecer a ese paciente; si no, la API responde 422 con `CITA_DE_OTRO_PACIENTE`. Una cita puede tener más de una venta, por ejemplo una propina o un producto cobrado aparte: no hay restricción de unicidad. El terminal debe estar activo.

**Agregar donde se describa el modal de cobro del frontend:**

> El frontend no valida el monto, porque no tiene mínimo ni escalón, y muestra el mensaje de error que devuelve la API.

### S-16 · §5.5 Auditoría y Trazabilidad — frases para los documentos · **YA APLICA**

**Origen:** M-37. Commit `df37a72` del backend.

**Agregar en §5.5, después del párrafo sobre IAuditReasonContext:**

> Las acciones sobre documentos clínicos (firma del paciente y de la profesional, carga en papel, rechazo, emisión y reenvío del enlace, edición y cierre de fichas, actualización de recomendaciones y bloqueo por cancelación) dejan una frase descriptiva en IAuditReasonContext antes de guardar. Cuando la entidad modificada es un Documento y hay una frase, el interceptor la usa como detalle del evento en lugar de la lista de cambios por campo; las demás entidades vigiladas siguen registrando esa lista. Las lecturas de documentos registran "Abrió el documento." o "Abrió el archivo.". El panel muestra cada evento como "fecha, actor: detalle", y si el evento no tiene detalle, como en las creaciones, muestra la acción en español.

### S-17 · Listado de documentos — orden y filtro por fecha de creación · **YA APLICA**

**Origen:** M-38. Commit `df37a72` del backend.

**Agregar donde se documente `GET /api/documentos`** (por ejemplo, junto a la descripción de la tabla `documentos` en §3.3.3 o en el flujo de §4.5):

> El listado se ordena por `created_at` descendente y luego por `id`. Los filtros `fechaDesde` y `fechaHasta` se aplican sobre `created_at`, tomando el día completo en hora de Chile (`ChileTimeZone.InicioDiaUtc`). Cada documento de la respuesta incluye `createdAt`. El historial de documentos del paciente (`GET /api/documentos/pacientes/{id}/historial`) mantiene el orden por fecha de atención.

### S-18 · §8.1 Pruebas Automatizadas del Backend — cifras y prueba que depende del día · **YA APLICA**

**Origen:** pruebas agregadas desde el 24 de septiembre.

**Texto actual:**

> La suite tiene 24 clases con 124 métodos de prueba.

**Texto propuesto:**

> La suite tiene 25 clases con 137 métodos de prueba, que suman 220 casos al expandir las pruebas parametrizadas.

**Agregar como Nota:**

> Nota: la prueba `Fase8Tests.UnBloqueoConMostrarEnSitio_ExponeElMotivoPublico_NuncaElMotivoInterno` usa una fecha fija a 730 días y bloquea las 09:00. Cuando esa fecha cae en sábado o domingo falla, porque el fin de semana el centro abre a las 10:00 y ese bloque no existe. Es un defecto de la prueba, no del sistema.

Pruebas nuevas de esta ronda: `RechazarDocumento` y `RechazarCitaAtendida` en `DocumentoPacienteTests`, `CobroPacienteAjeno` en `ReportesTests` y `VentaMontoCero` en `VentasYComisionesTests`.

### S-19 · §6.6 Configuración por Entorno — ancho de las imágenes · **YA APLICA**

**Origen:** commit `9d2f442` del backend, que subió el tope de las imágenes a 2560 px.

**En la tabla de configuración por entorno**, la fila de `Imagenes:TransformationWidth` dice 1600. El valor actual en `appsettings.json` y `appsettings.example.json` es **2560**:

> | Imagenes:TransformationWidth | 2560 | 2560 | Ancho al que Cloudinary ajusta las imágenes. |

### S-20 · §4.8 Inicio de Sesión del Paciente — vinculación por RUT · **A DECIDIR**

**Origen:** hallazgo del 19 de octubre. Maxi lo dejó pendiente.

El login con Google vincula una cuenta nueva a un paciente registrado a mano **solo con el RUT**, sin verificar el correo: quien conozca el RUT de un paciente que todavía no tiene cuenta puede quedarse con su registro y ver su historial de citas. La reserva en línea está desactivada (`reservasHabilitadas = false`), así que hoy el riesgo se limita a quien llame a la API directamente.

**No se escribe nada en el manual hasta que se decida.** Las opciones conversadas son: (a) rechazar `POST /api/auth/google` mientras la reserva en línea esté desactivada; (b) dejar de vincular por RUT y vincular solo por correo verificado; (c) verificar con un código enviado al correo registrado del paciente, que depende de S-02. Cuando se decida, actualizar S-01 y §4.8.

---

### Sin impacto en manuales (ronda de octubre)

| Cambio | Por qué no aplica |
|---|---|
| Enlace "Reserva" del sitio público a `#` (commit `99b256a`) | El sitio público está fuera del alcance de los dos manuales |
| Diseño de las plantillas de correo (fuente Roboto, mayúsculas por palabra) | Ya incluido en S-14; el Manual de Usuario no muestra los correos |
