# Tokens de Diseño — Panel Administrativo KineFit

**Versión:** 1.0 — 12 de septiembre de 2026
**Complementa a:** `Guía de Estilo Visual — Panel Administrativo KineFit` (v2.0). Esta es la hoja de referencia rápida con los valores concretos; la guía explica el razonamiento y las reglas de uso.

---

## Color de marca y panel

| Token | Valor | Uso |
|---|---|---|
| `--primary` | `#003366` | Acciones primarias, navegación activa, marca |
| `--primary-hover` | `#002244` | Estado hover de lo anterior |
| `--sidebar` | `#07336c` | Fondo del sidebar |
| `--sidebar-activo` | `#052651` | Ítem activo del sidebar |
| `--panel-seleccion` | `#e7eff9` | Fondos de selección suave (ej. toggle Día/Semana activo) |
| `--panel-fondo` | `#fafcfe` | Fondo general del panel |
| `--border` | `#e2e8f0` | Bordes finos (hairline) |
| `--muted` | `#64748b` | Texto secundario/auxiliar |
| `--foreground` | `#0f1b2d` | Texto estándar |
| `--color-brand-primary` (solo sitio público) | `#0c5dc5` | No usar en el panel administrativo |

## Estados / Badges — fondo sólido + letra blanca siempre

Regla: **nunca** fondo pastel + letra de color. Todo badge es fondo sólido, texto `#ffffff`.

| Estado (cita) | `colorRol` | Fondo |
|---|---|---|
| Pendiente de Pago | azul-selección | `#2563eb` |
| Por Confirmar | ámbar | `#b45309` |
| Confirmada | verde | `#15803d` |
| Atendida | azul-profundo | `#07336c` |
| No Asistida | rojo | `#b91c1c` |
| Cancelada | gris | `#475569` |
| Expirada | gris + trama | `#475569` + patrón diagonal (`repeating-linear-gradient` blanco 18% opacidad) |

Mismos colores por rol para otros catálogos (documento, venta, empresa, plantilla) — mapear cada estado nuevo al `colorRol` semántico más cercano (verde = éxito/firmado, ámbar = pendiente, rojo = rechazado/no asistido, gris = inactivo/borrador/cancelado, azul = en curso).

**Excepción de contexto:** dentro de una fila de tabla, el estado se muestra como **texto plano** (mismo estilo que el resto de la fila), nunca como badge — ver regla de tablas más abajo.

## Radio de esquinas

| Elemento | Radio |
|---|---|
| Contenedores de página (cards, tablas, filas) | `0px` |
| Paneles de detalle / overlays (ficha abierta, modal) | `6px` (Odoo: `$border-radius: .4rem` ≈ 6.4px) |
| Badges / pills | `999px` (Odoo: `$border-radius-pill: 50rem`) |

## Tipografía

- **Fuente principal:** Roboto (alineada a Odoo, verificado en el código fuente del web client).
- **Monoespaciada:** JetBrains Mono — solo en bloques de campo/valor fuera de tabla (RUT, teléfono, montos, horarios). **No usar dentro de tablas** (ver regla de tablas).
- **Pesos:** 400 regular (texto de dato), 500–600 (labels), 700 (títulos, encabezados de columna, botones).
- Escala formal de tamaños: pendiente de definir (ver pregunta abierta 7.3 de la guía).

## Bordes y elevación

- Separación entre bloques de página: borde de 1px sólido `--border`. Sin sombra.
- Overlays (panel de detalle abierto, modal): sombra sí (`0 20px 45px -20px rgba(7,51,108,.30)` como referencia), más borde de 1px.

## Reglas de tabla (aplican a Documentos, Ventas, Pacientes, Historial de Citas)

- Encabezado de columna: negrita (700), color de texto estándar, tamaño pequeño (~11px).
- **Todas** las celdas de datos de una fila: mismo peso (400), mismo tamaño (~12.5px), mismo color (`--foreground`) — sin excepción por columna, incluida la de estado.
- Columna de estado: texto plano, no badge.
- Columna de acciones: enlaces de texto ("Ver", "Descargar"), no íconos.
- Sin fuente monoespaciada en ninguna columna.

## Capitalización

- Title Case en todo texto visible (títulos, labels, botones, badges, sidebar).
- Conectores (`de`, `la`, `del`, `en`, `como`) en minúscula salvo que sean la primera palabra.
- Palabras con significado propio (ej. "No") siempre en mayúscula inicial.
- Única excepción: micro-label "RESUMEN" (mayúsculas pequeñas, `tracking-widest`) — máximo un lugar por pantalla.

## Separadores de texto

- Dos datos combinados en una línea: coma (`, `) — ej. "Javiera Muñoz, Kinesiología Clínica".
- Rango horario: guion medio (`–`) — ej. "09:00 – 09:45". Es la única excepción.
- No usar raya larga (`—`) en ningún otro lugar.

## Iconografía

- Sin íconos decorativos en ningún componente: sidebar, botones, buscador, navegación de fecha, acciones de tabla, cierre de modal.
- Todo se resuelve con texto: "Cerrar", "Ver", "Descargar", "Anterior", "Siguiente".
- Sin emojis en ningún lugar del panel.
- Única excepción: el logo/isotipo de marca.
