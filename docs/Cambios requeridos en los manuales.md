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

Los **YA APLICA** son los urgentes: hoy el manual dice algo que el sistema no hace.

---

## Resumen

*Contado con expresión regular sobre las cabeceras de este archivo, no a ojo, el 2026-09-28.*

| Manual | YA APLICA | PENDIENTE | A DECIDIR | Total |
|---|---|---|---|---|
| Manual de Usuario | 19 | 10 | 1 | 30 |
| Manual del Sistema | 2 | 2 | 0 | 4 |

**34 secciones a actualizar en total.** Ninguna espera código: todas se pueden escribir hoy.

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

### M-16 · §6.3.1 Catálogo de servicios — quitar SVG · **PENDIENTE**

**Origen:** decisión 7 = b.

El sistema acepta **solo JPEG, PNG y WebP**: `FileService.EsImagenValida` valida por contenido y no reconoce SVG. El manual promete un formato que se rechaza.

**Texto actual:**

> La imagen admite archivos PNG, JPG, WEBP o SVG de hasta 25 MB.

**Texto propuesto:**

> La imagen admite archivos PNG, JPG o WEBP de hasta 25 MB.

### M-17 · "El menú lateral" — faltan dos ítems · **PENDIENTE**

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

> El RUT solo vincula una cuenta nueva cuando la ficha **todavía no tiene una asociada**, que es el caso de la ficha creada por recepción en una atención presencial. Si la ficha ya tiene cuenta, el login se rechaza con `RUT_CON_OTRA_CUENTA` y se le indica al paciente que se acerque al centro. El reemplazo de cuenta —el paciente que cambió de correo— lo autoriza el personal desde la ficha, con la persona presente (ver M-27).

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

### M-25 · §4.4 Firmar un consentimiento — leer antes de firmar · **PENDIENTE**

**Origen:** S-xx del 2026-09-26, ajustado el 2026-09-27.

El documento que firma **el paciente** se abre en modo Leer y la pestaña Firmar se habilita al llegar al final. **La profesional no pasa por eso**: entra directo a firmar. El manual tiene que decir cuál es cuál, porque si no parece que la función está fallando.

> Al paciente, el documento se le abre en modo Leer y el botón Firmar se habilita cuando llega al final. La profesional, en cambio, entra directamente en modo firma.

### M-26 · §5.x Recomendaciones — cuando el servicio no tiene una estándar · **PENDIENTE**

**Origen:** PF-236.

Al marcar una cita como Atendida **siempre** se pregunta si se envía una recomendación. Lo que cambia es que, si el servicio no tiene una estándar configurada, esa opción no se ofrece y queda solo la personalizada.

> La pregunta aparece en toda cita que se marca como Atendida. Si el servicio no tiene una recomendación estándar configurada, la única opción disponible es armar una personalizada.

### M-27 · §2.x Ficha del Paciente — Desvincular Cuenta · **PENDIENTE**

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
