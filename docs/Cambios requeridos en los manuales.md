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

| Manual | YA APLICA | PENDIENTE | A DECIDIR | Total |
|---|---|---|---|---|
| Manual de Usuario | 4 | 11 | 1 | 16 |
| Manual del Sistema | 1 | 2 | 0 | 3 |

**Los cinco YA APLICA:** M-01 y M-02 (razones por las que falta un horario), M-06 (datos de creación del documento), M-19 (historial de la cita) y S-01 (vinculación por RUT en el login del paciente).

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

### M-03 · §4.5.3 Tipos de campo — quitar la fila "Firma" · **PENDIENTE**

**Origen:** decisión 1 = A (manda la plantilla). S-19, PF-114.

El tipo de campo `Firma` se elimina porque es redundante: la firma se resuelve estampando el trazo sobre el PDF, y ese campo no se renderiza ni se guarda en ninguna vista.

**Fila a eliminar de la tabla de siete tipos:**

> | Firma | Un recuadro para firmar, sea del paciente o de la profesional. |

La tabla queda con **seis** tipos. Hay que ajustar también la frase introductoria, que hoy dice *"Cada campo de una plantilla es de uno de estos siete tipos"* → **seis**.

**Y agregar**, al final del subcapítulo, una aclaración de dónde quedó la firma:

> Nota: las firmas no se declaran como campos. Se activan con los interruptores de **Firmas Requeridas** al crear la plantilla, y el recuadro se presenta al pie del documento.

### M-04 · §4.4.2 Paso 2: Completar la ficha · **PENDIENTE**

**Origen:** decisión 2 = c (campos editables con distintivo). S-18, PF-113.

Hoy el manual dice solo *"Complete los campos. Los obligatorios impiden guardar si quedan vacíos."*, sin mencionar que cada campo indica quién lo completa.

**Agregar después de ese paso:**

> Cada campo muestra quién debe completarlo: **La profesional** o **El paciente**. Los marcados como del paciente se pueden completar igualmente desde el panel —por ejemplo, si la profesional los pregunta durante la atención—, pero la marca indica a quién corresponden en el formato original.

### M-05 · §4.3 Detalle de un Documento — aviso de privacidad · **PENDIENTE**

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

### M-07 · §4.3.1 Archivo y adjuntos · **PENDIENTE**

**Origen:** S-09, H-023.

**Agregar** al final del subcapítulo:

> Nota: un documento cerrado, bloqueado o anulado no admite nuevos adjuntos. En ese caso el sistema no ofrece la acción **Adjuntar**.

### M-08 · §4.5.1 Catálogo de plantillas · **PENDIENTE**

**Origen:** S-22, H-027.

**Texto actual:**

> Nota: una plantilla que ya tiene documentos generados no se elimina, para no dejar esos documentos sin su formato de origen. Si no quiere seguir usándola, desactívela.

**Texto propuesto:**

> Nota: una plantilla se puede eliminar **solo mientras no tenga documentos generados con ella**. En cuanto se emite el primer documento, la eliminación deja de ofrecerse, para no dejar ese documento sin su formato de origen. Si no quiere seguir usándola, desactívela.

### M-09 · §4.5.2 Crear o editar una plantilla — Advertencia · **PENDIENTE**

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

### M-11 · §5.5.1 Máquinas POS · **PENDIENTE**

**Origen:** decisión 3 = c. S-21, H-026.

Hoy el manual solo describe agregar un terminal.

**Agregar** después de *"Para sumar un terminal, presione Agregar POS y complete sus datos y comisiones"*:

> Para retirar un terminal de uso, desactívelo con su interruptor **Activo / Inactivo**. Un terminal inactivo deja de ofrecerse al registrar cobros nuevos, y las ventas ya registradas con él conservan su cálculo.
>
> El nombre, las notas y el plazo de abono de un terminal se pueden editar en cualquier momento.
>
> Advertencia: las comisiones no se editan. Al igual que los acuerdos de reparto y la tasa de impuesto, funcionan por versiones con fecha de vigencia, de modo que cada venta conserva la comisión que estaba vigente el día en que se registró.

### M-12 · §3.3.2 Historial de Citas · **PENDIENTE**

**Origen:** decisión 9 = a. S-03, PF-092.

**Texto actual:**

> Cada línea indica la fecha y el rango horario, el servicio, la profesional que atendió y el estado en que quedó la cita.

**Texto propuesto:**

> Cada línea indica la fecha y el rango horario, el servicio, la profesional que atendió, el estado en que quedó la cita y **si ya tiene ficha clínica registrada**.

### M-13 · §3.3.3 Documentos del Paciente · **PENDIENTE**

**Origen:** S-23, PF-178.

**Texto actual:**

> Cada línea muestra el nombre del documento, su tipo y su fecha, con el botón Ver Documento para abrirlo.

**Texto propuesto:**

> Cada línea muestra el nombre del documento, su tipo, **su estado** y su fecha, con el botón Ver Documento para abrirlo.

### M-14 · §6.2 Especialistas — Precaución · **PENDIENTE** · ⚠ HOY ESTÁ EQUIVOCADA

**Origen:** S-11, PF-147. **Este no es un cambio por una mejora: el texto actual manda al lugar equivocado.**

La causa más frecuente de que una profesional no aparezca en el paso 3 **no** son los servicios habilitados, sino que no tenga plantilla horaria cargada. Sin plantilla no se generan bloques de agenda, y sin bloques no aparece nunca, tenga los servicios que tenga.

**Texto actual:**

> Precaución: los servicios habilitados aquí determinan en qué reservas aparece la profesional. Si no la ve en el paso 3 del asistente de reserva, revise primero esta pestaña.

**Texto propuesto:**

> Precaución: para que una profesional aparezca en el paso 3 del asistente de reserva se deben cumplir dos condiciones. Primero, tener su **plantilla horaria** cargada en Configuración → Horarios: sin horario no se generan bloques de agenda y no aparecerá nunca. Segundo, tener habilitado el servicio de la reserva en esta pestaña. Si no la ve, revise el horario antes que los servicios.

**Y agregar**, junto al aviso de "Sin cuenta de acceso":

> Si una integrante aún no tiene horario cargado, su tarjeta lo advierte con el enlace **Sin horario cargado, configurar**.

### M-15 · Solución de Problemas — fila "No aparece ninguna profesional en el paso 3 de la reserva" · **PENDIENTE**

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

**Y dejar constancia de la consecuencia**, que es una decisión consciente y no un descuido (informe §16.3):

> Cuando el RUT corresponde a un paciente que ya tiene otra cuenta de Google asociada, el sistema **transfiere** la vinculación a la cuenta nueva en lugar de rechazarla. Es el comportamiento que exige RF-NRV-038 para el caso de un paciente que cambió de correo. Como efecto, el RUT opera como identificador de acceso: quien lo conozca puede asociar ese paciente a su propia cuenta de Google. El alcance está acotado a las citas y al perfil del paciente; los documentos clínicos no son accesibles con un token de paciente.

### S-02 · §6.7.4 Resend · **PENDIENTE**

**Origen:** S-13, los 7 casos de correo.

La sección no menciona el requisito que hizo fallar los siete casos.

**Agregar:**

> Resend exige que el dominio del remitente esté verificado en su panel, con los registros DKIM y SPF publicados en el DNS. Un envío desde un dominio no verificado se rechaza con 403 y la notificación queda en estado `Fallida` tras agotar los reintentos, sin ningún aviso en la interfaz.
>
> El dominio de envío oficial es **kinefitchile.com**. La clave `EmailConfiguration:From` debe usar una dirección de ese dominio en todos los entornos.

### S-03 · §3.3.3 Documentos Clínicos · **PENDIENTE**

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
