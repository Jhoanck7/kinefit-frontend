# Diagnóstico — Refactor Visual Pendiente

**Fecha:** 12 de septiembre de 2026
**Contexto:** Maxi implementó el refactor visual (basado en `Guia_Estilo_Visual_Panel` v2.0 y `Tokens_Diseno_Panel` v1.0) directamente en el código real de `kinefit-frontend`. Después de revisar el resultado, reportó tres problemas: la sección de Agenda no se parece al prototipo validado en Claude Design, los "detalles" (modales de cita/paciente) siguen con el estilo antiguo del panel, y las fuentes se ven muy pequeñas.

Este documento identifica, con evidencia de código concreta (archivo y línea), la causa técnica exacta de cada uno de los tres problemas. Es un diagnóstico, no una propuesta de código — el criterio del proyecto es que Claude planifica/analiza y Maxi implementa.

## Método

Se compararon los `mtime` (fecha de modificación) de los archivos del repo real contra la fecha de checkout original, para distinguir qué se tocó durante el refactor y qué quedó intacto, y luego se leyó el contenido de los archivos relevantes para verificar si lo aplicado coincide con lo que se validó en el prototipo de Claude Design y con lo especificado en `Guia_Estilo_Visual_Panel` / `Tokens_Diseno_Panel`.

## Hallazgo 1 — La Agenda no se parece al prototipo

**`src/views/app/panel/agenda/index.tsx`** y **`src/views/app/panel/agenda/hooks/use-agenda.ts`** nunca se editaron durante el refactor: su `mtime` coincide exactamente con el checkout original del repo, mientras que casi todos los demás archivos de Agenda (`agenda-toolbar.tsx`, `appointment-card.tsx`, `time-grid.tsx`, `legend.tsx`, `appointment-detail-modal.tsx`) sí tienen timestamps de la sesión de refactor.

Consecuencia directa: la página nunca se volvió a ensamblar con las clases/tokens nuevos. `index.tsx` (línea 52) todavía tiene:

```
<h3 className="mb-4 text-center font-sans font-semibold text-sm text-slate-800 tracking-wide">
```

`text-slate-800` y `text-sm` son clases crudas de Tailwind, exactamente el anti-patrón que la guía de estilo (sección 3.3) identificó como problema original — no un token (`text-foreground`, `text-value`).

Incluso en los componentes que sí se editaron, el resultado no coincide con lo validado. `appointment-card.tsx` (líneas 41-53) muestra el estado de una cita como un punto de color + texto:

```
<span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
<span>... {definicion.etiqueta}</span>
```

En vez del badge sólido con letra blanca que se aprobó en el prototipo (el mismo estilo que "Atendida" en la retroalimentación original). El dato para hacerlo bien existe: `src/lib/color-rol.ts` define `fondoSolido: "#2563eb"` (y su equivalente para cada estado), pero **ningún componente leído usa ese campo** — se agregó al catálogo de datos y no se conectó a ningún render.

## Hallazgo 2 — Los detalles (modales) siguen con el estilo de siempre

**Estado como punto+texto, no badge:** mismo patrón que el Hallazgo 1. `appointment-detail-modal.tsx`, sección "Estado Actual" (líneas 238-253), usa punto de color + texto de color en vez del badge sólido de fondo-color/letra-blanca.

**Radio de esquina anulado visualmente:** el token `--radius-overlay: 6px` sí se agregó correctamente a `globals.css` (línea 79), y el wrapper compartido `Modal` (`src/components/shared/modal.tsx`, línea 35) sí lo aplica vía `rounded-overlay` en el `DialogContent` de Radix. El problema es que cada modal individual envuelve su contenido en un `<div>` interno que todavía trae `rounded-none` y `shadow-none` — resabio del código anterior al refactor:

- `paciente-detalle-modal.tsx` línea 51: `className="bg-white text-slate-900 font-sans shadow-none rounded-none"`
- `appointment-detail-modal.tsx` línea 136: `className="bg-white text-foreground font-sans shadow-none rounded-none"`

Y el `DialogContent` que sí tiene el radio de 6px usa `overflow-y-auto` en lugar de `overflow-hidden` (modal.tsx línea 35). Sin ese recorte, las esquinas cuadradas del `<div>` blanco interior tapan visualmente el radio del contenedor exterior — el token existe y está bien aplicado a nivel del Dialog, pero el resultado visual sigue pareciendo 100% recto porque nadie limpió la capa interna que quedó de antes.

Verificado directamente en los modales de cita y paciente. Es probable que el mismo patrón se repita en los modales de venta y documento porque comparten el mismo `Modal` wrapper y el mismo `COLOR_ROL`, pero no se revisaron línea por línea en este diagnóstico.

## Hallazgo 3 — Las fuentes se ven muy pequeñas

Dos causas independientes, ambas en `src/app/globals.css`:

**Roboto nunca se implementó.** La línea 1 sigue importando Satoshi:

```
@import url("https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400,300&display=swap");
```

Roboto solo aparece como *fallback* dentro del stack de Satoshi (línea 15: `--font-satoshi: "Satoshi", ..., Roboto, sans-serif;`), nunca como fuente primaria. Satoshi rinde visualmente algo más angosto/pequeño que Roboto al mismo tamaño nominal, lo que ya contribuye a la sensación de "chico" incluso antes de mirar los tamaños.

**Se definió una escala tipográfica nueva, pero muy pequeña.** Líneas 38-44 de `globals.css`:

```
--text-page-title: 13px;
--text-section-title: 14px;
--text-label: 11px;
--text-value: 13px;
--text-table-head: 11px;
--text-table-cell: 12.5px;
```

Esto corresponde exactamente a la pregunta abierta 7.3 de `Guia_Estilo_Visual_Panel` ("escala tipográfica formal: pendiente de definir") — se resolvió durante el refactor, pero con valores muy conservadores. Se aplicó de forma consistente: hasta los ítems de navegación del sidebar (`sidebar.tsx` línea 98) usan `text-page-title` (13px) para el texto principal de cada link. Sumado a los `text-[10px]` explícitos que quedaron como encabezados de sección dentro de los modales (ej. "Información de Contacto", "Detalles de la Atención" en `paciente-detalle-modal.tsx` y `appointment-detail-modal.tsx`) y al uso extendido de `text-xs` (12px) de Tailwind, el panel completo terminó dominado por texto de 10-14px.

## Conclusión

El refactor sí avanzó en varios frentes correctamente: colores de marca tokenizados, radios en botones/toolbar aplicados, íconos removidos del sidebar y de varios controles, estructura de tabs con Radix. Pero se detuvo a medio camino en tres puntos puntuales y verificables:

1. La página de Agenda (`index.tsx` + `use-agenda.ts`) nunca se volvió a tocar, así que por más que se editaran las piezas internas, el ensamblaje de la página sigue siendo el de antes.
2. El patrón de "badge sólido + letra blanca" se definió en los datos (`fondoSolido` en `color-rol.ts`) pero no se conectó a ningún componente — todos los estados se siguen mostrando como punto de color + texto de color.
3. El radio de 6px para overlays se implementó correctamente a nivel de token y de wrapper compartido, pero quedó anulado visualmente por un `<div>` interno con `rounded-none` heredado del código viejo, combinado con `overflow-y-auto` en vez de `overflow-hidden`.
4. La tipografía cambió de escala (resolviendo la pregunta abierta 7.3) pero hacia valores más chicos, y Roboto nunca reemplazó a Satoshi como fuente primaria.

Estos cuatro puntos son la explicación completa y verificable de las tres quejas reportadas.
