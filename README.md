# KineFit Frontend

Frontend de KineFit Chile. En una sola aplicación Next.js conviven tres áreas:

- **Sitio público** (`kinefitchile.com`): landing institucional, reserva en línea con Google y pago del anticipo con Webpay Plus, y documentos legales.
- **Panel administrativo** (`/panel`): agenda, reservas manuales, pacientes, documentos clínicos, ventas y configuración del sitio.
- **Firma pública de documentos** (`/documentos/[token]`): el paciente revisa y firma sus consentimientos desde el enlace que recibe por correo.

Toda la lógica de negocio vive en el backend .NET (repositorio `kinefit-backend`). Este frontend solo muestra datos y envía lo que el usuario ingresa: no calcula disponibilidad, montos ni reglas de estado.

La documentación técnica completa está en [docs/Manual del Sistema KinefitChile.pdf](docs/Manual%20del%20Sistema%20KinefitChile.pdf).

## Stack

| Área               | Tecnología                                                  |
| ------------------ | ----------------------------------------------------------- |
| Framework          | Next.js 16 (App Router, Turbopack), React 19, TypeScript    |
| Estilos            | Tailwind CSS 4, componentes shadcn/ui sobre Radix           |
| Datos del servidor | TanStack Query sobre Axios                                  |
| Estado local       | Zustand (asistentes de reserva y de ficha)                  |
| Formularios        | React Hook Form y Zod                                       |
| Sesión del panel   | NextAuth 5 (Credentials, con el JWT emitido por el backend) |
| PDF                | pdf-lib y pdfjs-dist (visualización y firma dentro del PDF) |
| Calidad            | ESLint, Prettier, knip y lint-staged                        |

> Next.js 16 trae cambios incompatibles con versiones anteriores. Antes de tocar rutas, middleware o caché, revisa la guía en `node_modules/next/dist/docs/`.

## Requisitos

- Node.js 20 o superior.
- El backend corriendo y accesible. En desarrollo corre en `http://localhost:5147/api` (perfil `http` de su `launchSettings.json`).

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # completar las variables
npm run dev                  # http://localhost:3000
```

### Variables de entorno

| Variable                       | Uso                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`          | URL base del backend, terminada en `/api`. Se incrusta en el build.                               |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client ID de Google para el inicio de sesión del paciente en la reserva. Se incrusta en el build. |
| `AUTH_SECRET`                  | Firma de la sesión de NextAuth. Se genera con `npx auth secret`.                                  |

Las variables `NEXT_PUBLIC_*` se leen **al compilar**: si cambian, hay que volver a construir la imagen. En producción, NextAuth además necesita `AUTH_URL` y `AUTH_TRUST_HOST=true`, que se pasan en el `docker run` de los workflows.

### Scripts

| Comando                                   | Qué hace                                                |
| ----------------------------------------- | ------------------------------------------------------- |
| `npm run dev`                             | Servidor de desarrollo                                  |
| `npm run build` / `npm start`             | Build de producción (`output: "standalone"`) y servidor |
| `npm run lint` / `npm run lint:fix`       | ESLint                                                  |
| `npm run format` / `npm run format:check` | Prettier                                                |
| `npm run type-check`                      | Revisión de tipos con `tsc`                             |
| `npm run knip`                            | Detecta exportaciones y dependencias sin uso            |

## Estructura

```
src/
├── app/                  Rutas (App Router), una por página; solo cargan la vista
│   ├── (public)/         Sitio público: landing, pago, confirmación, documentos legales
│   ├── (panel)/panel/    Panel: acceso y rutas bajo (shell), que comparten el layout con el menú lateral
│   ├── (documentos)/     Firma pública de documentos por token
│   └── api/              Handlers de NextAuth y revalidación de páginas
├── views/                Pantallas completas: cada vista tiene index.tsx, components/ y hooks/
├── components/
│   ├── ui/               Primitivas shadcn/ui
│   ├── shared/           Componentes propios reutilizables (Modal, Alerta, campos de formulario…)
│   └── layout/           Navbar, footer y menú lateral
├── hooks/
│   ├── api/              Hooks de TanStack Query, uno por servicio (use-<recurso>-service.ts)
│   └── common/           Hooks genéricos (debounce, etc.)
├── services/             Clases que consumen la API, una por recurso, sobre BaseApiService
├── models/               Tipos de la API: requests/, responses/ y generics/ (ApiResponse)
├── stores/               Stores de Zustand
├── providers/            Axios, React Query y reloj del panel
├── lib/                  Utilidades puras: formato, estados, horario, auth, PDF
├── auth.config.ts        Configuración de NextAuth
└── proxy.ts              Protección de las rutas del panel (en Next 16 reemplaza a middleware.ts)
```

El flujo de datos va siempre en el mismo sentido:

```
app/<ruta>/page.tsx → views/<vista> → hooks de la vista → hooks/api → services → API
```

Para agregar un recurso nuevo:

1. Crea los tipos en `models/requests` y `models/responses` y expórtalos desde su `index.ts`.
2. Crea el servicio en `services` y el hook en `hooks/api`, y expórtalos desde sus `index.ts`.
3. Usa el hook desde la vista.

Los `index.ts` ordenan sus exportaciones con `simple-import-sort`.

## Áreas del sistema

### Sitio público

- La portada (`/`) se arma con la configuración de landing (`/api/configuracion/landing`) y los especialistas activos. Se regenera cada 60 segundos.
- Cuando se guarda en el panel, se llama a `POST /api/revalidate`, que invalida la portada y los documentos legales para que el cambio se vea al instante.
- La reserva en línea se activa o desactiva desde el panel (`reservasHabilitadas`). Si está desactivada, el botón de reservar de la portada lleva a la URL alterna configurada.
- Flujo de reserva:
  1. Inicio de sesión con Google Identity Services, con aceptación de la política de privacidad.
  2. Elección de servicio, especialista y horario.
  3. Pago del anticipo en Webpay Plus.
  4. Retorno a `/pago/confirmar` y luego a `/confirmacion`.
- `/terminos-y-condiciones` y `/politica-de-privacidad` muestran las secciones guardadas en `/api/contenido` con las claves `terminos` y `privacidad`.

### Panel administrativo

- **Acceso:** `/panel/acceso` autentica contra el backend. NextAuth guarda el JWT del backend en su sesión, y Axios lo envía como `Authorization: Bearer`. Si la sesión expira, se cierra sola y redirige al acceso.
- **Permisos:**
  - `proxy.ts` exige sesión en todo `/panel` y limita algunas rutas a Administrador, las mismas que exige el backend.
  - En Configuración, quien no es Administrador solo ve la pestaña Horarios.
  - El backend es quien manda en los permisos: el frontend solo oculta lo que no corresponde.
- **Menú:** Agenda, Nueva Reserva, Pacientes, Documentos, Ventas y Configuración. Configuración tiene las pestañas Landing, Especialistas, Servicios, Empresas, Personal y Horarios.
- **Rutas antiguas:** `/panel/landing`, `/panel/especialistas` y `/panel/horarios` redirigen a su pestaña de Configuración, y las rutas antiguas de fichas redirigen a Documentos (`next.config.ts`).
- **Documentos clínicos:** fichas, consentimientos y recomendaciones se arman desde plantillas. La firma va **dentro del PDF**: se dibuja en el navegador y se incrusta con pdf-lib, sin coordenadas ni estampado en el backend.

### Firma pública

`/documentos/[token]` no requiere sesión. El token del enlace identifica al documento, y el backend valida su vigencia y su estado.

## Convenciones

- **Idioma:** todo en español, tanto el código de dominio (nombres de funciones, variables y archivos) como los textos de la interfaz.
- **Comentarios:** solo una línea JSDoc (`/** … */`) que describe qué hace cada componente, hook o función exportada. Nada de comentarios explicativos dentro del código.
- **Lógica de negocio:** no se replica en el frontend. Si una regla depende de datos del backend, la resuelve el backend y el frontend muestra el resultado.
- **Interfaz:**
  - Los avisos se muestran con el componente `Alerta`, sin íconos decorativos.
  - En los textos, el separador es siempre la coma, nunca `·` ni `•`.
  - Las fechas y horas se formatean con `lib/formato.ts`, que trabaja en la zona horaria de Chile.
- **Navegación:** en Next 16, `router.push` y `router.replace` a la misma ruta con otros parámetros no navegan tras una carga directa. Para cambiar solo los parámetros de búsqueda (pestañas, modales abiertos por URL), usa `window.history.pushState` o `replaceState`.
- **Commits:** siguen Conventional Commits, en español, por ejemplo `fix(documentos): …`.

## Despliegue

El despliegue es automático con GitHub Actions, en un VPS. Cada push construye la imagen Docker, la publica en GitHub Container Registry y la levanta en el VPS.

| Rama              | Workflow          | Entorno                 | Backend                     | Puerto del contenedor |
| ----------------- | ----------------- | ----------------------- | --------------------------- | --------------------- |
| `test-production` | `deploy-test.yml` | `test.kinefitchile.com` | `api-test.kinefitchile.com` | 3001                  |
| `main`            | `deploy.yml`      | `www.kinefitchile.com`  | `api.kinefitchile.com`      | 3000                  |

Secretos que necesitan los workflows: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `AUTH_SECRET`, `VPS_IP`, `VPS_USERNAME` y `VPS_SSH_KEY`.

Para probar la imagen en local:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:5147/api \
  --build-arg NEXT_PUBLIC_GOOGLE_CLIENT_ID=<client-id> \
  -t kinefit-frontend .
docker run -p 3000:3000 -e AUTH_SECRET=<secreto> -e AUTH_TRUST_HOST=true kinefit-frontend
```

Si en producción el login del panel no persiste la sesión, revisa que `AUTH_URL` apunte al dominio HTTPS real. `proxy.ts` lee la cookie segura (`secureCookie`) cuando `NODE_ENV` es `production`.
