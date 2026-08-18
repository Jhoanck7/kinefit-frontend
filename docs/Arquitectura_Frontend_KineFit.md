# KineFit Frontend — Arquitectura del sistema

Documento de referencia para que otra IA (o una persona nueva) entienda la estructura del
repo sin necesidad de leer todo el código primero. Describe capas, responsabilidad de cada
carpeta y el flujo real de datos, verificado contra el código en `feature/administrative-panel`
(no contra documentación antigua ni mocks).

Stack: Next.js 16 (App Router + Turbopack), TypeScript, TanStack Query, Zustand, Axios,
NextAuth, Tailwind CSS. Backend: API REST en .NET (repo separado `kinefit-backend`).

---

## 1. Principio arquitectónico central

Cada feature del panel sigue una cadena de **4 capas**, siempre en el mismo sentido
(una capa solo puede llamar a la que tiene debajo, nunca saltarse una ni ir hacia arriba):

```
app/.../page.tsx                              (ruta Next.js — "thin", sin lógica)
  → views/app/<feature>/index.tsx             (View — solo JSX/presentación)
    → views/app/<feature>/hooks/use-<x>.ts    (orquestación — estado, handlers, navegación)
      → hooks/api/use-<x>-service.ts          (TanStack Query — caché, invalidación)
        → services/<x>-service.ts             (clase Axios — 1 método = 1 endpoint)
          → models/{requests,responses}/*.ts  (formas exactas del backend, verificadas contra los DTOs de C#)
```

**Regla dura:** `lib/` solo contiene funciones puras (sin `class`, sin tipos/interfaces/
constantes exportadas), con una única excepción deliberada: `lib/utils.ts` es el "archivo
base de ayudas" y sí aloja constantes de UI (`cn()`, `defaultMetadata`, copys de landing,
etc.) — decisión explícita del usuario, no un descuido.
Nota de auditoría: `lib/estados.ts` hoy exporta tipos/interfaces/constantes
(`CATALOGO_ESTADOS`, `DefinicionEstadoCita`, etc.) sin ser `utils.ts` — es una desviación
de la regla, documentada aquí para que quien la toque decida si migrarla a `models/`, no
para que se corrija automáticamente.

---

## 2. Ejemplo completo de la cadena (feature "Pacientes")

**`app/(panel)/panel/(shell)/pacientes/page.tsx`** — la página es un wrapper de una línea:
```ts
export default function PacientesPage() {
  return <PacientesView />;
}
```

**`views/app/panel/pacientes/index.tsx`** — View: solo JSX, consume el hook orquestador.

**`views/app/panel/pacientes/hooks/use-pacientes.ts`** — orquestación: estado de UI
(búsqueda, paginación, modal por query param), navegación (`useRouter`), y llama a los
hooks de `hooks/api/`. No sabe nada de Axios ni de URLs.

**`hooks/api/use-paciente-service.ts`** — un hook de TanStack Query por operación
(`useGetPacientes`, `useCreatePacienteMutation`, ...). Define `queryKey`, `enabled`,
invalidación (`onSuccess: () => queryClient.invalidateQueries(...)`).

**`services/paciente-service.ts`** — clase `PacienteService extends BaseApiService`,
un método por endpoint, tipado con `ApiResponse<T>` de `models/generics` y los DTOs de
`models/requests`/`models/responses`. Se exporta una instancia singleton
(`export const pacienteService = new PacienteService()`).

**`models/responses/paciente.ts`** — las formas de respuesta, verificadas 1:1 contra los
DTOs C# del backend real (nunca contra datos mock).

Todas las features del panel (Especialistas, Pacientes, Citas/Bloqueos, Fichas Clínicas,
Formatos, Ventas, Reportes, Landing-config, Convenios/Empresas, Horarios, Nueva Reserva,
Auditoría) siguen exactamente este patrón.

---

## 3. Estructura de `src/`

```
src/
├── app/            # Rutas Next.js (App Router) — SOLO páginas thin + layouts
├── views/          # Vistas + hooks de orquestación por feature (el "código real")
├── hooks/
│   ├── api/        # 1 archivo por entidad backend, hooks de TanStack Query
│   └── common/     # hooks compartidos sin relación a una entidad (ej. useHoyPanel)
├── services/       # 1 clase Axios por entidad backend (extiende BaseApiService)
├── models/
│   ├── requests/   # payloads que el frontend envía
│   ├── responses/  # payloads que el backend devuelve
│   └── generics/   # ApiResponse<T>, tipos de auth compartidos
├── stores/         # Zustand — solo estado de wizard/UI multi-paso (no cache de servidor)
├── providers/      # axios-provider (instancia + interceptor JWT), query-provider, etc.
├── components/
│   ├── ui/         # primitivas de diseño (Button, Card, Dialog, AlertDialog...)
│   ├── layout/     # navbar, sidebar, footer, header, panel-shell
│   └── shared/     # widgets reutilizables entre features (modal, paginación, dropzone...)
├── lib/            # funciones puras. Excepción: utils.ts (ver sección 1)
├── types/          # tipos globales sueltos (legado, en reducción)
└── proxy.ts        # middleware de Next 16 (renombrado desde middleware.ts) — guarda de auth
```

### `app/` — mapa de rutas real
```
app/
├── (public)/                          # sitio público (landing, booking, pagos Webpay)
│   ├── page.tsx                       # Home: SSR de landing-config + especialistas
│   ├── confirmacion/page.tsx
│   └── pago/confirmar/page.tsx
├── (panel)/
│   ├── panel/
│   │   ├── acceso/page.tsx            # login
│   │   ├── page.tsx                   # redirect raíz del panel
│   │   └── (shell)/                   # todas las páginas autenticadas, bajo <Sidebar>
│   │       ├── agenda/(+ bloqueos)
│   │       ├── especialistas/
│   │       ├── pacientes/(+ [id], nuevo)
│   │       ├── fichas/(+ [id], formatos, nueva/contenido, nueva/reserva)
│   │       ├── horarios/
│   │       ├── landing/
│   │       ├── nueva-reserva/(+ especialista, horario, paciente, resumen, servicio, listo)
│   │       ├── reportes/
│   │       └── ventas/
└── api/auth/[...nextauth]/route.ts    # NextAuth (Credentials + Google)
```

### `views/app/panel/<feature>/` — patrón interno de cada feature
```
<feature>/
├── index.tsx              # View (JSX)
├── hooks/
│   ├── index.ts           # barrel
│   └── use-<feature>.ts   # orquestación
├── components/             # sub-componentes propios de la feature (modales, tarjetas)
└── <sub-flujo>/            # ej. pacientes/nuevo/, fichas/nueva/contenido/ — mismo patrón anidado
```

---

## 4. Autenticación y llamadas HTTP

- **NextAuth** (`app/api/auth/[...nextauth]/route.ts`) maneja login (Credentials + Google) y
  guarda `accessToken` (JWT del backend .NET) en la sesión.
- **`providers/axios-provider.tsx`**: instancia única de Axios (`axiosInstance`), con un
  interceptor de request que:
  1. Si la llamada ya trae `Authorization` explícito (flujo público con token de paciente),
     lo respeta y no toca nada.
  2. Si no, busca la sesión de NextAuth (`getSession()`), valida expiración
     (`isSessionExpired`), y si es válida agrega `Authorization: Bearer <token>`.
  3. Si la sesión expiró, fuerza `signOut()` y rechaza la request.
- **`services/base-api-service.ts`**: clase abstracta que todo `*-service.ts` extiende;
  inyecta `httpClient = axiosInstance` y `baseURL` (ej. `/pacientes`).
- **`proxy.ts`** (middleware Next 16, antes `middleware.ts`): guarda de rutas — redirige
  `/panel/acceso` si ya hay sesión válida, y protege rutas solo-administrador
  (`/panel/especialistas`, `/panel/landing`, `/panel/ventas`, `/panel/reportes`) espejando
  las políticas `[Authorize(Policy = PolicyNames.SoloAdministrador)]` del backend.

---

## 5. Estado: TanStack Query vs Zustand — cuándo usar cada uno

- **TanStack Query** (`hooks/api/`): todo lo que viene del backend. Es la única fuente de
  verdad para datos de servidor — nunca duplicar esos datos en un store.
- **Zustand** (`stores/`): solo estado de wizards multi-paso que vive en el cliente y no
  tiene un endpoint propio:
  - `useBookingStore` — flujo público de reserva (selección de servicio/especialista/
    horario/duración antes de crear la cita). Nota conocida: no persiste en localStorage,
    un refresh a mitad del wizard pierde el progreso (deuda documentada, no corregir sin
    permiso — ver `docs/Pendientes_Tecnicos_KineFit.txt` ítem 27).
  - `useNuevaReservaStore` — mismo flujo pero versión panel (reserva manual por staff).
  - `useNuevaFichaStore` — wizard de creación de ficha clínica.
  - Regla de negocio aplicada aquí: cualquier campo que representa una decisión
    (servicio, horario, duración) arranca en `null` explícito, nunca con un default
    silencioso — fuerza elección real antes de avanzar.

---

## 6. Casos especiales (excepciones documentadas, no accidentes)

| Caso | Por qué rompe el patrón | Motivo |
|---|---|---|
| `lib/utils.ts` | exporta constantes/tipos desde `lib/` | Decisión explícita del usuario: es el archivo base de ayudas de UI |
| `lib/formatos-ficha.ts` | vive en `lib/` con side-effects de `localStorage` | `Formato` no es una entidad real de backend — es JSON dinámico (`jsonb`), no tiene DTO propio |
| `ServicesSection` (`views/app/(public)/home/components/services-section.tsx`) | usa datos mock (`BOOKING_SERVICES`) en vez de `LandingConfigResponse` | Componente huérfano: exportado en el barrel pero **no** renderizado por `HomeView` — pendiente de decisión de producto (eliminar, montar o migrar) |
| `lib/estados.ts` | exporta tipos/constantes fuera de `utils.ts` | Desviación no resuelta de la regla de la sección 1 |

---

## 7. Deuda técnica y pendientes

No se debe tocar nada de esto sin autorización explícita del usuario (protocolo del
proyecto). Ver `docs/Pendientes_Tecnicos_KineFit.txt` para el listado completo (27 ítems:
persistencia de `useBookingStore`, endpoints faltantes, código muerto candidato,
vulnerabilidades npm, `react-hooks/set-state-in-effect` y `no-console` repetidos en varios
módulos, etc.).

---

## 8. Convenciones de código

- Comentarios: máximo 1 línea, en español, solo cuando explican un "por qué" no obvio
  (nunca bloques multilínea).
- Nombres de archivo: `kebab-case.tsx`, salvo `components/ui/*` que usa `PascalCase.tsx`
  (Button.tsx, Card.tsx) — los imports deben respetar el case exacto: en Windows el
  filesystem es insensible a mayúsculas y un import mal casado compila localmente pero
  rompe en Linux (Docker/CI) y en el resolvedor de módulos de Turbopack.
- Tipos: viven en `models/`, nunca exportados desde componentes o vistas (excepción
  documentada en sección 6).
