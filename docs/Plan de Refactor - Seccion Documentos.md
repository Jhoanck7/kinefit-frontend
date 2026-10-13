# Plan de refactor — Sección "Documentos"

> **Fuente de verdad:** `Flujo Seccion Documentos - Refactor de Seccion Fichas Clinicas.md`. Ante cualquier diferencia entre este plan y ese diagrama, manda el diagrama.
>
> Este documento describe **qué** hay que hacer y **por qué**, no el código.

---

## 0. El cambio conceptual que ordena todo el refactor

**Documento es la entidad general.** Ficha, Consentimiento y Recomendación son **tipos** de documento, no entidades paralelas. Hoy el sistema trata la ficha clínica como modelo principal y el documento del paciente como algo aparte; esa separación es el origen de la mayoría de los problemas de esta sección.

Consecuencia directa: **el tipo se elige primero**, antes de construir nada, y determina todo el flujo posterior. Un mismo tipo no puede vivir en dos lugares distintos con dos comportamientos distintos.

### Plantilla ≠ registro

- **Plantilla**: el molde reutilizable (lo que hoy se llama "formato"). Sin paciente, sin cita.
- **Registro**: el documento concreto de un paciente en una cita.

Se renombra "Formato" a **"Plantilla"** en toda la interfaz. La sección Documentos lista **registros**; las plantillas se administran aparte.

### Reglas por tipo

| | **Consentimiento** | **Ficha** | **Recomendación** |
|---|---|---|---|
| Quién lo completa | El paciente (firma) | El especialista | Nadie: se envía |
| Cuándo nace | Al confirmarse la reserva | Cuando el especialista lo registra | Al marcar la cita como atendida |
| Requiere firma | Sí, del paciente; del profesional si la plantilla lo pide | No | No |
| Editable | No, una vez firmado | Sí, mientras sea borrador | No aplica |
| Cómo se cierra | Firma digital o carga en papel | El especialista lo cierra explícitamente | Al enviarse |

**Todo documento cuelga de una cita.** El consentimiento de tratamiento de datos que se acepta al registrarse con Google **no** es un Documento de este modelo: vive en el registro del paciente.

---

## 1. Lo ya implementado (no rehacer)

Trabajo cerrado y verificado en la sesión previa:

- **La descarga entrega el documento firmado**, no el original en blanco. Se corrigió la prioridad de archivos: firmado digitalmente → escaneado en papel → original de la plantilla. Aplicado también en la ruta pública.
- **El filtro por tipo del listado de fichas funciona.** Antes enviaba el nombre libre de la plantilla y el backend descartaba el filtro en silencio; ahora envía la categoría.
- **El importador de PDF permite exigir firma del profesional.** Antes todo PDF importado quedaba sin exigirla.
- **Validación de paginación en los nueve endpoints paginados.** Tope máximo de 50 por página, recorte silencioso, con la regla viviendo en el tipo de parámetros y no en cada servicio. La exportación a CSV sigue pudiendo pedir el listado completo.
- **Vista SQL unificada** sobre fichas y documentos de paciente, con clave compuesta por origen (`FIC-3` / `DOC-3`) para resolver la colisión de identificadores, más entidad de solo lectura y migración.
- **Endpoint de listado unificado** con búsqueda, tipo, estado, fechas y especialista, con el acotamiento de acceso y la traza de acceso a datos clínicos.
- **Servicio y controlador unificados** bajo `Documento`, reemplazando la familia `DocumentoPaciente`.
- **Fábrica de diseño de EF corregida**: lee la configuración real del proyecto en vez de una cadena de conexión fija.

---

## 2. Cambios de reglas de negocio pendientes

### 2.1 Visibilidad entre especialistas — cambia respecto de hoy

**Nueva regla:** un especialista **lee los registros de todos**, pero **crea y edita solo lo suyo**. No puede crear ni modificar en nombre de otro, incluidas las citas.

**Atención:** esto contradice un requisito numerado del proyecto (el 7.11, citado en comentarios del código: *"una especialista solo ve los documentos de las atenciones que realizó"*). Es un cambio deliberado, no un descuido, y conviene que quede registrado como tal por si alguien audita después.

Afecta al listado unificado, al detalle de un documento y al historial por paciente.

### 2.2 El tipo se elige al crear la plantilla

Al crear una plantilla, la primera pregunta es el tipo. De ahí en adelante:

- Una plantilla de tipo **Consentimiento** solo puede usarse en el circuito de firma del paciente.
- El asistente de registrar ficha **solo ofrece plantillas de tipo Ficha**.
- El backend debe **rechazar** que una ficha se registre con un tipo que no le corresponde, no solo esconder la opción en pantalla.

### 2.3 Ciclo de vida de la ficha: borrador y cierre

- Se puede registrar desde que la cita está **Confirmada** (hoy exige Atendida).
- Nace como **borrador editable**.
- El especialista la **cierra explícitamente**, con aviso de que no se podrá editar. A partir de ahí es inmutable.
- Se elimina el límite de una ficha por cita para la creación manual. **La generación automática conserva su control anti-duplicados**, o cada recálculo crearía copias.

### 2.4 Firmas

- La firma es **irreversible**, sin deshacer. Se compensa con avisos explícitos antes de confirmar.
- El profesional no puede firmar antes que el paciente.
- **Se elimina la idea de "estampar" la firma en un campo del documento**: el sistema no sabe dónde está ese campo. El profesional firma igual que el paciente, dibujando sobre el documento.

### 2.5 Vía en papel

- Cargar el documento firmado en papel lo cierra, incluso si la plantilla exigía firma del profesional.
- La fecha que se guarda es **de carga, no de firma**. La interfaz debe decir *"cargado el…"*, nunca *"firmado el…"*.
- El listado y el detalle deben distinguir **firmado digitalmente** de **firmado en papel**: el respaldo probatorio de cada uno es distinto.

### 2.6 Enlaces de firma

- **Nueva regla de vencimiento:** el enlace vive **1 día desde que se emite**, o **hasta el día después de la cita**, lo que ocurra más tarde.
  *(Hoy se calcula solo sobre la fecha de la cita, así que un enlace reemitido para una cita pasada nace vencido.)*
- Se agrega **reenviar el enlace por correo**, además de copiarlo.

### 2.7 Recomendaciones

- **No entran al circuito de firmas.** Se envían, no se firman.
- Se disparan al **marcar la cita como atendida**, y **siempre se pregunta primero** si se quiere enviar una. Si no se responde o se responde que no, **no se envía nada**.
- Dos variantes:
  - **Estándar del servicio**: el contenido vive en la plantilla.
  - **Personalizada**: un PDF adjunto para ese paciente, o una plantilla de recomendación completada.
- Si se elige la personalizada, **reemplaza** a la estándar: el paciente recibe una sola.
- **Ambas dejan registro** en el listado. La personalizada guarda contenido propio; la estándar registra qué se envió y cuándo.
- **La configuración por servicio ya existe** (asignar plantillas a un servicio con su momento). Kinesiología simplemente no tiene recomendación asignada; masoterapia sí. No hace falta un interruptor nuevo.

### 2.8 Cierres forzados

- **Cita cancelada** → sus documentos quedan **bloqueados**.
- **Especialista dado de baja** → sus documentos vigentes quedan **cerrados**.
- En ambos casos se **registra el motivo**, y el estado debe ser distinguible de uno correctamente firmado. Un documento cerrado por baja del profesional no puede verse igual que uno firmado: el registro estaría afirmando algo que no ocurrió.
- Los documentos bloqueados **siguen apareciendo** en el listado con su estado. Se bloquean, no se borran.

### 2.9 Auditoría

- **Toda modificación deja registro**, incluidos los reemplazos de archivo.
- Al especialista se le muestra lo que necesita: quién firmó, cuándo, por qué vía, y el historial de cambios. **Nunca la IP ni el token.**
- El detalle tiene *"Ver la auditoría del documento"* como acción propia, separada de *"Ver quién firmó y cuándo"*.

### 2.10 Documentos reutilizados

Un consentimiento vigente puede cubrir varias citas. En el listado aparece **una sola vez**, en la cita donde efectivamente se firmó. La reutilización se ve al abrir cada cita cubierta, indicando que está cubierta por una firma anterior — no debe inflar el listado con una fila por cita.

### 2.11 Adjuntos

Disponibles para **todos** los tipos, no solo para las fichas.

---

## 3. Frontend pendiente

### 3.1 Navegación
- Renombrar la entrada del menú a **"Documentos"** y apuntarla a la ruta nueva.
- **Eliminar el contador (badge)** del menú, junto con el hook que lo alimenta.
- Dejar una **redirección desde la ruta vieja**: hay enlaces internos y marcadores del navegador apuntando ahí.
- Revisar el archivo de rutas protegidas: la ruta nueva debe heredar las reglas de acceso de la vieja.

### 3.2 Listado
Reutiliza la estructura del listado actual cambiando el origen de datos. Columnas: paciente, RUT, nombre del documento, tipo, origen, estado, especialista, responsable, fecha de atención.

**Dos puntos críticos:**
- La clave de cada fila es la **clave compuesta**, nunca el id solo. Con el id solo, la interfaz mezcla filas cuando una ficha y un documento comparten número.
- El clic rutea al detalle **según el origen** de la fila.

Botones de la vista: **Crear plantilla** y **Registrar ficha**.

### 3.3 Filtros
Cinco controles: tipo, búsqueda, fecha, estado y especialista. **Todos resuelven en el backend.** El de tipo ofrece las categorías del catálogo, no la lista de plantillas.

### 3.4 Detalle
Bifurca según el origen:
- **Ficha**: se reutiliza el modal existente.
- **Documento de paciente**: es lo nuevo. Muestra datos de firma, estado, auditoría, respaldos y descarga, y el contenido — que a su vez bifurca entre PDF y campos completados según el origen de la plantilla.

### 3.5 Visor de PDF en modo solo lectura
El visor actual siempre monta la capa de dibujo para firmar. Para consultar hace falta poder desactivarla: se ve el documento, no se puede dibujar. Conviene conservar el botón de pantalla completa.

### 3.6 Capa de datos
Servicio y hook nuevos para el listado. Los del detalle ya existen para ambos lados. Al agregar exportaciones, respetar el orden alfabético del barrel: hay una regla de lint que lo exige.

---

## 4. Lo que NO se toca

- La vista pública de firma del paciente.
- La pestaña de documentos dentro del detalle de la cita: sigue siendo la vía para firmar, cargar escaneos y reenviar enlaces.
- El constructor de plantillas y el asistente de registro.
- La generación automática de documentos al confirmar pago o finalizar atención.
- Los caminos de escritura de ambas tablas.

---

## 5. Orden sugerido

1. **Reglas de negocio del backend** (sección 2): visibilidad, tipo al crear plantilla, ciclo borrador/cierre de la ficha, vencimiento y reenvío de enlaces, cierres forzados con motivo, auditoría en las modificaciones.
2. **Recomendaciones**, que es el flujo más nuevo y el único sin nada implementado.
3. **Frontend**: ruta, listado, filtros, y por último el detalle con sus dos ramas y el visor en solo lectura.
4. **Renombre del menú y borrado del badge**, al final, cuando la ruta nueva ya funciona.

---

## 6. Verificaciones antes de dar por cerrado

| Qué verificar | Por qué importa |
|---|---|
| Una ficha y un documento con el mismo número se listan separados y cada clic abre el correcto | Es el error más probable del refactor |
| Un especialista **ve** registros de otros pero **no puede** crear ni editar sobre ellos | Es la regla que cambió; equivocarse hacia el lado permisivo es una fuga de datos clínicos |
| Descargar un documento firmado digitalmente entrega el archivo **con la firma** | Sin esta verificación el bug puede darse por arreglado sin estarlo |
| Un enlace reemitido para una cita ya pasada **funciona** | Es el escenario que hoy está roto |
| Cargar un documento en papel muestra *"cargado el…"*, no *"firmado el…"* | El sistema no debe afirmar una fecha de firma que nadie verificó |
| Una ficha cerrada ya no admite edición | Es la única barrera contra modificar un registro clínico cerrado |
| Al marcar una cita como atendida se pregunta por la recomendación, y si se responde que no, no llega ningún correo | Evita enviar correos sin decisión explícita |
| Un consentimiento reutilizado aparece **una sola vez** en el listado | Evita que el listado infle registros que no existen |
| Un documento bloqueado o cerrado por baja se distingue de uno firmado | Un registro que miente es peor que uno ausente |
| Pedir más de 50 por página devuelve 50 | Defensa contra extracción masiva |
| Consultar el listado deja traza de acceso a datos clínicos | Requisito legal ya cubierto hoy; no puede perderse |
