# KineFit — Plan de fixeo post-refactorización

**Continuación de** `docs/Plan_Implementacion_Panel_Administrativo.md` (Fases A–E, cerradas).
Este documento cubre lo que quedó pendiente: las señales de la **Sección 4 (auditoría técnica)**
y las **Sección 5 (mejoras)** del plan anterior, más los defectos funcionales y visuales
detectados en uso real.

**Estado de partida:** rama `feature/administrative-panel`, commit `1b4cf5a`.
Análisis verificado contra el código real del frontend **y** del backend
(`kinefit-backend`, `api-dotnet`), no contra documentación.

---

## 0. Restricciones permanentes (heredadas, siguen vigentes)

- **Sin la palabra "Procede" de Maxi, prohibido tocar código.** Ante cualquier duda, se pregunta.
- Trabajo **incremental y atómico**: un sub-paso a la vez, nunca adelantarse.
- **No regenerar archivos completos** salvo pedido explícito o visto bueno tras proponerlo.
- Respuestas concisas. Todo en español.
- Cada entrega incluye: código modificado + **resumen de 3 puntos** + la pregunta
  *"¿Deseas revisar/ajustar algo antes de pasar al siguiente punto?"*.
- Cada sub-paso de este plan es una unidad de trabajo independiente: se propone, se espera
  "Procede", se ejecuta, se entrega, se valida. Recién ahí el siguiente.

---

## 1. Orden de ejecución

```
FASE 1 — Panel administrativo (urgente: funcional + visual)
  Parte A → correcciones funcionales y de estilo (A1 … A7)
  Parte B → sección Configuración con pestañas (B1 … B6)

FASE 2 — Sitio público (recuperar estilo previo a la refactorización)
  C1 … C4

FASE 3 — Auditoría técnica y mejoras (Secciones 4 y 5 del plan anterior)
  D1 … D3

ANEXO — Deuda técnica inventariada (se resuelve dentro de las fases o queda registrada)
```

---

# FASE 1 — PANEL ADMINISTRATIVO

## Parte A — Correcciones funcionales y de estilo

---

### A1. Reconstruir el paso "Horario" y eliminar el error 409

#### Causa raíz (verificada, no es un bug del backend)

El backend `CitaService.CreateManualAsync` ya recibe `BloqueHorarioIds: List<int>` y valida:
1–3 bloques, todos de la misma fecha, **todos del mismo especialista**, y consecutivos
(`bloques[i].HoraInicio == bloques[i-1].HoraFin`). No pide duración. Es correcto.

El fallo está en el orden en que el frontend resuelve los datos. En
`views/app/panel/nueva-reserva/horario/hooks/use-horario.ts:82-84`:

```ts
const numEspId = especialistaId
  ? parseInt(especialistaId.replace(/\D/g, ""), 10) || 1
  : parseInt(session?.user.especialistaId?.replace(/\D/g, "") || "1", 10) || 1;
```

El especialista se elige en el paso **siguiente**, así que aquí `especialistaId` siempre es
`null` → cae al especialista de la sesión, o al **hardcodeado `1`**. Se reservan bloques del
especialista equivocado; al elegir otro en el paso 3, el backend lanza
`InvalidOperationException("Todos los bloques deben pertenecer al mismo especialista")`, que
`ExceptionHandlingMiddleware.cs:39` mapea a **409 Conflict**.

Funciona solo cuando el usuario logueado resulta ser el especialista 1. En cualquier otro
caso, 409 garantizado.

Causas secundarias del mismo 409: bloque ya `Reservado`, bloques no consecutivos, bloques de
fechas distintas.

#### La solución: usar la API que el backend ya tiene para este orden

`DisponibilidadController` (`/api/disponibilidad`) existe exactamente para el orden que pidió
el cliente. Su propia documentación lo dice: *"para el orden nuevo del flujo de reserva web:
Servicio → Fecha → Horario → Especialista"*. `DisponibilidadService` razona sobre **cadenas de
bloques consecutivos**: solo ofrece una hora si algún especialista tiene la cadena completa
libre desde ahí.

El panel nunca lo adoptó — usa `/api/agenda`, que exige conocer al especialista de antemano.
Ese es el desajuste. Estaba registrado como pendiente #22 ("posible API duplicada o
abandonada"); queda resuelto: **es la API vigente para este flujo.**

**El orden que pidió el cliente se mantiene intacto. No se toca el backend.**

Flujo nuevo del paso Horario:

| Momento | Llamada | Resultado |
|---|---|---|
| Elegir fecha | `GET /disponibilidad/fechas?servicioId&duracionMinutos=30` | fechas con al menos un bloque libre |
| Pintar grilla | `GET /disponibilidad/horas?servicioId&fecha&duracionMinutos=30` | horas de inicio viables, agregadas de todos los especialistas del servicio |
| Elegir bloques | — | selección acumulativa por clic, 1 a 3; duración derivada `nBloques × 30` |
| Paso siguiente | `GET /disponibilidad/especialistas?servicioId&fecha&horaInicio&duracionMinutos={n×30}` | **solo** especialistas con la cadena completa libre |
| Al elegir especialista | `GET /bloques?especialistaId&fecha` | se resuelven los `bloqueHorarioIds` reales de **ese** especialista |

El 409 desaparece por construcción: los IDs de bloque se resuelven **después** de conocer al
especialista, y el especialista solo aparece si tiene la cadena completa.

#### Selección de bloques (comportamiento pedido)

- Clic en un bloque → se selecciona. Clic de nuevo → se deselecciona.
- Válido con **1, 2 o 3** bloques. La duración se calcula sola y se muestra como texto plano.
- Mensajes de error (con el estilo unificado de A4):
  - Ningún bloque seleccionado → *"Selecciona al menos un bloque de horario."*
  - Más de 3 → *"Puedes reservar como máximo 3 bloques (90 minutos)."*
  - No consecutivos → *"Los bloques deben ser consecutivos. Selecciona horarios seguidos."*
  - Sin especialista con esa cadena → *"Ningún especialista tiene disponible esa franja completa. Prueba con otro horario."*

#### Se elimina de la interfaz

- El selector **"Duración de la Atención"** (`horario/index.tsx:51-68`).
- El recuadro verde **"Franja Horaria"** (`horario/index.tsx:93-105`).
- El texto **"(N bloques)"** bajo cada horario (`bloques-selector.tsx:77-81`).
- El **"(cargo)"** junto al nombre del especialista (`especialista/index.tsx:29`).
- El filtro mañana/tarde hardcodeado `< "14:00"` / `>= "15:00"`
  (`use-horario.ts:107-108`) — **hoy oculta sin aviso todos los bloques entre 14:00 y 15:00**.
  Se reemplaza por partición según los datos reales.

#### Archivos a tocar

| Archivo | Cambio |
|---|---|
| `services/disponibilidad-service.ts` | **nuevo** — `getFechas`, `getHoras`, `getEspecialistas` |
| `hooks/api/use-disponibilidad-service.ts` | **nuevo** — hooks TanStack Query |
| `models/responses/disponibilidad.ts` | **nuevo** — DTOs verificados contra los de C# |
| `views/.../nueva-reserva/horario/hooks/use-horario.ts` | reescrito: sin duración, selección acumulativa, sin fallback `|| 1` |
| `views/.../nueva-reserva/horario/index.tsx` | quitar duración y "Franja Horaria" |
| `views/.../nueva-reserva/horario/components/bloques-selector.tsx` | selección múltiple, sin "(N bloques)" |
| `views/.../nueva-reserva/especialista/hooks/use-especialista.ts` | usar `/disponibilidad/especialistas`, resolver `bloqueHorarioIds` |
| `views/.../nueva-reserva/especialista/index.tsx` | quitar `(${esp.cargo})` |
| `stores/useNuevaReservaStore.ts` | quitar `servicioDuracionMinutos`; agregar `horasSeleccionadas: string[]` |
| `views/.../nueva-reserva/resumen/hooks/use-resumen-reserva.ts` | quitar los `|| 1`; usar la mutación de A2 |

#### Criterio de aceptación
Reservar 1, 2 y 3 bloques con un especialista **distinto** al de la sesión, y que la cita se
registre. Los cuatro mensajes de error se disparan en su escenario correspondiente.

---

### A2. Recuperar el mensaje real del backend + capa `hooks/api` para citas — ✅ hecho

**Corrección aplicada durante la ejecución:** ya existía `lib/api.ts::handleApiError`, que
parsea el `ErrorDetail` del backend (`{status, error, message, timestamp}`), distingue errores
de validación (`body.errors`) y errores de red sin respuesta, y expone `canRetry`. Se usaba en
`use-especialistas.ts` y `use-acceso.ts` con el patrón `catch (err) { setError(handleApiError(err).message) }`.
**No se tocó `providers/axios-provider.tsx`**: agregar un interceptor habría sido lógica
duplicada y se habría apartado del patrón ya establecido. `lib/api.ts` es un archivo distinto
de `lib/api/apiClient.ts` (código muerto de A7) — no se confirmó su existencia actual, revisar
en A7.

Se dividió en dos entregas atómicas:

**A2a** — `hooks/api/use-cita-service.ts` (nuevo), con solo los 4 métodos que tienen
consumidor real: `useGetCita`, `useGetImpactoCancelacion`, `useCreateCitaManualMutation`,
`useUpdateCitaEstadoMutation`. Sin `useGetCitas`/`getAll`: no tiene ningún llamador (la agenda
va por `use-agenda-service`). Registrado en el barrel. Migrado `use-resumen-reserva.ts` con
`mutateAsync` + `handleApiError` (decisión explícita: `mutateAsync` + `catch`, no `mutate` +
`onError`, para mantener el patrón ya usado en `use-especialistas.ts`).

**A2b** — migrados los 5 call sites restantes con el mismo patrón:
`agenda/components/appointment-detail-modal.tsx`,
`agenda/components/cancel-appointment-modal.tsx`,
`fichas/components/ficha-detalle-modal.tsx`,
`fichas/nueva/contenido/hooks/use-nueva-ficha-contenido.ts`,
`fichas/nueva/reserva/hooks/use-nueva-ficha-reserva.ts`.
De paso se corrigieron 3 defectos encontrados en la migración (no documentados en el
diagnóstico original):
- `cancel-appointment-modal.tsx`: mensaje de error hardcodeado que pisaba el del backend, y
  `console.error` (uno de los 5 `no-console` de A7) — ambos eliminados.
- `appointment-detail-modal.tsx`: mismo mensaje hardcodeado, eliminado.
- `use-nueva-ficha-reserva.ts`: `handleMarcarComoAtendida` tragaba el error en silencio
  (`catch { /* Ignorar */ }`) sin mostrar nada al usuario — se agregó `errorMsg` y un mensaje
  inline mínimo en `index.tsx` (no la `Alerta` de A4, que aún no existe). También se eliminó
  `refetchPerfil()` manual tras `updateEstado`: la invalidación ahora vive enteramente en
  `useUpdateCitaEstadoMutation` (se agregó invalidar `["pacientes"]`, que faltaba), no repartida
  entre el hook y el call site.
- **Resuelto solo a medias:** las **queries** (`useGetCita`, `useGetImpactoCancelacion`) siguen
  sin superficie de error — nadie lee `isError`/`error` en los 5 archivos migrados. Si el GET
  falla, la vista se queda cargando indefinidamente sin avisar (antes era un `.then()` sin
  `.catch()`; el silencio cambió de mecanismo, no desapareció). Pendiente, no corregido en A2.

**No se montó `<Toaster />`**: `components/ui/sonner.tsx` usa el patrón "fondo claro + borde +
radio" que A4 va a eliminar del panel, y depende de `useTheme()` de `next-themes` sin
`ThemeProvider` montado en ningún lado. Queda pospuesto a después de A4, retematizado con los
tokens de `Alerta`.

**Nota sobre alcance del "4 de 14" original:** era una predicción errada del documento. Medido:
pasaron de 14 a 13 `set-state-in-effect` (el que queda en `cancel-appointment-modal.tsx` y
`ficha-detalle-modal.tsx` resetea estado local de UI al cerrar, no datos de TanStack Query).
Lint del proyecto completo antes de A2: 47 problemas; después: 43 (`no-console` 5→2). "Lint
limpio" en las entregas de A2 se refiere siempre a los archivos tocados, no al proyecto
completo — usar ese baseline (43) como referencia en A7.

**Los 2 `react-hooks/set-state-in-effect` en `cancel-appointment-modal.tsx` y
`ficha-detalle-modal.tsx` son preexistentes** (verificado contra el commit anterior a esta
sesión) — no son de datos que TanStack Query resuelva (reset de estado local de UI al
cerrar/cambiar), quedan para A7.

**Criterio de aceptación:** cumplido — forzar un 409 (bloques no consecutivos) muestra el
mensaje textual del backend en pantalla.

---

### A3. Arreglar el buscador de pacientes — ✅ hecho

**Corrección al diagnóstico inicial:** el backend **sí filtra bien**.
`PacienteRepository.GetAllAsync` aplica `ILIKE '%término%'` sobre nombre, apellido, email y
RUT, y ordena por apellido. El problema es de frontend.

Qué pasa realmente en `paciente/hooks/use-paciente-reserva.ts`:
- **Sin debounce**: una request HTTP por cada tecla pulsada.
- La `queryKey` cambia en cada pulsación → TanStack Query monta una entrada de caché nueva y
  muestra la lista vacía o la anterior mientras carga. Se percibe como *"trae todos"*.
- **Sin mínimo de caracteres**: con 1 letra devuelve casi la tabla completa.
- **Sin estado de carga** ni indicación de que está buscando.

Cambios:
- Hook nuevo `hooks/common/use-debounce.ts` (300 ms) — reutilizable por el resto del panel.
- Mínimo de 2 caracteres antes de consultar.
- Exponer `isFetching` y mostrar "Buscando…".
- `placeholderData: keepPreviousData` en `useGetPacientes` para que la lista no parpadee.
- Quitar el texto de ayuda duplicado: hoy el `placeholder` y la prop `ayuda` dicen lo mismo
  ("Buscar por nombre o RUT…").

**Criterio de aceptación:** escribir "lu" dispara **una** request tras 300 ms y lista solo
coincidencias, ordenadas por apellido.

**Ejecución:** implementado tal cual el diagnóstico. `hooks/common/use-debounce.ts` genérico
(300 ms por defecto). `placeholderData: keepPreviousData` agregado en `useGetPacientes`
(`hooks/api/use-paciente-service.ts`), compartido por los 4 consumidores del hook — beneficio
directo, no solo para el paso Paciente. La prop `ayuda` de `SearchInput` dejó de ser texto
estático duplicado y ahora comunica estado real: "Escribe al menos 2 caracteres." bajo el
mínimo, "Buscando…" mientras `isFetching`, nada cuando no aplica. El
`react-hooks/set-state-in-effect` que queda en `use-paciente-reserva.ts` (sincroniza
`pacienteConfirmado` con `perfilCargado`) es preexistente, no tocado por A3.

---

### A4. Sistema unificado de alertas — ✅ hecho

**Estado actual:** 12 cajas de alerta escritas a mano, duplicadas, con estilos incoherentes
entre sí — `rounded-none` / `rounded-lg` / `rounded-xl`, `border-red-200` / `border-red-300`,
`text-red-700` / `text-red-800`, todas con el patrón "fondo claro + borde oscuro" que Maxi
quiere eliminar. No existe ningún componente compartido.

**Decisión (confirmada):** **fondo sólido, texto blanco, sin borde.** Un color por tono.

Componente nuevo `components/shared/alerta.tsx`:

| Tono | Fondo | Uso |
|---|---|---|
| `error` | `bg-red-700` | errores de validación y de API |
| `advertencia` | `bg-amber-600` | avisos no bloqueantes |
| `exito` | `bg-emerald-700` | confirmación de operación |
| `info` | `bg-blue-800` | contexto neutro |

Todos: `text-white`, `rounded-none`, `p-3`, `font-sans text-xs font-semibold`, sin borde ni
sombra. Coherente con la Especificación Visual (radios bajos, sin sombras difusas).

Reemplaza las 12 ocurrencias en:
`acceso/index.tsx`, `agenda/components/appointment-detail-modal.tsx`,
`agenda/components/cancel-appointment-modal.tsx`,
`agenda/components/gestion-bloqueos-modal.tsx`,
`especialistas/components/crear-especialista-modal.tsx`,
`especialistas/components/editar-especialista-modal.tsx`,
`especialistas/components/eliminar-especialista-modal.tsx`,
`fichas/formatos/nuevo/index.tsx`, `fichas/nueva/contenido/index.tsx`,
`landing/index.tsx` (×2), `nueva-reserva/resumen/index.tsx`,
`pacientes/nuevo/index.tsx`, `ventas/components/configuracion-financiera-modal.tsx`.

Se aplica también a los mensajes nuevos de A1.

**Sub-paso separado (A4b):** los **botones destructivos** siguen el mismo patrón a eliminar
(`border border-red-300 bg-red-50 text-red-700`). Se unifican a fondo sólido en
`appointment-detail-modal.tsx:343`, `cancel-appointment-modal.tsx:139`,
`gestion-bloqueos-modal.tsx:307`, `editar-especialista-modal.tsx:51`,
`fichas/formatos/nuevo/index.tsx:145`.

**Ejecución:** `components/shared/alerta.tsx` creado tal cual la especificación (4 tonos,
`text-white`, `rounded-none`, sin borde ni sombra) y registrado en el barrel. Las 13
ocurrencias migradas. Dos ajustes sobre el diagnóstico original:
- `agenda/components/gestion-bloqueos-modal.tsx` **no tenía ninguna caja de alerta** (no hay
  manejo de error en ese componente en absoluto — ni try/catch, ni estado de error). El
  diagnóstico original lo incluía en la lista de 12; se corrige aquí. Sí tenía el patrón de
  botón destructivo de A4b (toggle Activar/Desactivar, línea 307), ese sí se unificó a fondo
  sólido.
- `especialistas/components/eliminar-especialista-modal.tsx` usaba el patrón "fondo claro +
  borde" en su aviso ámbar pero no estaba en la lista original de 12 — se migró igual porque
  es exactamente el patrón que A4 vino a eliminar.

Quedan **fuera de alcance deliberadamente**: el cuadro azul informativo de
`landing/index.tsx` (sección "Nota" del tab Equipo, con ícono SVG) — no es un mensaje de
error/advertencia/éxito dinámico sino contenido estático, no aplica el patrón `errorMsg`; y el
`variant="destructive"` de shadcn en `eliminar-especialista-modal.tsx` — ya usa el componente
compartido `Button`, no el patrón manual que A4b ataca.

Lint limpio en los 15 archivos tocados (componente + barrel + 13 vistas). Los 3
`set-state-in-effect` que aparecen al lintear `cancel-appointment-modal.tsx` y
`gestion-bloqueos-modal.tsx` son preexistentes, no tocados por A4 (efectos de inicialización de
formulario y reset de UI, no de datos de TanStack Query).

---

### A5. Unificar el tamaño de los modales — ✅ hecho

**Estado actual:** `components/shared/modal.tsx` tiene `ancho = "max-w-3xl"` por defecto y 8
de los 13 modales lo usan tal cual. De ahí que todos se vean igual de "flacos".

**Decisión (confirmada):** **todos al mismo ancho grande**, para mantener el estilo en todo
el panel.

- `modal.tsx`: por defecto `max-w-6xl`, `max-h-[92vh]`, con la cabecera fija y el cuerpo
  desplazable (hoy el `overflow-y-auto` está en el contenedor completo, así que la cabecera
  se va con el scroll).
- Quitar la prop `ancho` de los 13 consumidores para que todos hereden el mismo tamaño:
  `appointment-detail-modal`, `cancel-appointment-modal`, `gestion-bloqueos-modal`,
  `crear-especialista-modal`, `editar-especialista-modal`, `eliminar-especialista-modal`,
  `especialistas/index.tsx`, `ficha-detalle-modal`, `fichas/formatos/nuevo/index.tsx`,
  `landing/index.tsx` (×2), `nueva-reserva/resumen/index.tsx`, `paciente-detalle-modal`,
  `configuracion-financiera-modal`, `nueva-venta-modal`, `venta-detalle-modal`.
- La prop se conserva en la firma por si más adelante hace falta una excepción, pero deja de
  usarse.

**Nota de diseño:** los modales de detalle van a quedar con mucho aire. Como parte de este
sub-paso se revisa que el contenido use el ancho (el de "Detalle de Reserva" pasa a las dos
columnas 65/35 que fija la Especificación Visual).

**Ejecución:** `modal.tsx` con `max-w-6xl`/`max-h-[92vh]` por defecto; prop `ancho` retirada de
los 14 usos encontrados en los 13 consumidores listados (uno de los dos usos de `landing/index.tsx`
ya no tenía la prop — el modal de confirmación de guardado nunca la usó). La cabecera fija se
implementó agregando `sticky top-0 z-10` al `<div>` de header en los **7 archivos** que comparten
el patrón idéntico `border-b border-slate-200 bg-slate-50/80 px-6 py-4` (los que tienen scroll
real de contenido: `appointment-detail-modal`, `cancel-appointment-modal` no lo necesitaba por ser
corto, `ficha-detalle-modal`, `gestion-bloqueos-modal`, `venta-detalle-modal`,
`nueva-venta-modal`, `paciente-detalle-modal`, `configuracion-financiera-modal`). Los demás
consumidores (`crear/editar/eliminar-especialista-modal`, `landing/index.tsx`,
`fichas/formatos/nuevo/index.tsx`, `nueva-reserva/resumen/index.tsx`, `especialistas/index.tsx`)
son diálogos cortos sin necesidad real de header fijo — no se tocó su markup interno, solo el
ancho heredado de `modal.tsx`.

Lint limpio en los 16 archivos tocados; los 5 `set-state-in-effect` que aparecen al lintear son
preexistentes (confirmado por diff — ninguno de los efectos modificados por A5).

---

### A6. Limpieza de deuda del asistente de nueva reserva

- `PASOS_NUEVA_RESERVA` está **duplicado literal en 5 archivos** (servicio, horario,
  especialista, paciente, resumen). Se centraliza en un solo módulo.
- Eliminar los fallbacks `parseInt(...) || 1` de `use-resumen-reserva.ts:87-89`: si falta un
  id, es un error de flujo y debe fallar visiblemente, no inventar el paciente 1.
- Quitar el `console.error` de `use-resumen-reserva.ts:103` (regla `no-console`), sustituido
  por la alerta de A4.
- `especialistaId` y `pacienteId` se guardan como `string` en el store y se parsean con
  regex en cada uso. Pasan a `number | null`, que es lo que el backend espera.

---

### A7. Deuda técnica transversal del panel

- **3 archivos sin commitear** (`ui/dialog.tsx`, `ui/alert-dialog.tsx`, `ui/index.ts`)
  corrigen el casing de imports (`@/components/ui/button` → `Button`). **Es un bug de build
  en Docker/Linux**: hoy compila solo porque Windows no distingue mayúsculas. Debe commitearse
  antes que nada — es el riesgo que la propia arquitectura documenta en su sección 8.
- **ESLint: 37 errores y 10 warnings.**
  - 14 × `react-hooks/set-state-in-effect` (4 se van con A2)
  - 13 × `prettier/prettier`
  - 10 × `@typescript-eslint/no-unused-vars`
  - 5 × `no-console`
  - 2 × `import/no-duplicates`, 2 × `no-explicit-any`, 1 × `no-duplicate-imports`
- `landing/index.tsx:52` usa `col-span-${f.gridCols || 1}`. **Tailwind no genera clases
  interpoladas**: esa clase no existe en el CSS final y el campo nunca ocupa el ancho previsto.
  Se reemplaza por un mapa de clases literales.
- `appointment-service.ts` usa tipos de `@/types` (legado) en vez de `models/`, y duplica
  `getEspecialistas` con `especialista-service.ts` (pendiente #10).
- `views/app/(public)/home/components/team-section.tsx`: dos `any` y un `setTeamMembers` que
  nunca se llama — código muerto del prototipo.
- `lib/api/apiClient.ts`: código muerto confirmado (pendiente #7), solo se importa el tipo
  `ApiError`. Candidato a eliminar.
- `components/ui/sonner.tsx` (Toaster) existe y está tematizado pero **no está montado en
  ningún layout** (pendiente #8). Se monta en A2 para que los errores de mutación tengan
  dónde mostrarse.

---

## Parte B — Sección "Configuración" con pestañas

**Objetivo:** `Configuración Landing` deja de ser una sección suelta y `Especialistas` deja de
ser un ítem de primer nivel del sidebar (donde se malinterpreta como gestión de personal).
Ambas pasan a ser pestañas de una única sección **Configuración**.

### Auditoría CRUD del backend (verificada controlador por controlador)

| Módulo | GET | POST | PUT | PATCH estado | DELETE | Service en frontend | ¿Backend? |
|---|---|---|---|---|---|---|---|
| Especialistas | ✅ | ✅ | ✅ | ✅ | ⚠️ 409 | ✅ completo | no |
| Servicios | ✅ | ✅ | ✅ | ✅ | — (baja lógica) | ⚠️ **solo GET** | no |
| Empresas | ✅ | ✅ | ✅ | ✅ | — (baja lógica) | ⚠️ **solo GET** | no |
| Bloques horario | ✅ solo disponibles | ✅ | ❌ | ✅ | ❌ | ⚠️ solo GET público | no (por decisión) |

**Conclusión: la Fase 1 Parte B no requiere ningún cambio de backend.** Servicios y Empresas
tienen CRUD completo del lado servidor; solo faltan los métodos en los services del frontend.

**Decisión sobre Bloques horario (confirmada):** no se agregan endpoints. Editar o borrar un
bloque suelto alteraría la lógica de cadenas consecutivas de 30 minutos sobre la que se apoya
todo el agendamiento. La pestaña administra la **generación** de agenda a partir de plantillas
y horario del centro (lo que ya existe), no bloques individuales.

**Sobre el módulo Horarios:** estaba asignado a Jhoan y marcado como intocable. **Ese
supuesto queda anulado — Jhoan ya no continúa en el proyecto**, así que Horarios entra en el
alcance de este plan y lo asume Maxi.

---

### B1. Shell de la sección Configuración
- Ruta nueva `app/(panel)/panel/(shell)/configuracion/` con layout de pestañas.
- Pestaña activa por query param (`?tab=`), para que sea enlazable y sobreviva al refresh.
- `components/layout/sidebar.tsx`: `Configuración Landing` y `Especialistas` salen del menú;
  entra un único ítem **Configuración**.
- `proxy.ts`: las reglas de solo-administrador de `/panel/especialistas` y `/panel/landing`
  se trasladan a `/panel/configuracion`. **Sin esto queda un hueco de autorización.**
- Redirecciones desde las rutas viejas para no romper enlaces existentes.
- Se usa `components/ui/tabs.tsx` (ya instalado, hoy sin usar).

### B2. Pestaña "Landing"
- Mover `views/app/panel/landing/` a `views/app/panel/configuracion/landing/`.
- Corregir el `col-span` dinámico (ver A7).
- Alertas al estilo de A4.
- Sin cambios funcionales.

### B3. Pestaña "Especialistas" (+ corrección de estilo)
- Mover `views/app/panel/especialistas/` a `views/app/panel/configuracion/especialistas/`.
- **Es la sección que más se desvía del estilo del panel.** Hoy usa `rounded-2xl`,
  `rounded-full`, `shadow-lg`, `shadow-md`, `border-4` y badges tipo píldora
  (`rounded-full bg-emerald-100 text-emerald-800`), todo contra la Especificación Visual
  (radios ≤ 6px, bordes de 1px, sin sombras difusas, estados como `• ACTIVO` en vez de
  píldoras). Es residuo del código original sin pasar por el refactor visual.
- Archivos: `especialista-card.tsx`, `crear-especialista-modal.tsx`,
  `editar-especialista-modal.tsx`, `eliminar-especialista-modal.tsx`,
  `servicios-selector.tsx`.
- **Registrar sin resolver:** el `DELETE /especialistas/{id}` devuelve 409 por
  `DeleteBehavior.Restrict` (pendiente #4, bug de backend confirmado con curl). Fuera del
  alcance de esta fase; la interfaz debe mostrar el mensaje real (ya posible gracias a A2)
  en vez de fallar en silencio.

### B4. Pestaña "Servicios" (nueva)
- `services/servicio-service.ts`: agregar `create`, `update`, `updateEstado`
  (hoy solo tiene `getAll`).
- `hooks/api/use-servicio-service.ts`: mutaciones con invalidación de `["servicios"]`.
- `models/requests/servicio.ts`: `CreateServicioRequest`, `UpdateServicioRequest`,
  verificados contra `CreateServicioDTO` / `UpdateServicioDTO` de C#.
- Vista: tabla + modal de crear/editar + toggle de estado, con el estilo del panel.
- **Impacto directo:** los servicios alimentan el paso 1 del asistente de reserva y el
  formulario público. Poder crearlos desde el panel cierra ese circuito.

### B5. Pestaña "Empresas / Convenios" (nueva)
- Mismo patrón que B4 sobre `EmpresaController` (CRUD completo en backend).
- `services/empresa-service.ts` pasa de solo `getAll` a CRUD completo.
- Cierra el pendiente #23 (los convenios eran mock local, nunca tuvieron interfaz real).
- Los convenios ya se consumen en el alta de pacientes (`use-registrar-paciente.ts`) y
  afectan el cálculo de ventas: hoy no hay forma de administrarlos.

### B6. Pestaña "Horarios"
- Reubicar `views/app/panel/horarios/` dentro de Configuración.
- Se apoya en `horario-service.ts` + `use-horario-service.ts`, ya migrados a TanStack Query.
- **Sin endpoints nuevos.** Administra plantillas de horario, horario del centro y generación
  de agenda (`POST /agenda/generar`), no bloques sueltos.
- Revisión de estilo contra la Especificación Visual, igual que B3.

---

# FASE 2 — SITIO PÚBLICO

**Aclaración sobre el alcance.** El refactor **no** reescribió el estilo de las secciones
públicas: en el commit `bb4f03f`, `about-section`, `gallery-section`, `location-section`,
`process-section` y `team-section` se movieron con **0 líneas de diff**. La mezcla de estilos
tiene dos orígenes concretos y rastreados, ambos anteriores:

1. **`65cd5d7`** — *"feat(panel): rediseñar panel administrativo con sistema Frameless
   Satoshi"* metió una regla global en `globals.css`, que es **compartido** entre panel y web.
2. **`1a56980`** — *"style(design): implement Flat Design (Departamento / Súper plano) with
   solid colors, crisp borders, and zero depth/shadows"* aplanó los botones y el formulario de
   toda la web pública.

Ambos son commits de Jhoan. **Solo se revierte el estilo; nada funcional ni de secciones
actuales se toca.**

---

### C1. Devolver Inter al sitio público

**El bug:** `app/globals.css:73-81` fuerza

```css
html, body { font-family: "Satoshi", ... !important; }
```

`(public)/layout.tsx` carga Inter con `next/font` y expone `--font-inter-sans`, pero el
`!important` de Satoshi la anula. **Inter se descarga en cada visita y jamás se aplica.**
Antes de `65cd5d7` la web usaba `var(--font-geist-sans)`.

Además `globals.css:11` declara `--font-sans: var(--font-sans)` — una **autorreferencia
circular** que deja la variable sin valor; por eso todo depende del `!important`.

Cambios:
- Quitar el `!important` y la regla global de Satoshi de `html, body`.
- Resolver la autorreferencia de `--font-sans`.
- Panel (`(panel)/layout.tsx`): Satoshi mediante variable de fuente, **con alcance al panel**.
- Público (`(public)/layout.tsx`): `--font-inter-sans` mapeado a `--font-sans`.
- Verificar que ninguna sección pública dependa implícitamente de las métricas de Satoshi.

### C2. Recuperar el estilo de los botones

Hoy se ven "cuadrados sin borde" por dos motivos que se suman: el `Button` de shadcn
(`rounded-lg`, `uppercase`, `font-bold`, `tracking-wider` — pensado para el panel) y el
aplanado de `1a56980`, que quitó relieve y profundidad.

El estilo previo (commit padre de `1a56980`) era, por ejemplo en el CTA del hero:

```
bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-xl px-8 py-4
shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40
hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200
```

- Recuperar radio `rounded-xl`, sombra de color de marca y el micro-desplazamiento en hover.
- Los botones públicos **no** usan el `Button` de shadcn del panel: se mantienen separados,
  que es justamente lo que evita que los estilos se vuelvan a mezclar.
- Alcance: `hero-section.tsx`, `about-section.tsx`, `location-section.tsx`,
  `navbar.tsx`, `footer.tsx`.

### C3. Formulario de reserva: estilo previo + alto fijo con scroll

**Dos problemas distintos, un solo archivo (`booking-card.tsx`, 787 líneas).**

**(a) El formulario crece con cada servicio.** Verificado: las listas de fechas (línea 514) y
horas (566) **sí** tienen `max-h-[160px] overflow-y-auto`, pero las de **servicios** (360) y
**especialistas** (422) no tienen ninguna restricción de alto. Cada servicio nuevo estira la
tarjeta. Se aplica el mismo `max-h` + scroll interno a esas dos listas, y un alto mínimo
estable para que la tarjeta no salte al cambiar de paso.

**(b) Estilo rígido.** El commit `c8c3554` — *"feat(ui): implement modern interactive Date
Chip selector in BookingCard"* — es el estilo "único" que se perdió: chips de fecha en columna
(día / número / mes) con `rounded-2xl`, badges de acento `rounded-full`, iconos por campo y
transiciones. `8d53926` y luego `1a56980` lo aplanaron. Se recupera ese diseño de chips
manteniendo intacta la lógica actual (TanStack Query, `useBookingStore`, flujo de pago).

**Registrar sin resolver:** el formulario público todavía pide **duración explícita**
(`[30, 60, 90].map(...)`, línea 604), porque el endpoint público `POST /citas` usa
`CreateCitaDTO` con `DuracionMinutos`, mientras que el del panel ya usa `BloqueHorarioIds`.
Unificar ambos flujos al modelo multi-bloque **sí exigiría tocar el backend**. Queda fuera de
alcance y anotado como decisión pendiente.

### C4. Recuperar el mapa de procesos animado

**Buena noticia: el efecto no se borró, sigue íntegro en el código.**

Es del commit `b211c6a` — *"style: redesign process path to feature a thick solid brand blue
wave connection line"*. Una onda SVG en tres trazos superpuestos: glow difuminado
(`strokeWidth 28`, `blur-[12px]`), núcleo sólido azul `#0C5DC5` (`strokeWidth 14`), y encima
una línea blanca con `stroke-dasharray: 10 12` animada por `@keyframes pathFlow` — **ese es el
efecto "carretera"**. Vive hoy en `process-section.tsx:91-123`.

Lo único que cambió: el commit `f657092` reemplazó el fondo de la sección

```
bg-gradient-to-b from-slate-50 via-blue-50/10 to-slate-50   →   bg-white
```

Sobre blanco, el trazo con `-z-10` pierde todo contraste y queda plano detrás de las tarjetas.

- Restaurar el fondo con gradiente.
- **Verificar en navegador** si además hace falta ajustar el apilamiento: el SVG usa `-z-10`
  y las tarjetas del grid son `bg-white` opacas, así que puede necesitar `z-0` con las
  tarjetas en `z-10`. Se confirma visualmente antes de decidir, no a ciegas.
- No se toca la lógica dinámica de `processStepsJson` que llega desde el panel.

---

# FASE 3 — AUDITORÍA TÉCNICA Y MEJORAS

Corresponde a las Secciones 4 y 5 del plan anterior. **Se reporta, no se corrige sin
autorización** — salvo lo que se apruebe explícitamente.

### D1. Resultado de la auditoría (Sección 4 del plan anterior)

| # | Señal | Estado |
|---|---|---|
| 1 | URL `*.vercel.app` expuesta | ✅ no aparece |
| 2 | View-source vacío | ✅ el home hace SSR de landing-config y especialistas |
| 3 | Página 404 propia | ❌ **no existe `not-found.tsx`** |
| 4 | Vite/React donde se esperaría Next | ✅ Next 16 App Router, consistente |
| 5 | Mismo `<title>` en todas las páginas | ❌ **ninguna de las 28 páginas define metadata propia** |
| 6 | Meta descripciones | ⚠️ solo la global, ninguna por página |
| 7 | OG Image | ❌ **`openGraph` sin `images`; no hay `opengraph-image`** |
| 8 | Datos estructurados | ✅ JSON-LD `PhysicalTherapyClinic` en `(public)/layout.tsx` |
| 9 | `<h1>` por página | ⚠️ el home usa `<p>` con estilo de título en varias secciones |
| 10 | Tag canónico | ❌ **sin `metadataBase` ni `alternates.canonical`** |
| 11 | `llm.txt` | ❌ no existe |
| 12 | `robots.txt` | ❌ **no existe** (el panel sí declara `noindex` por metadata) |
| 13 | Favicon | ✅ `icon.svg` en ambos grupos de rutas |
| 14 | Sitemap | ❌ **no existe** |
| 15 | Atributo `lang` | ✅ `lang="es"` en ambos layouts |
| 16 | `alt` en imágenes | ⚠️ revisar caso por caso; el modelo ya trae `FotoAlt` del backend |
| 17 | Sourcemaps en producción | ⚠️ `next.config.ts` no los desactiva explícitamente |
| 18 | Errores de consola | ⚠️ 5 `console.*`; el de `axios-provider` se dispara al expirar sesión |
| 19 | Bundle excesivo | ⚠️ sin medir — `booking-card.tsx` tiene 787 líneas en un solo cliente |
| 20 | **Hardcoding** | ❌ **el hallazgo principal** — ver detalle abajo |

**Inventario de hardcoding (señal 20, la más importante):**
- `|| 1` como especialista/paciente por defecto (`use-horario.ts:82-84`,
  `use-resumen-reserva.ts:87-89`) → **causa directa del 409**.
- Corte mañana/tarde `"14:00"` / `"15:00"` → oculta bloques sin avisar.
- `DEFAULT_PROCESS_STEPS` con 4 pasos escritos en el componente
  (`process-section.tsx:13-37`) — se usan si el backend no responde.
- `"Servicio Operativo"` fijo bajo cada servicio en `booking-card.tsx:378`.
- `BOOKING_SERVICES` mock en `services-section.tsx`, componente huérfano exportado en el
  barrel pero nunca renderizado (excepción ya documentada en la arquitectura).
- `CLINIC_INFO` en `lib/utils.ts` duplica datos que el backend ya expone vía landing-config.
- `PASOS_NUEVA_RESERVA` repetido en 5 archivos.

### D2. Mejoras propuestas (Sección 5) — priorizadas
**Alta** (cierran señales críticas y son de bajo riesgo):
1. `not-found.tsx` propia (señal 3).
2. `app/robots.ts` — permitiendo crawlers de IA, `Disallow: /panel` (señales 9 y 12).
3. `app/sitemap.ts` (señal 14).
4. Metadata por página: título único, descripción y canonical (señales 5, 6, 10).
5. `metadataBase` + `opengraph-image` (señal 7).

**Media:**
6. Corregir jerarquía de encabezados: un solo `<h1>` real por página (señal 9).
7. `alt` descriptivo en todas las imágenes (señal 16), aprovechando `FotoAlt`.
8. Sección de 5 preguntas frecuentes + `FAQPage` JSON-LD.
9. Migas de pan en el panel.
10. Página de agradecimiento tras reservar.

**Baja / requieren decisión de Maxi:**
11. CTA fijo en móvil.
12. Google Analytics (implica decidir sobre consentimiento de cookies).
13. `llm.txt`.
14. Reseñas reales: ya hay base en backend con comentarios de Google — **validar que se use
    bien** antes de tocar nada.

### D3. Seguridad — para revisar con Maxi
- **Rate limiting**: no se detectó en el frontend. Debe verificarse en el backend, sobre todo
  en `/auth` y en la creación de citas.
- **API keys**: ✅ solo se usa `NEXT_PUBLIC_API_URL` (pública por diseño) y
  `NEXTAUTH_SECRET` (servidor). No hay secretos filtrados al bundle.
- **`FileController` vs `MediaController`** (pendiente #24): existe una vía de subida
  autenticada (`/api/archivos`, Cloudinary) y el frontend sigue usando `/api/media`, que
  tiene `[AllowAnonymous]`. **Se está usando la vía insegura teniendo la correcta
  disponible.** La Fase B del protocolo original nunca terminó de auditarlo.
- **Rotación de credenciales** (pendiente #1): la hace Maxi antes de producción.

---

## ANEXO — Pendientes previos y su estado en este plan

De `docs/Pendientes_Tecnicos_KineFit.txt` (27 ítems). **Ninguno se da por resuelto sin
evidencia.**

| # | Pendiente | Dónde queda |
|---|---|---|
| 4 | DELETE especialista → 409 (backend) | B3, solo se reporta en interfaz |
| 7 | `apiClient.ts` código muerto | A7, propuesto eliminar |
| 8 | Toaster sin montar | A2, se monta |
| 10 | `getEspecialistas` duplicado | A7 |
| 16 | `set-state-in-effect` + `no-console` | A7 (parcial en A2) |
| 19 | Bloques horario: falta POST/PATCH en frontend | B6, **decisión: no se agregan** |
| 21 | Contenido/Testimonios/ProcesoEtapas sin service | **fuera de alcance**, se mantiene el blob JSON actual |
| 22 | `DisponibilidadController` sin service | **A1 — resuelto: es la API vigente** |
| 23 | Empresas sin service | **B5 — resuelto** |
| 24 | FileController (Cloudinary) vs MediaController | D3, se reporta |
| 26 | Notificacion / Servicio / UsuarioPersonal | Servicio → **B4**; los otros dos siguen sin evaluar |
| 27 | `useBookingStore` no persiste | **fuera de alcance**, sigue registrado |

Ítems **1, 5, 6, 9, 11, 12, 13, 14, 15, 17, 18, 20, 25** siguen abiertos sin cambios.

---

## Resumen de impacto

| Fase | Sub-pasos | Backend | Riesgo |
|---|---|---|---|
| 1-A | A1 … A7 | ninguno | medio (A1 reescribe el paso Horario) |
| 1-B | B1 … B6 | ninguno | medio (B1 mueve rutas y autorización) |
| 2 | C1 … C4 | ninguno | bajo (solo estilos) |
| 3 | D1 … D3 | por definir | bajo |

**El plan completo no requiere ningún cambio en el backend.** Los dos puntos que sí lo
exigirían — CRUD de bloques horario y unificar el flujo público al modelo multi-bloque —
quedan explícitamente fuera de alcance por decisión tomada.

---

## Punto de partida propuesto

**A7 (parcial): commitear los 3 archivos pendientes del casing de imports.** Es lo único que
hoy rompe el build en Docker/Linux, es de un minuto y no depende de nada más.
Después, **A2** (interceptor de errores), porque sin ver los mensajes reales del backend no
se puede verificar que A1 funcione.

Esperando **"Procede"**.
