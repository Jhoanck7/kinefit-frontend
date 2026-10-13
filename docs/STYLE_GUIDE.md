# Guía de Estilo Visual — Panel Administrativo KineFit

**Versión:** 2.0 — 12 de septiembre de 2026 (reemplaza la v1.0)
**Alcance:** Panel administrativo (`(panel)`) de `kinefit-frontend`. No cubre el sitio público (landing) salvo donde comparte componentes — ver pregunta abierta 7.2.
**Convención del proyecto:** este documento contiene diagnóstico y lógica de diseño, no código. La implementación la realiza Maxi sobre el código real.
**Referencia visual viva:** las decisiones de esta guía fueron probadas y ajustadas sobre un prototipo interactivo (Claude Design) con 4 vistas — Agenda, Detalle de Cita, Detalle de Paciente (con pestañas) y Lista de Documentos — antes de cerrarse. Es la referencia visual que acompaña a este documento.

---

## 1. Propósito

El panel funciona correctamente, pero su estilo visual no transmitía la prolijidad buscada: convivían mayúsculas, minúsculas y "Sentence case" en el mismo tipo de componente, había grises genéricos de Tailwind conviviendo con el azul de marca, y varios contenedores duplicaban información con estilos distintos. Esta guía fija el estándar único — ya validado sobre un prototipo — para que el refactor visual del panel completo tenga una sola fuente de verdad.

---

## 2. De dónde sale esta guía

Para ser honesto sobre las fuentes antes de listar cualquier recomendación:

- **`design.odoo.com/es/tools` no contiene una guía de estilo ni tokens de diseño.** Es el sitio de una agencia que vende servicios de diseño web/logo usando la marca Odoo, no documentación del sistema de diseño del ERP.
- **La página de documentación técnica que compartiste (`odoo.com/documentation/.../scss_tips.html`) tampoco pudo leerse directamente** — es una página que se renderiza con JavaScript y las herramientas de esta sesión solo pudieron ver el menú de navegación, no el contenido del artículo.
- Ante eso, en vez de asumir valores de Odoo sin verificar, se buscó evidencia directa en el **código fuente real de Odoo en GitHub** (`github.com/odoo/odoo`), que sí es una fuente primaria confiable:
  - **Tipografía:** un commit histórico del propio repositorio ("[FIX] web: load font.scss for Roboto font") confirma que el web client de Odoo carga **Roboto** como fuente.
  - **Radio de bordes:** `addons/website/static/src/scss/bootstrap_overridden.scss` define `$border-radius: .4rem` (~6.4px), `$border-radius-sm: .3rem` (~4.8px), `$border-radius-lg: .6rem` (~9.6px) y `$border-radius-pill: 50rem` (círculo completo, para badges/pills). Estos son los valores reales de Odoo, no una estimación.
- El resto de la base sigue siendo lo mismo que en la v1.0: **(a)** las 3 capturas de un ERP real basado en Odoo (Apotheca/Farmacias) que compartiste, y **(b)** el código real de `kinefit-frontend`, que ya tiene una arquitectura de tokens razonable — el problema nunca fue la falta de tokens, sino su uso inconsistente.

Cada recomendación está etiquetada por origen: **[Odoo verificado]** (confirmado en el código fuente de Odoo), **[capturas]** (observado en las 3 imágenes de referencia), **[código actual]** (ya existe en `kinefit-frontend` y se recomienda mantener/generalizar), **[prototipo]** (decidido y confirmado al probarlo en el canvas de diseño), o **[propuesta]** (criterio nuevo sin fuente externa, para resolver una inconsistencia puntual).

---

## 3. Diagnóstico del estado actual (con evidencia de código)

**3.1 — El sistema de tokens existe, pero no todos los componentes lo consumen.**
`src/app/globals.css` define correctamente variables de marca y de panel: `--primary: #003366`, `--primary-hover: #002244`, `--sidebar: #07336c`, `--color-panel-sidebar: #07336c`, `--color-panel-sidebar-activo: #052651`, `--color-panel-seleccion: #e7eff9`, `--color-panel-fondo: #fafcfe`, `--border: #e2e8f0`, `--muted-foreground: #334155`. El problema no es la falta de tokens: es que varios componentes compartidos los ignoran y hardcodean valores propios (ver 3.3).

**3.2 — El componente `Badge` es la causa raíz directa de la inconsistencia de mayúsculas/minúsculas.**
`Button.tsx` fuerza `uppercase` en su clase base — por eso todos los botones son consistentes entre sí. `badge.tsx`, en cambio, no define ninguna transformación de texto. Resultado: cada pantalla escribe la mayúscula que se le ocurre (`CONFIRMADA`, `Confirmada`, `confirmada` conviven según el archivo).

**3.3 — Componentes compartidos que hardcodean grises genéricos en vez de los tokens de marca.**
`sidebar.tsx` (`bg-slate-900` en vez de `--color-panel-sidebar`), `header.tsx` (`text-slate-900`/`bg-slate-100`), `modal.tsx` y `summary-panel.tsx` (`rounded-none border-slate-200 shadow-none` hardcodeado en vez de leer los tokens), `admin-panel-button.tsx` (`bg-[#003366]` como hex literal en vez de referenciar `--primary`).

**3.4 — Dos mecanismos de título desconectados producen encabezados duplicados y con distinto casing en la misma pantalla.**
`header.tsx` mantiene un mapa propio `TITULOS_POR_RUTA` independiente del `<h1>` que cada vista dibuja internamente — de ahí encabezados duplicados con casing distinto en la misma pantalla (ej. "REGISTRAR PACIENTE" arriba, "Registrar paciente nuevo" en el cuerpo).

**3.5 — Tokens muertos o incompletos.**
`--radius-global: 4px` no lo consume ningún componente. El bloque `.dark` es una copia exacta de `:root`: no hay modo oscuro real implementado.

**3.6 — El único patrón bien resuelto en el código actual es el catálogo de estados de citas.**
`src/lib/estados.ts` define `CATALOGO_ESTADOS`, un mapa de cada estado de cita a `{ etiqueta, colorRol, acciones, ... }` con `colorRol` en un enum cerrado (`azul-seleccion | ambar | verde | azul-profundo | rojo | gris`). Es exactamente el tipo de estructura que falta para Documentos, Ventas, Empresas y Plantillas.

---

## 4. Principios de diseño (decisiones finales)

**4.1 — Color** [código actual + capturas]
El azul marino de marca (`--primary #003366` / `--sidebar #07336c`) se mantiene — es distintivo y más "corporativo" que el celeste del sitio público (`--color-brand-primary #0c5dc5`), y esa diferencia está bien. Todos los componentes deben *leer el color del token*, nunca escribirlo de nuevo como hex o como gris de Tailwind. El color se usa con moderación: fondos predominantemente blancos, con el color de marca reservado para navegación, acciones primarias y badges de estado.

**4.2 — Bordes y elevación** [capturas + prototipo]
La separación entre bloques se resuelve con un borde fino de 1px (`hairline border`), no con sombra. Las sombras se reservan para overlays flotantes (paneles de detalle abiertos, modales) para indicar que están "por encima" del flujo normal de la página. Un contenedor de página (una card, una tabla) nunca lleva sombra; un panel de detalle/modal sí.

**4.3 — Radio de esquinas — RESUELTO** [Odoo verificado + prototipo]
Decisión final, probada en el prototipo: **modelo mixto**. Los contenedores de página (cards, tablas, filas) van con esquina recta (`0px`), igual que hoy. Los paneles de detalle/overlays (una ficha de paciente o de cita abierta) usan **6px** de radio — el valor real de Odoo (`$border-radius: .4rem` ≈ 6.4px, redondeado). Los badges/pills usan radio completo (`999px`), también alineado a Odoo (`$border-radius-pill: 50rem`). Este es el mismo contraste "recto por fuera, redondeado en overlays y pills" que se veía en las 3 capturas de referencia.

**4.4 — Tipografía — Roboto** [Odoo verificado, decisión de Maxi]
Se reemplaza Satoshi por **Roboto** como fuente principal del panel, para alinear con la fuente real que usa el web client de Odoo (ver sección 2). JetBrains Mono se mantiene para contenido monoespaciado puntual (RUT, teléfono, montos) **fuera de tablas** — ver 4.7. Pendiente de formalizar una escala tipográfica única (tamaños para: título de página, título de sección, label de campo, valor de dato, texto auxiliar) en vez de los tamaños ad-hoc actuales (`text-[10px]`, `text-[11px]`, `text-sm`, etc.).

**4.5 — Densidad** [capturas]
Tablas y listados con densidad compacta (filas bajas, poco padding vertical). Formalizar esto como regla explícita para Ventas, Pacientes y Documentos.

**4.6 — Regla universal de capitalización: Title Case**
Aclaración de término: lo que se describió como "pascal case para todo" — aplicado a texto de interfaz — es técnicamente **Title Case** (cada palabra significativa en mayúscula inicial). "PascalCase" es un término de programación para nombres de variables sin espacios y no aplica a texto visible.

Regla: **todo texto visible usa Title Case** — títulos, labels, botones, badges, sidebar, breadcrumbs — con las palabras de enlace (`de`, `la`, `del`, `en`, `como`) en minúscula salvo que sean la primera palabra (ej. "Datos de la Cita", "Marcar como Asistida"), y con palabras de significado propio siempre en mayúscula inicial aunque sean cortas (ej. "No Asistida" — el "No" es negación, no un conector). Excepción única y deliberada, confirmada al probarla en el prototipo: un micro-label técnico en mayúsculas pequeñas (`tracking-widest`) reservado para el encabezado "RESUMEN" de `summary-panel.tsx` — como mucho un lugar por pantalla, nunca la regla general.

**4.7 — Los datos de tabla nunca se diferencian entre sí — RESUELTO** [prototipo, decisión de Maxi]
Regla nueva, encontrada al revisar el prototipo: dentro de una tabla/lista de filas (Lista de Documentos, Historial de Citas, etc.), **ninguna columna de datos lleva negrita, color distinto, ni un badge de color** — todas las columnas de una fila usan exactamente el mismo peso, tamaño y color de texto, sin excepción, incluida la columna de estado (que pasa a ser texto plano, ej. "Firmado", "Confirmada", igual que cualquier otro dato). Lo **único** que lleva negrita es el nombre de las columnas en el encabezado de la tabla. Los badges de color sólido (ver 4.8) quedan reservados para vistas de un solo registro (el estado de una cita o de un paciente en su ficha de detalle), nunca dentro de una fila de tabla.

**4.8 — Badges: color sólido + texto blanco, nunca fondo pastel** [decisión de Maxi]
Regla nueva: cuando un badge de estado sí corresponde (fuera de tablas, ver 4.7), su estilo es **fondo de color sólido y letra blanca** — el mismo patrón que ya usa el estado "Atendida". Queda descartado el patrón de fondo pastel/claro con letra de color saturado (ej. fondo celeste claro + letra azul oscuro): es un patrón que se percibe genérico y no debe usarse en ningún componente del panel.

**4.9 — Sin iconografía decorativa** [decisión de Maxi]
Regla nueva: el panel no usa símbolos ni iconos decorativos — nada de iconos en el menú lateral, sin el símbolo "+" en botones de acción, sin lupa de búsqueda, sin flechas para navegación de fecha, sin ícono de cerrar, sin íconos de ver/descargar en acciones de tabla, y sin emojis en ningún lugar. Todo eso se resuelve con **texto** ("Cerrar", "Ver", "Descargar", "Anterior", "Siguiente", "Nueva Reserva" sin símbolo previo). La única excepción es el logo de marca (la inicial "K" o el isotipo real de KineFit cuando exista), que no es un ícono decorativo sino la identidad de marca.

**4.10 — Separadores de texto** [decisión de Maxi]
Cuando se combinan dos datos relacionados en una misma línea (ej. nombre de paciente + servicio), el separador es **una coma** (`, `) — ej. "Javiera Muñoz, Kinesiología Clínica". La única excepción es el rango horario de una cita, que mantiene el guion medio ya usado (`–`) — ej. "09:00 – 09:45". No se usa raya larga (`—`) en ningún otro lugar del panel.

---

## 5. Especificación por componente

**5.1 — Badge / sistema de estado**
Generalizar el patrón de `estados.ts` para que deje de ser exclusivo de citas: extraer la forma (`{ etiqueta en Title Case, colorRol }`) a un lugar compartido y crear el catálogo equivalente para documento (borrador/pendiente/firmado), venta/cobro, empresa y plantilla. El componente `Badge` debe forzar Title Case, fondo sólido y letra blanca por defecto (4.8) — y su variante de uso dentro de una tabla queda **eliminada**: en contexto de tabla se renderiza como texto plano (4.7), no como badge.

**5.2 — Sidebar**
Reemplazar `bg-slate-900` por `--color-panel-sidebar`, el ítem activo por `--color-panel-sidebar-activo`. Los ítems de navegación van en Title Case, sin ícono (4.9) y sin `uppercase tracking-wider`.

**5.3 — Header**
Resolver la duplicidad de 3.4: `TITULOS_POR_RUTA` como única fuente del título, o cada vista expone su título y el header lo consume — cualquiera de los dos caminos, pero una sola fuente. Los controles de navegación de fecha (Agenda) son botones de texto ("Anterior"/"Siguiente"), no íconos de flecha.

**5.4 — Modal / panel de detalle**
Aplicar el radio de 6px (4.3) desde el token, no hardcodeado. El botón de cierre es texto ("Cerrar"), no un ícono ✕. Reemplazar `rounded-none border-slate-200 shadow-none` por los tokens correspondientes, agregando sombra real ya que es un overlay (4.2).

**5.5 — SummaryPanel**
Mismo tratamiento de bordes/radio que Modal. Reemplazar `text-slate-400`/`text-slate-900` por `--muted-foreground`/`--foreground`. El label "RESUMEN" se mantiene como la única excepción de mayúsculas (4.6).

**5.6 — Tablas (Documentos, Ventas, Pacientes, Historial de Citas)**
Encabezado de columna: negrita, color de texto estándar (no gris apagado), tamaño pequeño. Cada fila de datos: mismo peso, tamaño y color en todas las columnas (4.7) — incluida la columna de estado, que es texto, no badge. Columna de acciones: enlaces de texto ("Ver", "Descargar"), no íconos. Sin fuente monoespaciada dentro de la tabla (esa se reserva para bloques de campo/valor fuera de tabla, ver 4.4).

**5.7 — AdminPanelButton**
Reemplazar `bg-[#003366] hover:bg-[#002244]` literal por referencia a `--primary`/`--primary-hover`. Sin ícono "+" ni de otro tipo (4.9); el texto del botón ya comunica la acción.

**5.8 — Tokens en `globals.css`**
Eliminar `--radius-global: 4px` (queda formalizado como `--radius-overlay: 6px` y `--radius-pill: 999px`, ver 4.3). Decidir el destino de `.dark` (ver pregunta abierta 7.1): implementarlo de verdad o eliminarlo.

---

## 6. Plan de migración (orden lógico, sin código)

1. **Actualizar tokens en `globals.css`**: agregar `--radius-overlay: 6px` y `--radius-pill: 999px`, eliminar `--radius-global`, decidir `.dark` (7.1).
2. **Generalizar el catálogo de estados**: extraer la forma de `estados.ts` y crear los catálogos faltantes (documentos, ventas, empresas, plantillas).
3. **Actualizar el componente `Badge`**: Title Case + fondo sólido/letra blanca por defecto (4.8), y una variante o uso explícito de "texto plano" para contexto de tabla (4.7).
4. **Rewire de tokens en componentes compartidos**: Sidebar, Header, Modal, SummaryPanel, AdminPanelButton.
5. **Quitar iconografía decorativa** (4.9): sidebar, botones, buscador, navegación de fecha, acciones de tabla — reemplazar todo por texto.
6. **Resolver la duplicidad de títulos** entre Header y cada vista (5.3).
7. **Barrido de Title Case y separadores** (4.6, 4.10) en el resto de las vistas.
8. **Normalizar tablas** (5.6): quitar negritas/colores diferenciadores de columnas, pasar estado de badge a texto.

---

## 7. Preguntas abiertas para Maxi

**7.1 — Modo oscuro:** ¿se implementa un tema oscuro real para el panel, o se elimina el bloque `.dark` actual (hoy un duplicado no funcional)?

**7.2 — Alcance del refactor:** ¿esta guía aplica solo al panel administrativo, o también se espera alinear el sitio público (landing) al mismo sistema de tokens y a Roboto más adelante? Hoy usan variables de marca distintas (`--primary` panel vs. `--color-brand-primary` landing) y el sitio público no se probó en el prototipo.

**7.3 — Escala tipográfica formal:** falta definir los tamaños exactos de la escala mencionada en 4.4 (título de página / sección / label / valor / auxiliar) — ¿lo definimos juntos ahora o lo dejamos como ajuste fino durante la implementación?

---

## 8. Sobre Claude Design como herramienta

Se usó el editor de canvas de Claude Design para construir un prototipo interactivo de 4 vistas (Agenda, Detalle de Cita, Detalle de Paciente con pestañas, Lista de Documentos) y validar ahí las decisiones de las secciones 4.3, 4.4, 4.7, 4.8, 4.9 y 4.10 antes de fijarlas en esta guía — de ahí que estén marcadas como resueltas en vez de abiertas. No se usa como reemplazo del código real: la implementación sigue siendo sobre `kinefit-frontend`, siguiendo el plan de la sección 6.
