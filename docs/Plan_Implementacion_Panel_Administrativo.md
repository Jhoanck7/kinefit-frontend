# Plan de Implementación — Prototipo no funcional del Panel Administrativo

## KineFit Chile · Frontend

| Campo             | Detalle                                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Documento         | Plan de implementación                                                                                                      |
| Repositorio       | `Jhoanck7/kinefit-frontend`, rama `feature/administrative-panel`                                                            |
| Base de análisis  | Código en `51b300c` (HEAD de `feature/administrative-panel`, idéntica a `main`)                                             |
| Fecha             | 27 de julio de 2026                                                                                                         |
| Documentos fuente | `Briefing_Prototipo_Frontend_KineFit`, `Requerimientos_Panel_Administrativo_KineFit`, `Especificacion_Visual_Panel_KineFit` |

> **Trazabilidad con las fuentes.** Este plan incorpora los tres documentos completos: el `Briefing_Prototipo_Frontend_KineFit`, la `Especificacion_Visual_Panel_KineFit` (Partes A a E, correcciones A-, M-, W-, P1- a P4-, PE-, PA-, F-, NF1-, NF2-, FM-, CF- y G-1 a G-14) y el `Documento_de_Requerimientos v1.1` (RF-GEN a RF-NOT, capítulo 13 incluido). Las correcciones y requerimientos se referencian por su código para que pueda verificarse que ninguno se pierde.
>
> **Las 21 vistas de la especificación —14 existentes en Figma y 7 faltantes— están inventariadas en el capítulo 6, y se construyen en 20**: el detalle de cita manual (B.2) y el de cita web (B.3) son la misma vista con datos distintos, y se unifican. De esas 20, **19 son rutas** y una es el modal de cancelación, que se monta sobre el detalle.
>
> **Dos contradicciones entre fuentes obligan a apartarse de lo escrito**, ambas justificadas en el capítulo 3 y **resueltas el 28 de julio de 2026**: la agenda de ejemplo de Valeria Araneda es irrealizable con los horarios que el cliente confirmó, y la sesión pasa a ser de Franchesca Astudillo (**D-11**); y el prototipo se entrega **desplegado, no en PDF**, porque exportarlo anularía el motivo de construirlo (**D-12**). Las dos modifican lo escrito en la especificación visual y en lo acordado con el cliente, **y hay que comunicárselas**.
>
> **Cuatro puntos los aporta este plan y no están en ninguna fuente:** el riesgo de desajuste de hidratación que introduce la regla de fechas en tiempo de ejecución (§5.4.2), la distinción entre RUT válidos en los datos y validación de RUT en la interfaz (§5.4.3), la ausencia de la utilidad de fechas que la corrección G-3 da por existente (§5.4.1), y que `Button.tsx` no tiene consumidores, con lo que la trampa del color verde no existe (**D-3**).

---

## Capítulo 1 — Resumen ejecutivo

Se construye, dentro del repositorio `kinefit-frontend`, un prototipo navegable y no funcional del panel administrativo: **20 vistas** —19 rutas y un modal— bajo la raíz `/panel`, que cubren las 21 especificadas, aisladas del sitio público mediante _route groups_ del App Router, alimentadas por un universo de datos de prueba local y sin una sola llamada a la API.

**Diez fases.** La primera es obligatoriamente la reorganización del layout raíz, porque hoy ese layout monta Navbar, Footer y el botón de WhatsApp alrededor de absolutamente todo lo que se renderice bajo `src/app/`, y cualquier vista de panel creada antes de esa reorganización heredaría los tres. Las nueve restantes se ordenan por valor de retroalimentación: primero Agenda, luego el asistente de reserva manual, después Pacientes, Fichas clínicas, Bloqueos y horarios, y al final el constructor de formatos —que existe para provocar una decisión del cliente, no porque esté comprometido—.

**La dependencia crítica no es técnica, es de datos.** Las fases 4 a 9 construyen vistas que muestran a los mismos pacientes, las mismas citas y las mismas fichas desde ángulos distintos. Si el universo de datos de prueba no está definido y centralizado _antes_ de la primera vista con contenido, cada vista inventará sus propios ejemplos y el prototipo reproducirá exactamente el defecto que arruina la retroalimentación: datos que no cuadran entre pantallas. Por eso la fase 3 —modelo de dominio y universo de datos— es previa a toda vista de contenido y no es negociable en el orden.

**El riesgo principal es la contaminación del sitio público.** Es el único punto donde este trabajo puede romper algo que hoy funciona, y está concentrado en una sola fase. Se mitiga con una regla de verificación explícita en cada fase: _el sitio público debe verse y comportarse exactamente igual_, comprobado a ojo sobre las siete secciones de la portada y sobre el HTML servido.

**La entrega se resuelve desplegando a producción bajo `/panel`**, sin enlaces desde ninguna parte del sitio público y con metadata `noindex, nofollow`. El pipeline solo se dispara con _push_ a `main`; construir un entorno de vista previa cuesta más que el problema que resuelve para cuatro usuarios internos. Un panel al que solo se llega escribiendo la URL, y que ningún enlace ni buscador alcanza, no tiene exposición real.

---

## Capítulo 2 — Estado verificado del frontend

Todo lo de este capítulo está **verificado leyendo el código**, salvo donde diga explícitamente «inferencia».

> **Confirmación previa a ejecutar, en dos búsquedas.** De cuatro afirmaciones de este capítulo cuelgan D-2, D-3, D-4 y la estrategia de entrega entera. Antes de arrancar la fase 1 conviene que Jhoan las confirme sobre el repositorio, que es donde tiene la última palabra:
>
> 1. **`Button.tsx` y `Card.tsx` no tienen consumidores** — buscar sus importaciones en `src/`. Sostiene D-3, y con ella la decisión de no tocar el token verde.
> 2. **La regla `body` de `globals.css` fija Arial** y ningún componente aplica la utilidad de fuente sans — sostiene D-2, y con ella la resolución de tipografía.
> 3. `BookingCard` está importado en `HeroSection` sin usarse en su JSX — sostiene D-4.
> 4. El compose que corre en el VPS y el nombre de servicio del workflow — sostiene D-10 y la estrategia de entrega. **Esta no se resuelve leyendo el repositorio**, sino consultando el servidor: está asignada a la fase 1.
>
> Las dos primeras son literalmente dos búsquedas y son las que más decisiones sostienen.

### 2.1 Stack — confirmado, con una precisión

| Tecnología        | Versión declarada en `package.json` |
| ----------------- | ----------------------------------- |
| Next.js           | `16.2.9`                            |
| React / React DOM | `19.2.4`                            |
| Zustand           | `^5.0.14`                           |
| Tailwind CSS      | `^4` vía `@tailwindcss/postcss`     |
| TypeScript        | `^5`                                |

Dependencias de producción: **cuatro** (`next`, `react`, `react-dom`, `zustand`). No hay librería de componentes, ni de iconos, ni de fechas, ni de formularios. Todo el SVG del proyecto está escrito a mano y en línea.

**No hay `node_modules` instalado en el árbol actual.** No pude leer los documentos de `node_modules/next/dist/docs/` que exige `AGENTS.md`. Es una lectura obligatoria **antes de escribir la primera línea de código de la fase 1**, no antes de planificar; queda registrada como tarea de arranque de esa fase.

### 2.2 Estructura de rutas — más pequeña de lo que sugiere el briefing

`src/app/` contiene exactamente cuatro entradas: `layout.tsx`, `page.tsx`, `globals.css`, `icon.svg`.

- **No hay `middleware.ts`.** Confirmado.
- **No hay `robots.ts` ni `sitemap.ts`.** El sitio no publica hoy ningún robots.txt ni sitemap. Esto matiza el requisito de aislamiento: no hay sitemap del que excluir el panel.
- **No existe ninguna ruta distinta de la raíz.** Todo el sitio es una sola página.
- **No hay ningún `<Link>` de `next/link` en todo el proyecto.** La navegación interna es por anclas (`#team`, `#process`…) y la externa por `<a>` con `target="_blank"`.

### 2.3 `layout.tsx` raíz — el problema del punto 7.1, confirmado y cuantificado

`src/app/layout.tsx` concentra, en un solo archivo, cinco responsabilidades de naturaleza distinta:

1. **Verdaderamente global:** `<html lang="es">`, `<body>`, carga de `Geist` y `Geist_Mono` vía `next/font/google`, importación de `globals.css`.
2. **Metadata del sitio público:** exporta `defaultMetadata` desde `src/lib/metadata.ts`, que declara `robots: { index: true, follow: true }`, Open Graph, Twitter Card y `title.template` con sufijo `| Kinefit`.
3. **JSON-LD de Schema.org:** un bloque `PhysicalTherapyClinic` inyectado en `<head>` con `dangerouslySetInnerHTML`, con dirección, teléfono, horarios y redes sociales de la clínica.
4. **Cromo del sitio público:** `<Navbar />`, `<Footer />` y `<WhatsAppButton />` renderizados alrededor de `{children}`.
5. **Clases de layout en `<body>`:** contenedor en columna flexible, y un `div` intermedio con crecimiento que envuelve a `{children}`.

Los puntos 2, 3 y 4 son del sitio público y **no deben alcanzar al panel**. El punto 3 es el más dañino si se pasa por alto: un panel administrativo interno que se anuncia en los buscadores como clínica de fisioterapia, con dirección y teléfono, es un defecto real, no cosmético.

El punto 5 es la trampa silenciosa de la reorganización: el `div` que envuelve a `{children}` crece para empujar el pie de página hacia abajo, y eso **depende de que `<body>` sea un contenedor en columna flexible**. Mover esas clases sin reponerlas rompe la posición del pie de página en la portada sin que ningún error lo delate.

### 2.4 `page.tsx` — Server Component, y una sección declarada que nunca se muestra

`src/app/page.tsx` es un Server Component asíncrono que resuelve tres consultas a Sanity en paralelo (`getGallery`, `getTeam`, `getTestimonials`) y renderiza **siete** secciones: Hero, About, Team, Testimonials, Process, Gallery, Location.

**`ServicesSection` existe en `src/components/sections/` pero no se renderiza en ninguna parte.** El briefing habla de «ocho secciones de la landing»; en pantalla hay siete. La octava es código vivo pero inalcanzable.

### 2.5 El flujo de reserva público **no está activo** — discrepancia mayor

Esto contradice frontalmente la premisa del briefing de que el panel «no debe tocar el flujo público que ya funciona», porque ese flujo **hoy no funciona: no se renderiza**.

- `BookingCard` —el asistente de reserva de cuatro pasos, 339 líneas, que consume `useBookingStore` y llama a la API real— **está importado en `HeroSection` pero jamás se usa en su JSX**. La columna derecha del hero, donde debería montarse, es un `div` vacío.
- El único llamado a la acción del hero apunta a una **URL externa de AgendaPro**, definida en `HERO_COPY.ctaLink`.
- `ServicesSection`, que también toca el store, no se renderiza (2.4). Su manejador de selección de servicio guarda en el store y a continuación **abre WhatsApp** en otra pestaña.

**Consecuencia práctica para este plan, y es buena:** las tres únicas piezas que consumen la API (`BookingCard`, `useBookingStore`, `ServicesSection`) están fuera del árbol de render. El riesgo de que el panel interfiera con el flujo público es **menor que el supuesto**, porque no hay flujo público en ejecución. Se sigue respetando la restricción de no tocarlas.

### 2.6 Tokens de diseño — el hallazgo decisivo

`src/app/globals.css` tiene 37 líneas. Los tokens declarados bajo `@theme inline`:

| Token                         | Valor                       | ¿Quién lo usa?                     |
| ----------------------------- | --------------------------- | ---------------------------------- |
| `--color-primary`             | `#059669` (verde esmeralda) | **Solo `Button.tsx`**              |
| `--color-primary-foreground`  | `#0f172a`                   | **Solo `Button.tsx`**              |
| `--color-card`                | `#f9fafb`                   | **Solo `Card.tsx`**                |
| `--color-muted`               | `#6b7280`                   | **Solo `Button.tsx`**              |
| `--radius-global`             | `12px`                      | **Solo `Button.tsx` y `Card.tsx`** |
| `--color-brand-primary`       | `#0c5dc5` (azul de marca)   | Todo el sitio visible              |
| `--color-brand-primary-hover` | `#1b73e3`                   | Todo el sitio visible              |
| `--color-brand-border`        | `#e2e8f0`                   | Todo el sitio visible              |
| `--color-brand-muted`         | `#334155`                   | Todo el sitio visible              |
| `--color-brand-bg`            | `#ffffff`                   | `<body>` y fondos de sección       |
| `--color-brand-primary-glow`  | `rgba(12,93,197,.08)`       | Declarado, **sin uso**             |

**Y el hallazgo que resuelve el punto 7.3 del briefing: `Button.tsx` y `Card.tsx` no son consumidos por absolutamente nada.** Verificado por búsqueda exhaustiva de sus importaciones y de sus utilidades asociadas en todo `src/`: cero coincidencias fuera de sus propios archivos.

De ahí se sigue que **el token verde no pinta un solo píxel del sitio en producción**. La familia `--color-primary` / `--color-card` / `--color-muted` / `--radius-global` es un vestigio del andamiaje inicial de Next.js que nunca se conectó. El sitio real se dibuja íntegramente con la familia `--color-brand-*`, aplicada directamente en las clases de cada componente.

Esto cambia por completo la evaluación de riesgo del punto 7.3, y se resuelve en el capítulo 3.

### 2.7 Tipografía — el briefing tiene el hecho invertido

`layout.tsx` carga `Geist` y `Geist_Mono` y expone sus variables en `<html>`. `globals.css` las mapea a `--font-sans` y `--font-mono` dentro de `@theme inline`.

**Pero cuatro líneas más abajo, la regla `body` fija `font-family: Arial, Helvetica, sans-serif`.** Y ningún componente aplica la utilidad de fuente sans de Tailwind: no hay una sola aparición en todo `src/`.

**El sitio público de KineFit se renderiza hoy en Arial, no en Geist.** Geist se descarga, se declara y se descarta. El briefing afirma lo contrario («el proyecto usa Geist Sans mediante `next/font`») y su resolución de tipografía —«gana el proyecto», es decir, Geist— se apoya en un hecho falso. Se resuelve en el capítulo 3.

### 2.8 Componentes existentes

`src/components/ui/` — cinco archivos, de los cuales **dos están muertos**:

| Componente       | Estado       | Nota                                                          |
| ---------------- | ------------ | ------------------------------------------------------------- |
| `Navbar`         | Vivo, Client | Fijo, cambia de aspecto al desplazar, menú móvil propio       |
| `Footer`         | Vivo, Client | Marcado `'use client'` sin necesitarlo salvo por `new Date()` |
| `WhatsAppButton` | Vivo, Client | Botón flotante inferior derecho                               |
| `BookingCard`    | **Muerto**   | Importado sin usarse (2.5)                                    |
| `Button`, `Card` | **Muertos**  | Cero consumidores (2.6)                                       |

`src/components/sections/` — ocho archivos, **siete vivos** y `ServicesSection` inalcanzable (2.4).

**No existe ninguna primitiva de interfaz reutilizable en uso.** No hay botón, tarjeta, tabla, modal, campo de formulario, píldora ni pestaña compartidos. Cada sección repite sus utilidades a mano. **El panel no puede reutilizar un sistema de componentes porque no lo hay**: tiene que crearlo. Es un costo real de la fase 2 que el briefing subestima.

Sí existe un **idioma visual consistente y observable**, que el panel debe heredar: esquinas muy redondeadas, bordes de un píxel en gris claro, rótulos pequeños en versalitas con espaciado de letras, azul de marca para acento y foco, gris pizarra para texto secundario, transiciones de color en todo elemento interactivo.

### 2.9 Estado global

| Store             | Persistencia                                 | Consumidores reales                                                                      |
| ----------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `useBookingStore` | Ninguna                                      | `BookingCard` (muerto), `HeroSection` (lee un valor), `ServicesSection` (no renderizada) |
| `useAuthStore`    | `localStorage`, clave `kinefit-auth-storage` | **Ninguno.** Cero importaciones en todo `src/`                                           |

`useAuthStore` guarda `token`, `user` e `isAuthenticated`, con `setSession` y `logout`. Su tipo `Usuario` tiene `role: string` —un string libre, no una unión— con un comentario que sugiere «Paciente» o «Kinesiologo». Verificado: **nada lo importa**. Es una pieza completa, persistida y desconectada.

### 2.10 Tipos

`src/types/index.ts` define ocho interfaces. Relevante para el panel:

- **`Appointment.status` es `'pending' | 'confirmed' | 'cancelled'` — tres estados.** El panel necesita **siete**. El tipo existente no sirve y no debe extenderse: es del contrato del flujo público de paciente.
- `Appointment` mezcla identificadores y glosas denormalizadas (`serviceId` junto a `serviceName`, datos del paciente en línea). Es un modelo de vista, no de dominio.
- No existe ningún tipo para paciente, ficha clínica, formato, bloqueo, convenio ni usuario del personal.

**El panel necesita su propio modelo de dominio.** No es duplicación evitable: son dos contratos distintos.

### 2.11 Infraestructura

- **`next.config.ts` sí declara `output: 'standalone'`.** El briefing sugiere lo contrario; el que no lo aprovecha es el **Dockerfile**, que copia `.next`, `public` y los manifiestos, reinstala dependencias con `npm install --omit=dev` y arranca con `npm start`. Deuda técnica real, fuera de alcance.
- **`docker-compose.yml` declara el servicio `kinefit-frontend`**, pero el workflow ejecuta `docker compose pull frontend` y `docker compose up -d frontend`. **Los nombres no coinciden.** O el archivo del VPS es distinto del versionado, o el despliegue no está haciendo lo que el archivo dice. Además el compose referencia la red `kinefit-network` sin declararla a nivel raíz. **Esto es un riesgo directo para la entrega** (capítulo 9) y debe verificarse en la fase 1, no descubrirse en la fase 10.
- **El workflow solo se dispara con `push` a `main`.** Confirmado. No hay job de vista previa, ni de build en pull request, ni de lint, ni de tests.
- Existe una rama remota `dev` además de `main`, `feature/administrative-panel`, `feature/navbar` y `refactor/desing`. Ninguna, salvo `main`, dispara despliegue.

### 2.12 Otros hallazgos menores

- La utilidad de animación `animate-fade-in` se usa cinco veces en `BookingCard`, una en `Navbar` y una en `ProcessSection`, pero **no existe ningún `@keyframes` ni `@theme` que la defina**. No hace nada. (Solo el uso en `Navbar` está en el árbol vivo.)
- El archivo `src/lib/services/ auth.service.ts` tiene, en efecto, **un espacio al inicio del nombre**. Confirmado.
- `apiClient` no inyecta cabecera de autorización. Confirmado. Irrelevante para este plan: el panel no lo usa.
- `BOOKING_TIME_SLOTS` en `constants.ts` lista horas con intervalos de 75 minutos, incluida **`14:00`** — que según la regla horaria confirmada por el cliente no existe. Es dato del flujo público muerto, no del panel; se reporta y no se toca.
- `CLINIC_INFO.hours` contiene **dos versiones contradictorias del horario**: los campos de resumen dicen sábados y domingos 10:00–21:00 con corte de 14:00 a 15:00 —que coincide con la regla canónica—, mientras que los campos cortos dicen «Lunes a Viernes 09:00 – 21:00» y «Sábados 10:00 – 20:00», sin corte. El JSON-LD del layout usa esta segunda versión, más los sábados hasta las 20:00 y **sin declarar domingo**. Deuda del sitio público; se reporta y no se toca.

---

## Capítulo 3 — Discrepancias y resoluciones

| #        | Tema                                              | Dice el documento                                                                                                                                   | Dice el código                                                                                                           | Prevalece                                                          | Fundamento                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **D-1**  | **Color primario del panel**                      | Requerimientos: azul Pantone 2767 `#13294B`. Y también: derivar del sitio oficial                                                                   | `--color-brand-primary: #0c5dc5`                                                                                         | **El código.** El panel deriva del token de marca                  | Los dos enunciados del documento son incompatibles; el segundo es el que expresa la intención de fondo. Un azul propio se desincroniza el día que el sitio cambie el suyo. `#13294B` se conserva como **intención de valor**, no de literal: la barra lateral necesita un azul más oscuro, y ese escalón se declara como token derivado del azul de marca, no como constante ajena                                                                 |
| **D-2**  | **Tipografía**                                    | Requerimientos: Arial/Helvetica. Briefing: «el proyecto usa Geist Sans, gana el proyecto»                                                           | **El sitio renderiza en Arial.** `body` fija Arial/Helvetica y anula a Geist, que se carga y se descarta (§2.7)          | **El código, que aquí coincide con los requerimientos: Arial**     | El briefing invierte el hecho. Resolver «a favor del proyecto» significa, literalmente, Arial. **El panel no declara familia tipográfica propia y hereda la del `body`.** Así el panel se ve como el sitio hoy, y el día que alguien conecte Geist correctamente, panel y sitio cambian juntos. Introducir Geist solo en el panel produciría dos tipografías distintas en un mismo despliegue — exactamente lo que ambos documentos quieren evitar |
| **D-3**  | **`Button.tsx` saldrá verde**                     | Briefing 7.3: reutilizarlo pintaría de verde todos los botones del panel; corregir el token «cae dentro de _no se modifica el sitio público_»       | **`Button.tsx` y `Card.tsx` no tienen un solo consumidor.** El token verde no pinta nada en producción (§2.6)            | **El código. La premisa de riesgo no se sostiene**                 | Ver resolución ampliada abajo                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **D-4**  | **El flujo de reserva público «ya funciona»**     | Briefing 2.3 y 4.3                                                                                                                                  | `BookingCard` está importado sin usarse; `ServicesSection` no se renderiza; el llamado a la acción va a AgendaPro (§2.5) | **El código**                                                      | No cambia el alcance —igual no se tocan—, pero **sí baja el riesgo**: no hay flujo público en ejecución con el que interferir. También significa que el patrón «Sanity con reserva a constantes locales» está vivo solo en Team, Testimonials y Gallery                                                                                                                                                                                            |
| **D-5**  | **`output: 'standalone'`**                        | Briefing: el Dockerfile no lo aprovecha, implicando que no está configurado                                                                         | **`next.config.ts` sí lo declara**; el Dockerfile no lo usa                                                              | **El código**                                                      | Deuda real, fuera de alcance. Se registra porque afecta al tamaño de imagen, no a la entrega                                                                                                                                                                                                                                                                                                                                                       |
| **D-6**  | **Ocho secciones en la landing**                  | Briefing 4.2                                                                                                                                        | Siete renderizadas; `ServicesSection` inalcanzable (§2.4)                                                                | **El código**                                                      | Importa para la verificación de no regresión: la lista de control son **siete** secciones. Alguien que espere ocho reportará un falso positivo                                                                                                                                                                                                                                                                                                     |
| **D-7**  | **Existe un sistema de componentes reutilizable** | Briefing 4.3 lo da por establecido                                                                                                                  | No hay una sola primitiva de interfaz en uso (§2.8)                                                                      | **El código**                                                      | El panel debe **crear** sus primitivas. Es trabajo de la fase 2 que el plan contabiliza explícitamente                                                                                                                                                                                                                                                                                                                                             |
| **D-8**  | **`Appointment.status`**                          | Panel: siete estados                                                                                                                                | Tres: `pending`, `confirmed`, `cancelled` (§2.10)                                                                        | **Los requerimientos, en un tipo nuevo**                           | No se extiende el tipo existente: es el contrato del flujo público. El panel declara su propio catálogo                                                                                                                                                                                                                                                                                                                                            |
| **D-9**  | **`useAuthStore` puede reutilizarse**             | Briefing 7.5 lo plantea como opción                                                                                                                 | Cero consumidores (§2.9)                                                                                                 | Ver decisión DD-3                                                  | Verificado: no lo referencia nada                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **D-10** | **Despliegue**                                    | El compose versionado declara `kinefit-frontend`                                                                                                    | El workflow opera sobre un servicio llamado `frontend` (§2.11)                                                           | **Hay que averiguarlo**                                            | Incoherencia sin resolver entre repositorio y VPS. Riesgo de entrega, no de código. Se verifica en la fase 1                                                                                                                                                                                                                                                                                                                                       |
| **D-11** | **La agenda de ejemplo**                          | Especificación visual B.1: `Mi Agenda - Valeria Araneda`, con citas a las 09:00, 10:00 y 11:30. Parte D: la sesión simulada es **Valeria Araneda**  | Requerimientos 13.2, horarios confirmados por el cliente: **Valeria Araneda atiende de 18:00 a 21:00**                   | **Los requerimientos.** Y obliga a cambiar la usuaria de la sesión | Ver resolución ampliada abajo. **Es la contradicción más consecuente de las cuatro fuentes**                                                                                                                                                                                                                                                                                                                                                       |
| **D-12** | **Cómo se valida el prototipo**                   | Requerimientos 13.5: «exportación del prototipo a **PDF**, distribución a las especialistas y recolección de retroalimentación mediante formulario» | Briefing 1.2: el prototipo de Figma es insuficiente precisamente porque **«no es navegable de verdad»**                  | **El briefing.** Se entrega desplegado, no en PDF                  | Ver resolución ampliada abajo                                                                                                                                                                                                                                                                                                                                                                                                                      |

### D-3 ampliada — resolución de `Button.tsx`

El briefing plantea una disyuntiva entre «reutilizar el componente y que salga verde» y «corregir el token y modificar el sitio público». **El código muestra que esa disyuntiva es falsa**, porque el tercer término —el que importa— es que el componente no lo usa nadie: cambiarlo no puede producir una regresión visual, porque no hay nada que regresar.

Alternativas consideradas:

1. **Reutilizar `Button.tsx` tal cual, sobrescribiendo el color desde cada llamada.** Descartada: obliga a que todas las vistas conozcan y anulen el color base, y deja la trampa armada para el siguiente que use el componente sin sobrescribirlo.
2. **Reescribir `Button.tsx` para que use el azul de marca.** Tentadora y de riesgo técnico nulo, pero **descartada por motivo de proceso, no técnico**: es un archivo del espacio compartido, y modificarlo obliga a discutir en cada revisión si se violó la restricción de no tocar el sitio público. Además, el panel necesita **cuatro variantes** (primario, secundario, terciario/enlace, peligro) según la Parte A de la especificación visual, más estado deshabilitado con explicación —requisito de las citas Pendiente de pago—; ninguna existe en el componente actual, cuyas dos variantes no sirven.
3. **Crear un botón propio del panel, en el espacio de componentes del panel, con las cuatro variantes de la Parte A, apoyado en los tokens de marca.** **Elegida.**

**Resolución:** el panel no importa `Button.tsx` ni `Card.tsx`. Construye sus propias primitivas bajo su propio espacio. `Button.tsx` y `Card.tsx` quedan **exactamente como están** y se reportan como código muerto en el capítulo 12. El token verde nunca entra al panel porque el panel nunca importa lo único que lo consume.

Esto además convierte el punto 7.3 del briefing —presentado como trampa— en un no-problema, **siempre que se sostenga la regla de no importar desde `components/ui/` hacia el panel**. Esa regla es el verdadero entregable de esta resolución y debe verificarse en cada fase.

### D-11 ampliada — la agenda de ejemplo es imposible tal como está especificada

Tres exigencias de las fuentes no pueden cumplirse a la vez:

| Fuente                                        | Exige                                                                                         |
| --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Especificación visual B.1 y Parte D           | La sesión y la agenda de ejemplo son de **Valeria Araneda**                                   |
| Especificación visual A-7 y Parte D.3         | La jornada de ejemplo muestra **una cita de cada uno de los siete estados**, más un bloqueo   |
| Requerimientos 13.2 (cliente, última reunión) | Valeria Araneda atiende **de 18:00 a 21:00**                                                  |
| Requerimientos RF-AGD-015                     | Los bloques fuera del horario del especialista se presentan **atenuados y no seleccionables** |

La jornada de Valeria son **seis bloques de 30 minutos**. Hay que colocar en ellos siete estados y un bloqueo: **ocho elementos en seis huecos.** No cabe. Y con RF-AGD-015 aplicado, las once horas restantes de la rejilla —de 09:00 a 18:00— aparecerían atenuadas: la agenda de ejemplo sería una franja gris con seis bloques al final.

Esa pantalla no sirve para lo que existe. La corrección A-7 pide la jornada completa de estados porque **es el único momento en que las especialistas pueden juzgar la codificación de color entera de un vistazo** —y muy en particular si distinguen Pendiente de pago de Por confirmar, que es la validación más importante del prototipo—.

**Alternativas.**

1. **Mantener a Valeria y comprimir.** Descartada: no caben ocho elementos en seis bloques, y aunque cupieran, la agenda se vería anómala.
2. **Mantener a Valeria e ignorar su horario real.** Descartada: el cliente acaba de entregarlo, resolviendo una decisión pendiente que llevaba abierta desde el inicio. Contradecirlo en la primera pantalla que verá es mal punto de partida.
3. **La sesión simulada es Franchesca Astudillo.** **Elegida.**

**Fundamento, y es doble.** Franchesca cubre **jornada completa** según 13.2, con lo que cualquier hora de la rejilla es plausible y los siete estados caben con holgura. Y es **masoterapeuta** — el briefing establece que, con la resolución sanitaria de kinesiología aún pendiente, **masoterapia es el foco operativo inmediato del centro**. La usuaria de la sesión pasa a ser la especialista del servicio que efectivamente se está prestando.

**Con un beneficio añadido:** los horarios reducidos de Valeria y Constanza siguen siendo útiles como datos de la semilla. Son exactamente lo que da contenido real a la vista de horarios de atención (#18) y lo que permite demostrar RF-AGD-015 sin vaciar la agenda principal.

**Decidido y validado por el autor de la especificación el 28 de julio de 2026.** Sustituye a lo indicado en la Parte D y en E.7, que deben actualizarse. Queda pendiente comunicárselo al cliente, por tratarse de la pantalla de entrada del prototipo.

### D-12 ampliada — exportar a PDF anularía el motivo de construir esto

El capítulo 13.5 de los requerimientos mantiene como mecanismo de validación «exportación del prototipo a PDF, distribución a las especialistas y recolección de retroalimentación mediante formulario».

Ese mecanismo se definió cuando el prototipo era el de Figma, donde exportar a PDF no pierde nada: pantallas sueltas antes, pantallas sueltas después. **Aplicado al prototipo del frontend, tira justamente lo que se está pagando por construir.** El briefing dedica su punto 1.2 a explicar que Figma es insuficiente porque «no es navegable de verdad» y porque «el cliente no puede recorrer el flujo; solo mirar pantallas sueltas». Un PDF del prototipo del frontend es, exactamente, pantallas sueltas.

Además, la mitad de lo que hay que validar **no se puede fotografiar**: que el ítem activo siga a la sección, que una cita Pendiente de pago tenga las acciones deshabilitadas _y explique por qué_, que el resumen del asistente se complete al avanzar, que cancelar exija motivo, que el paso 1 no ofrezca la franja de 14:00.

**Resolución: se entrega desplegado** (DD-8), y **se conserva el formulario**, que es la parte del mecanismo que sí funciona y que responde a una restricción real del cliente —el equipo clínico está saturado y no hay reuniones que coordinar—.

El PDF puede acompañar como material de apoyo, nunca como el prototipo.

**Decidido y validado el 28 de julio de 2026: se entrega desplegado.** El mecanismo del PDF queda descartado por corresponder a una etapa anterior del proyecto. **Hay que comunicárselo a Diego**, porque modifica lo acordado en la última reunión, y conviene hacerlo pronto: si insistiera en el PDF, habría que revisar la inversión antes de gastarla.

---

## Capítulo 4 — Arquitectura del panel dentro del proyecto

### 4.1 Principio rector

Tres espacios, con una regla de dependencia en un solo sentido:

| Espacio     | Contenido                                                    | Puede importar de |
| ----------- | ------------------------------------------------------------ | ----------------- |
| **Global**  | `<html>`, `<body>`, fuentes, hoja de estilos, tokens         | —                 |
| **Público** | Landing, secciones, cromo, metadata, JSON-LD, `constants.ts` | Global            |
| **Panel**   | Rutas, layout, primitivas, dominio, datos de prueba          | Global            |

**Público y panel no se importan entre sí, en ninguna dirección.** No es purismo: es lo que garantiza que el panel salga entero de una sola pasada el día que se descarte o se mueva, y lo que impide que el verde de `Button.tsx` llegue al panel.

### 4.2 Árbol de rutas

Estado actual y estado objetivo:

**Se adopta la variante de dos raíces independientes: no queda ningún layout compartido entre el sitio público y el panel.**

```
ACTUAL                          OBJETIVO
src/app/                        src/app/
├── layout.tsx   ← todo         ├── globals.css          ← única pieza compartida
├── page.tsx                    ├── (public)/
├── globals.css                 │   ├── layout.tsx       ← EL ARCHIVO ACTUAL, MOVIDO SIN EDITAR
└── icon.svg                    │   ├── page.tsx         ← MOVIDO SIN EDITAR
                                │   └── icon.svg         ← movido dentro del grupo
                                └── (panel)/
                                    ├── layout.tsx       ← raíz propia: html, body, fuentes, noindex
                                    ├── icon.svg
                                    └── panel/
                                        ├── layout.tsx   ← barra lateral y encabezado
                                        └── …secciones
```

Los paréntesis marcan _route groups_: agrupan archivos sin aportar segmento a la URL. La portada sigue respondiendo en `/`; el panel cuelga de `/panel`.

**No hay `src/app/layout.tsx`.** Cuando la raíz no declara layout, cada grupo aporta el suyo, con su propio `<html>` y `<body>`. Esa es la clave de esta variante: el layout público **no se reescribe, se mueve**. Conserva íntegros su `<html>`, su `<body>`, sus fuentes, su `defaultMetadata`, su JSON-LD y su cromo, exactamente como están hoy. El panel no hereda nada de él porque no está en su árbol.

**Por qué esta variante y no una raíz compartida mínima.** Las dos aíslan el cromo, pero esta aísla además la metadata y el JSON-LD por construcción en lugar de por reparto, y sobre todo **reduce el cambio sobre el sitio público a mover dos archivos sin editarlos**. Menos edición es menos superficie de fallo, y hace que la verificación de no regresión pase de «comparar y juzgar» a «comparar y esperar identidad».

**Por qué `(panel)/panel/` y no `(panel)/` a secas:** el requisito es una raíz única y escribible a mano. Un grupo sin segmento dejaría las secciones colgando de la raíz del sitio, compitiendo con el espacio de URLs público.

**Tres detalles que hay que resolver bien, y que son todo el costo de esta variante:**

1. **`globals.css` se importa en ambas raíces.** Es la única pieza compartida y es deliberado: es lo que cumple el requisito de identidad visual derivada del sitio oficial.
2. **La raíz del panel declara las mismas variables de fuente que la pública**, aunque hoy no se usen. El sitio renderiza en Arial porque la regla `body` de `globals.css` lo impone (D-2); si algún día alguien conecta Geist correctamente, esa corrección debe alcanzar a las dos raíces a la vez. Declararlas cuesta una línea y mantiene la promesa de D-2.
3. **`icon.svg` hay que moverlo dentro de cada grupo.** No es una incógnita: **es un caso conocido**. Los archivos de icono en la raíz de `src/app/` no se resuelven de forma fiable cuando no hay layout raíz que los ancle. La solución es colocar el archivo de icono **dentro de cada grupo**, junto a su layout — el mismo icono en `(public)/` y en `(panel)/`, o uno distinto para el panel si más adelante interesa distinguir la pestaña. Se resuelve en la fase 1 como tarea, no como investigación.

**Navegar entre el sitio público y el panel provoca una recarga completa de página.** Es la contrapartida conocida de tener dos raíces, y aquí no cuesta nada: no debe existir ningún enlace entre ambos, que es precisamente un requisito.

### 4.3 Qué se mueve, qué se crea, qué no se toca

**Se mueve — dos archivos, en la fase 1, y solo aquí:**

| Qué                       | De                   | A                             | Edición de contenido |
| ------------------------- | -------------------- | ----------------------------- | -------------------- |
| El layout actual, íntegro | `src/app/layout.tsx` | `src/app/(public)/layout.tsx` | **Ninguna**          |
| La página de la portada   | `src/app/page.tsx`   | `src/app/(public)/page.tsx`   | **Ninguna**          |

**Eso es todo lo que este plan hace sobre el sitio público.** Dos movimientos de archivo, cero líneas editadas. El cromo, la metadata y el JSON-LD viajan dentro del layout sin que nadie los reparta a mano, que es justamente lo que elimina el riesgo de perderlos por el camino.

**Se crea:**

- `src/app/(panel)/layout.tsx` — raíz propia del panel, con metadata de no indexación
- `src/app/(panel)/panel/layout.tsx` y el árbol de secciones
- `src/components/panel/` — primitivas y componentes de dominio del panel
- `src/lib/panel/` — dominio, acceso a datos y semilla de prueba (capítulo 5)
- `src/lib/store/usePanelSessionStore.ts` (decisión DD-3)
- Tokens derivados del panel en `globals.css`, **añadidos al final, sin modificar ninguno de los existentes**

**No se toca, explícitamente:**

`page.tsx` por dentro · las ocho secciones · `Navbar` · `Footer` · `WhatsAppButton` · `BookingCard` · `Button` · `Card` · `constants.ts` · `types/index.ts` · `useBookingStore` · `useAuthStore` · `apiClient` · los tres servicios · `metadata.ts` · `next.config.ts` · Dockerfile · compose · workflow · los tokens de marca y los tokens verdes ya declarados.

### 4.4 El riesgo que esta variante elimina

Vale la pena dejarlo escrito, porque era el punto delicado de la alternativa descartada y explica por qué la elegida es mejor.

El `<body>` actual es un contenedor en columna flexible, y el `div` que envuelve a `{children}` crece para empujar el pie de página al fondo de la ventana. Ese comportamiento **depende de clases que viven en el `<body>`**. Con una raíz compartida, esas clases habrían tenido que quedarse arriba —sirviendo también al panel, que no las necesita— o bajar a cada grupo, con el riesgo de reponerlas mal. Es el tipo de fallo que no lanza ningún error: simplemente el pie de página deja de pegarse al fondo en pantallas altas, y nadie lo nota hasta que el cliente lo ve.

**Con dos raíces el problema no existe:** el `<body>` público viaja dentro de su propio layout, con sus clases intactas, y el panel tiene un `<body>` distinto que monta su estructura de dos zonas sin heredar ni estorbar nada.

Queda la verificación de todos modos —está en la fase 1—, pero pasa de ser un control necesario a uno redundante. **El objetivo de esta reorganización es que no se note**, y la mejor manera de conseguirlo es no editar lo que no debe cambiar.

### 4.5 Aislamiento — los cuatro mecanismos

| Requisito                          | Mecanismo                                                                                                                       | Verificación                                                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Sin cromo público en el panel      | El cromo vive en el layout público, hermano del panel                                                                           | Recorrer `/panel` y comprobar ausencia de barra superior, pie y botón flotante                                 |
| Sin enlaces desde el sitio público | `NAV_LINKS`, `Footer` y secciones no se modifican; el panel no se enlaza desde ninguna parte                                    | Buscar la cadena `panel` en `src/components/sections/`, `src/components/ui/` y `constants.ts`: cero resultados |
| Sin indexación                     | El layout del panel exporta metadata propia con `noindex, nofollow`; **al no estar en el layout raíz, no hereda `index: true`** | Ver el HTML servido de `/panel`: debe traer la directiva de no indexación y **no** el JSON-LD de la clínica    |
| Sin sitemap                        | No existe sitemap (§2.2). No se crea                                                                                            | Nada que hacer                                                                                                 |

Sobre robots.txt: **no se añade.** El sitio no publica hoy ninguno, un archivo que enumera `/panel` en un Disallow es la única pista pública de que `/panel` existe, y una ruta sin enlaces entrantes no es descubrible por rastreo. La metadata a nivel de layout es suficiente y no filtra información. Si el cliente exige robots.txt por política, se revisa; no es lo predeterminado.

### 4.6 Componentes del panel

Bajo `src/components/panel/`, en tres capas:

| Capa           | Qué contiene                                       | Ejemplos                                                                                                                                                                        |
| -------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cromo**      | Estructura fija de la Parte A                      | Barra lateral, ítem de navegación, encabezado, marco de dos zonas                                                                                                               |
| **Primitivas** | Los ladrillos que el proyecto no tiene (§2.8, D-7) | Botón de cuatro variantes, tarjeta, tabla, modal, campo, píldora de estado, distintivo de origen, panel de resumen, indicador de pasos, estado vacío, aviso de fuera de alcance |
| **Dominio**    | Piezas que conocen el modelo del panel             | Rejilla horaria, tarjeta de cita, leyenda de estados, fila de paciente, cabecera de ficha                                                                                       |

La **píldora de estado** y la **leyenda** son el mismo componente alimentado por el mismo catálogo (DD-5). Es lo que impide, por construcción, que un estado se vea de dos colores en dos pantallas.

---

## Capítulo 5 — Estrategia de datos de prueba

Es el capítulo que decide si el prototipo se convierte en producto o se tira. También el que decide si la retroalimentación habla del flujo o de los datos.

### 5.1 Por qué no en `constants.ts`

`constants.ts` tiene 187 líneas, diez constantes y una responsabilidad declarada en su cabecera: contenido del sitio público y reserva ante fallo de Sanity. Los datos del panel son de otro orden de magnitud —agendas de varios días, pacientes con historial, citas en los siete estados, fichas, formatos— y de otra naturaleza: son **provisionales por diseño**. Mezclarlos garantiza que en tres meses nadie distinga la constante real de la de mentira, y convierte su eliminación en cirugía.

### 5.2 Estructura en tres capas

Bajo `src/lib/panel/`:

```
src/lib/panel/
├── domain/        capa 1 — tipos y catálogos.        PERMANENTE
├── data/          capa 2 — acceso a datos.           PERMANENTE (cambia por dentro)
└── data/_seed/    capa 3 — el universo de prueba.    DESECHABLE
```

**Capa 1 — Dominio.** Tipos del panel (cita, paciente, ficha, formato, bloqueo, convenio, especialista, usuario del personal, bloque horario) y los catálogos cerrados: los **siete estados** con etiqueta, color, origen posible y acciones permitidas; los orígenes; la regla horaria. Es el vocabulario compartido con el backend. **No desaparece cuando llegue la API: se alinea con ella.**

**Capa 2 — Acceso a datos.** Un conjunto reducido de funciones **asíncronas** con la forma que tendrán cuando consulten la API de verdad: obtener la agenda de un día para un especialista, obtener una cita, listar pacientes con filtro, obtener un paciente, listar y obtener fichas, listar formatos, listar bloqueos. Hoy resuelven desde la semilla; mañana desde el backend. **Es la única capa que las vistas conocen.**

Asíncronas **desde el primer día**, aunque hoy no haga falta. Es la diferencia entre cambiar la implementación de seis funciones y reescribir dieciocho vistas: si las vistas se escriben contra datos síncronos, el día que la fuente sea remota cambia la forma de cada componente que los consume. Ese es literalmente el criterio del punto 7.11 del briefing.

**Capa 3 — Semilla.** Los datos. Un archivo por entidad, marcado inequívocamente como provisional, referenciado **solo** por la capa 2. Es la carpeta que se borra entera el día de la integración.

### 5.3 La regla que hace posible el reemplazo

**Ninguna vista importa jamás de `_seed/`.** Ninguna. Se verifica con una búsqueda de la cadena `_seed` fuera de `src/lib/panel/data/`: debe dar cero resultados, en cada fase.

Es una regla de una línea, comprobable en segundos, y es toda la garantía de que el reemplazo por el backend sea localizado. Con ella, la integración consiste en reimplementar la capa 2 y borrar la capa 3.

### 5.4 Coherencia del universo — resuelta por construcción, no por disciplina

El defecto 11 del prototipo de Figma —fechas de 2023, 2024 y 2026 conviviendo, correos que no corresponden— no se evita revisando: se evita quitando la posibilidad de equivocarse.

Cuatro reglas estructurales:

1. **Identidad, no repetición.** Una cita referencia un paciente por identificador; no copia su nombre ni su correo. Las vistas resuelven la referencia por la capa 2. Un paciente con un correo mal escrito lo tiene mal en todas partes, que es lo correcto: nunca puede tenerlo distinto en dos pantallas.
2. **Los contadores se derivan, nunca se escriben.** Si el perfil de un paciente dice seis citas atendidas, ese seis se **calcula** contando las citas atendidas de ese paciente en la semilla. Es imposible que discrepe del historial que lo acompaña porque es el mismo dato leído dos veces. Esto ata directamente el punto 7.4 del briefing.
3. **Ninguna fecha se escribe a mano** — es la exigencia literal de la corrección G-3. Todas se calculan como desplazamientos respecto de la fecha actual. De ahí se siguen tres consecuencias que cierran defectos concretos: **el día de la semana se deriva de la fecha, jamás se escribe** (P1-4: el prototipo dice «martes 8 de julio» sobre un día que cae en lunes); **la fecha de creación de una cita es siempre anterior a su atención** (M-6: en Figma una cita se crea un año después de haberse realizado); y las fechas de 2023, 2024 y 2026 no pueden reaparecer porque no hay dónde escribirlas.
4. **La rejilla se genera desde la regla horaria, no se enumera.** Los bloques salen del catálogo de dominio, que define días de semana 09:00–14:00 y 15:00–21:00, fines de semana 10:00–14:00 y 15:00–21:00, en tramos de 30 minutos. **La franja 14:00–15:00 no es representable**: no existe en el generador. Ningún desarrollador puede dibujarla por descuido, ni en la agenda, ni en el paso 1 del asistente. Cierra estructuralmente A-1, A-2, P1-1 y G-5. Y como todo rango horario se formatea desde el mismo lugar, **los bloques de 60 minutos del listado de fichas (F-1) tampoco son representables**.
5. **Un solo formato para cada dato.** Rango horario con raya media y espacios, en todas partes (G-7, P1-5). Un único dominio de correo ficticio (PA-6). Un solo nombre por convenio (W-4). Un RUT, una persona (F-2). Todo paciente que aparezca en cualquier listado existe en la base de pacientes (F-3). Se consigue con lo mismo de siempre: **un formateador por tipo de dato y referencias por identidad**, nunca literales repartidos por las vistas.

Las cinco reglas comparten la misma idea: **hacer que el error sea imposible en vez de detectable.**

### 5.4.1 La utilidad de fechas que el proyecto no tiene

La corrección G-3 manda formatear «con la utilidad de fechas del proyecto, en español de Chile». **Verificado: esa utilidad no existe.** `src/lib/utils/` contiene un solo archivo, `whatsapp.ts`, y `package.json` no declara ninguna librería de fechas — el proyecto tiene cuatro dependencias de producción y ninguna es de este tipo.

Hay que construirla, y **sin añadir dependencias**: la API de internacionalización del navegador cubre el formato extenso en español de Chile que piden la agenda (`Jueves, 24 de Octubre, 2023`), el listado de fichas (`8 jul`) y la pantalla de éxito. Es trabajo pequeño pero **bloqueante para las fases 4 en adelante**, y por eso entra en la fase 3, junto al formateador de rangos horarios y al de RUT.

Un solo lugar donde se decide cómo se ve una fecha es también lo que hace que G-3 sea verificable en vez de aspiracional.

### 5.4.2 El riesgo que introduce calcular fechas en tiempo de ejecución — no está en la especificación

La regla D.1 —«las fechas se calculan en tiempo de ejecución a partir de la fecha actual»— tiene un fundamento excelente: **el prototipo no envejece**. La agenda siempre muestra hoy, las fichas siempre muestran atenciones recientes, el calendario nunca ofrece fechas vencidas. Es la decisión correcta y este plan la adopta entera.

Pero arrastra una consecuencia técnica que la especificación no podía prever, porque es propia de este stack y no del diseño: **en el App Router, un componente que lee la fecha actual la lee dos veces** —una en el servidor al renderizar, otra en el navegador al hidratar—. Si ambas caen a distinto lado de la medianoche, o si el servidor está en otra zona horaria que el navegador, el HTML del servidor y el del cliente no coinciden y React emite un error de hidratación. **El prototipo se rompería justamente en el caso que su propia regla busca evitar: al pasar los días.**

Y hay un agravante específico de este despliegue: el contenedor corre en un VPS de Hetzner, casi con certeza en horario universal, mientras las especialistas revisan desde Chile. **Son entre tres y cuatro horas de diferencia**: cada noche hay una ventana en la que el servidor ya cambió de día y el navegador no.

**Resolución, y es una decisión de diseño de la fase 3:** el «hoy» del prototipo se resuelve **en un solo lugar y del lado del cliente**, no disperso por las vistas. Las páginas del panel no calculan fechas al renderizar en el servidor; la capa de acceso a datos las recibe ya resueltas. Todo formateo se fija explícitamente a la zona horaria de Chile en vez de heredar la del entorno.

Es un detalle pequeño y de una sola vez, pero descubrirlo en la fase 4 —con la agenda ya construida sobre el supuesto contrario— significaría rehacer cómo cada vista obtiene su fecha. Por eso está aquí y no en una nota al pie.

### 5.4.3 RUT: válidos en los datos, sin validación en la interfaz

Hay una tensión real entre documentos que conviene resolver explícitamente antes de que alguien la resuelva por su cuenta en mitad de la fase 6:

| Fuente                                | Qué pide                                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Parte D                               | «Los RUT deben tener dígito verificador válido: los del prototipo son de relleno y varios no verifican» |
| Requerimientos RF-GEN-006, RF-NRV-033 | El RUT debe **validarse** con su dígito verificador y verificarse su unicidad                           |
| Briefing, restricción 6               | **«Sin validación real de RUT.»** No se implementa lógica de negocio                                    |

**No se contradicen: hablan de cosas distintas.** Uno exige que _los datos_ sean válidos; el otro exige que _la aplicación_ los valide.

**Resolución:**

- **Los RUT de la semilla llevan dígito verificador correcto**, calculado al construirla. Es requisito de datos y se cumple. Cuesta poco y evita que una especialista chilena —que reconoce un RUT falso de un vistazo— reporte datos inverosímiles en lugar de opinar sobre el flujo.
- **El formulario no valida.** Ni dígito verificador, ni unicidad, ni formato. Es lógica de negocio, su regla la fija el backend, y RF-NRV-033 está marcado «No» en prototipo precisamente porque no fue diseñado.
- **El caso «este RUT ya existe» de E.4 sí se muestra**, porque es un camino del flujo que las especialistas deben poder evaluar —¿ofrecer el paciente existente en vez de duplicarlo es lo que esperan?—. Se demuestra con un ejemplo guionizado, no con una comprobación real: un RUT concreto de la semilla dispara la advertencia. La vista enseña el comportamiento sin implementar la regla.

El mismo criterio se aplica al correo y al teléfono (RF-NRV-034) y al formato nacional `+56 9` (RF-GEN-007): **se formatean, no se validan.**

### 5.5 Cobertura mínima del universo

Para que el prototipo sirva de instrumento de retroalimentación, la semilla debe cubrir, como mínimo:

- **Los siete estados de cita, visibles simultáneamente en una misma jornada** — es la exigencia literal de la corrección A-7, y la única manera de que la leyenda se pueda contrastar contra la rejilla de un vistazo, y de que las especialistas juzguen si distinguen Pendiente de pago de Por confirmar. Es el caso de prueba más importante del prototipo entero.
- **Ambos orígenes**, con al menos una cita web y una manual en cada estado que ambos admitan.
- **Los dos servicios reales**: Masoterapia y Kinesiología, y **Masoterapia primero** allí donde se listen (P3-1).
- **Las tres especialistas reales**, con sus cargos correctos —Franchesca Astudillo masoterapeuta, Valeria Araneda y Constanza Maldonado kinesiólogas—, tal como figuran en el equipo real del sitio. Nada de «Especialista Senior» (M-2), y la columna «Registrada por» del listado de fichas solo admite estos tres nombres (F-7).
- **Un rango de días**, no un solo día: la navegación de fechas de la agenda tiene que llevar a algo. Al menos un día pasado con citas cerradas, el día de referencia, y días futuros.
- **Pacientes con densidad desigual**: alguno con historial largo y varias fichas, alguno con una sola cita, alguno sin ficha. Un listado donde todos se parecen no genera retroalimentación.
- **Convenios como acuerdos con empresas o sindicatos** — nunca Isapre ni Fonasa (PA-1).
- **Un bloqueo de agenda de ejemplo**, personal del especialista, en franja distinta de 14:00–15:00 y con rótulo que no sea «Colación» (A-2).
- **Identificador único por cita** (M-5: en Figma la cita manual y la web comparten el número `#89234`).
- **Notas de reserva**, para el paciente y internas, en algunas citas y no en todas — el detalle debe mostrarlas diferenciadas cuando existen y omitirlas cuando no (M-7).
- **Historial de cambios de estado por cita**: responsable, fecha y motivo. Es lo que alimenta la traza de auditoría del detalle (M-8), y una entidad que no estaba prevista en la primera versión de este plan.
- **Identificador de transacción de Webpay** en las citas de origen web, para el banner de anticipo (W-2).
- **Bloques ocupados y bloqueados** en los días del asistente, con su causa, para que el paso 1 pueda atenuarlos y explicarlos en vez de mostrarlos libres (P1-8).
- **Reservas con ficha y sin ficha** para un mismo paciente: es lo que permite que el paso 1 de la ficha deshabilite las que ya tienen una (NF1-4) y que el listado muestre el distintivo correspondiente.
- **Formatos de ficha con recuento de uso**, para que el distintivo «En uso» diga sobre cuántas fichas (FM-8).

### 5.6 Lo que la capa 2 **no** hace

No valida, no calcula disponibilidad, no aplica transiciones de estado, no persiste. Devuelve datos. Las acciones del prototipo (confirmar, cancelar, marcar asistida) **no mutan la semilla**: llevan a una confirmación visual y regresan. Es deliberado —restricción 6 del briefing— y hay que decirlo en la vista para que nadie lo reporte como error (DD-7).

---

## Capítulo 6 — Inventario de vistas

**20 vistas en 20 filas, que cubren las 21 de la especificación.** «Figma» indica si existe en el prototipo actual. La prioridad es de valor de retroalimentación, no de esfuerzo.

Las rutas siguen las **sugeridas por la especificación visual** allí donde las da (B.1, B.4, B.9, B.10, B.13, B.14) y las derivan de ellas donde no.

| #   | Vista                                            | Ruta                            | Ítem activo         | Figma                            | Prioridad                                   | Fase |
| --- | ------------------------------------------------ | ------------------------------- | ------------------- | -------------------------------- | ------------------------------------------- | ---- |
| 1   | Acceso del personal                              | `/panel/acceso`                 | —                   | **Nueva** (5.3 media)            | Alta · puerta de entrada de la demostración | 2    |
| 2   | Agenda — panel principal                         | `/panel/agenda`                 | Agenda              | Sí (B.1)                         | **Máxima**                                  | 4    |
| 3   | Detalle de cita — modal                          | `/panel/agenda?cita=…`          | Agenda              | Sí (B.2 manual, B.3 web)         | **Máxima**                                  | 4    |
| 4   | Modal de cancelación con advertencia de anticipo | Sobre la #3                     | Agenda              | **Nueva** (Parte E · W-5)        | **Máxima**                                  | 4    |
| 5   | Nueva reserva · paso 1 — Horario                 | `/panel/nueva-reserva/horario`  | Nueva reserva       | Sí (B.4)                         | Alta                                        | 5    |
| 6   | Nueva reserva · paso 2 — Paciente                | `/panel/nueva-reserva/paciente` | Nueva reserva       | Sí (B.5)                         | Alta                                        | 5    |
| 7   | Nueva reserva · paso 3 — Servicio                | `/panel/nueva-reserva/servicio` | Nueva reserva       | Sí (B.6)                         | Alta                                        | 5    |
| 8   | Nueva reserva · paso 4 — Notas y resumen         | `/panel/nueva-reserva/resumen`  | Nueva reserva       | Sí (B.7)                         | Alta                                        | 5    |
| 9   | Nueva reserva · éxito                            | `/panel/nueva-reserva/listo`    | Nueva reserva       | Sí (B.8)                         | Alta                                        | 5    |
| 10  | Pacientes — listado                              | `/panel/pacientes`              | Pacientes           | Sí (B.9)                         | Alta                                        | 6    |
| 11  | Perfil del paciente                              | `/panel/pacientes/[id]`         | Pacientes           | **Nueva** (Parte E · PA-4)       | Alta · cierra un vacío visible              | 6    |
| 12  | Registro de paciente nuevo                       | `/panel/pacientes/nuevo`        | Pacientes           | **Nueva** (Parte E · PA-3, P2-4) | Media-alta                                  | 6    |
| 13  | Fichas clínicas — listado                        | `/panel/fichas`                 | Fichas clínicas     | Sí (B.10)                        | Media-alta                                  | 7    |
| 14  | Nueva ficha · paso 1 — Reserva asociada          | `/panel/fichas/nueva/reserva`   | Fichas clínicas     | Sí (B.11)                        | Media-alta                                  | 7    |
| 15  | Nueva ficha · paso 2 — Contenido                 | `/panel/fichas/nueva/contenido` | Fichas clínicas     | Sí (B.12)                        | Media-alta                                  | 7    |
| 16  | Ficha clínica guardada                           | `/panel/fichas/[id]`            | Fichas clínicas     | **Nueva** (Parte E · F-5)        | Media-alta · cierra un vacío visible        | 7    |
| 17  | Bloqueos de agenda y excepciones                 | `/panel/agenda/bloqueos`        | Agenda              | **Nueva** (5.3 media)            | Media                                       | 8    |
| 18  | Horarios de atención por especialista            | `/panel/horarios`               | —                   | **Nueva** (5.3 media)            | Media                                       | 8    |
| 19  | Formatos de ficha — listado                      | `/panel/fichas/formatos`        | **Fichas clínicas** | Sí (B.13)                        | **Baja · para decidir**                     | 9    |
| 20  | Constructor de formato                           | `/panel/fichas/formatos/nuevo`  | **Fichas clínicas** | Sí (B.14)                        | **Baja · para decidir**                     | 9    |

**El recuento, que conviene fijar porque aparece en tres lugares del plan:** la especificación describe **21 vistas** —14 existentes en Figma y 7 en la Parte E—. La tabla tiene **20 filas**, porque la #3 unifica B.2 y B.3. Y de esas 20, **19 son rutas**: la #4 es un modal sobre el detalle.

Unificar B.2 y B.3 no es un recorte: son la misma vista cuyo contenido y acciones dependen del estado y el origen, y la propia especificación lo dice al describir B.3 como «mismo modal que B.2, con dos diferencias». Duplicarlas sería replicar el defecto de fondo del prototipo.

**Notas de ruta.**

- **Formatos de ficha cuelga de Fichas clínicas**, no de una sección propia: la especificación fija su ruta bajo `/panel/fichas/formatos` y, sobre todo, fija que **el ítem activo de la barra lateral sigue siendo «Fichas clínicas» y el título del encabezado también** (B.13, B.14). Es coherente con que la barra lateral tenga cuatro ítems y ninguno más.
- **El detalle de cita es un modal sobre la agenda**, no una página aparte (B.2). Conserva URL propia mediante parámetro de búsqueda; fundamento en DD-9.
- Las secciones **Bloqueos** (#17) y **Horarios** (#18) no tienen ítem propio en la barra lateral, que la Parte A fija en cuatro. Se alcanzan desde la barra de herramientas de la agenda y desde el encabezado. La barra lateral **no se altera** (NF2-2: no existe ningún ítem «Configuración»).
- `/panel` a secas redirige a `/panel/agenda`.
- El asistente usa una ruta por paso y no un solo componente con estado interno. Fundamento en DD-4.

---

## Capítulo 7 — Decisiones de diseño

### DD-1 · Separación de layouts y aislamiento

**Problema.** Un único layout raíz mezcla lo global con el cromo, la metadata y el JSON-LD del sitio público (§2.3).

**Alternativas.**

1. Renderizado condicional dentro del layout raíz según la ruta activa. Descartada: requiere convertir el layout raíz en Client Component o duplicar lógica de ruta, y **la metadata y el JSON-LD seguirían siendo comunes**, que es la mitad del problema.
2. `middleware.ts` que reescriba o proteja `/panel`. Descartada: el middleware no resuelve layouts ni metadata, y no hay nada que proteger porque no hay autenticación real.
3. Un proyecto Next.js aparte. Descartada por el briefing (2.1) y porque duplicaría tokens, configuración y pipeline.
4. **Route groups con una raíz compartida mínima**: la raíz retiene `<html>`, `<body>`, fuentes y hoja de estilos; el público recibe cromo, metadata y JSON-LD. Aísla bien, pero **obliga a editar el layout actual para repartirlo**, y deja el detalle del `<body>` descrito en §4.4. Descartada.
5. **Route groups con dos raíces independientes, sin ningún layout compartido.** Elegida.

**Elegida:** no existe `src/app/layout.tsx`. Cada grupo aporta su propia raíz completa. **El layout actual se mueve entero a `(public)/` sin editar una sola línea**, y el panel estrena una raíz propia con metadata de no indexación.

**Por qué es correcta, y por dos motivos distintos:**

- **El aislamiento pasa a ser una propiedad estructural.** El panel no _evita_ renderizar el Navbar ni _anula_ la metadata de indexación: es que ni el Navbar ni esa metadata están en su árbol. No hay condición que alguien pueda romper después, ni reparto que se pueda hacer mal.
- **El cambio sobre el sitio público se reduce a mover dos archivos.** Cero líneas editadas. Es la única variante en la que la verificación de no regresión deja de exigir criterio: el HTML servido de `/` tiene que ser idéntico, y si no lo es, algo se hizo mal. Con cualquier variante que edite el layout, la comparación produce diferencias que hay que juzgar una a una.

**Restricción del usuario que motivó revisar esta decisión:** nada fuera del panel debe modificarse, y todo debe trabajarse de forma aislada. Esta variante es la que más se acerca a cumplirla sin renunciar a los requisitos de aislamiento del propio briefing. **Los dos movimientos de archivo son irreducibles**: mientras el panel viva bajo `src/app/`, un layout en la raíz lo envuelve, y ningún layout hijo puede quitar el cromo ni el JSON-LD que puso el padre.

### DD-2 · Datos de prueba

**Problema.** Los datos deben poder cambiarse por llamadas reales sin reescribir vistas, y deben ser coherentes entre pantallas.

**Alternativas.**

1. Constantes importadas directamente por cada vista. Descartada: acopla dieciocho vistas a la forma de la semilla; la integración sería una reescritura.
2. Un archivo grande de datos con funciones auxiliares síncronas. Descartada: mejora poco. La forma síncrona es precisamente lo que no sobrevive a la integración.
3. Rutas de API simuladas dentro de Next. Descartada: es infraestructura para cuatro usuarios y un prototipo, y arrastra a decidir contratos HTTP que el backend aún no fijó.
4. **Tres capas: dominio permanente, acceso asíncrono permanente, semilla desechable.** Elegida (capítulo 5).

**Por qué es correcta:** hace del criterio del punto 7.11 —«si hay que reescribir las vistas, se hizo mal»— una propiedad verificable con una búsqueda de texto (§5.3), no una aspiración.

### DD-3 · Sesión simulada

**Problema.** El panel necesita nombre de usuario en el encabezado, rol y cierre de sesión. `useAuthStore` existe, persiste, y **no lo usa nadie** (§2.9). Sus roles no son los del panel.

**Alternativas.**

1. Reutilizarlo generalizando `Usuario.role`. Descartada por tres razones: `Usuario` es del contrato de la API pública y tocarlo entra en el espacio compartido; la clave `kinefit-auth-storage` colisionaría el día que exista sesión de paciente en el mismo navegador —lo advierte el propio briefing—; y confundir _usuario del personal_ con _usuario paciente_ en un solo tipo es exactamente la distinción que el vocabulario del proyecto pide preservar.
2. Sin store: usuario fijo en una constante. Descartada: no permite cerrar sesión ni volver al acceso, y la pantalla de acceso quedaría decorativa. Un botón «Cerrar Sesión» que no cierra nada es de los caminos muertos que el punto 7.9 prohíbe.
3. **Store propio del panel, con clave de persistencia propia.** Elegida.

**Elegida:** `usePanelSessionStore`, persistido bajo una clave distinta, con el usuario del personal (nombre, rol `Administrador` o `Especialista`, especialista asociado cuando corresponda) y las acciones de entrar y salir. `useAuthStore` **no se toca**.

**La usuaria de la sesión es Franchesca Astudillo**, no Valeria Araneda como indican la Parte D y E.7 de la especificación visual. El fundamento está en D-11 y **la decisión está tomada**. Al vivir en un solo lugar, cambiarla más adelante sería modificar un dato — pero la semilla de la agenda que la acompaña, no.

**Alcance explícito:** sin token, sin validación, sin credenciales. La pantalla de acceso admite cualquier envío, fija un usuario de prueba y entra. Nadie es redirigido por no tener sesión: si alguien escribe una URL profunda del panel, entra igual, con un usuario por defecto. **Un guardia de rutas sería autenticación real, está fuera de alcance, y en un prototipo que se recorre sin acompañamiento solo produciría gente atascada en una pantalla de acceso.**

### DD-4 · El asistente: una ruta por paso

**Problema.** Los asistentes (reserva de cuatro pasos, ficha de dos) pueden ser un componente con estado interno —como `BookingCard`— o una ruta por paso.

**Elegida: una ruta por paso**, con el estado en un store del panel de vida corta.

**Fundamento, que es específico de este prototipo:** la retroalimentación se recoge **por formulario y sin reuniones**. Una especialista que encuentra un problema en el paso 3 tiene que poder decir dónde estaba, y quien lo corrija tiene que poder llegar allí directamente. Con estado interno, todos los pasos comparten una URL y el botón «atrás» del navegador sale del asistente entero — que es una manera segura de que alguien reporte «se me borró todo» en vez de hablar del flujo. Además cada paso queda mostrable por separado, lo que encaja con fases interrumpibles.

**Costo aceptado:** el estado vive en un store en memoria; una recarga en el paso 3 pierde la selección. Se resuelve devolviendo al paso 1 con un aviso, no persistiendo. Persistir la reserva a medias de un prototipo sería lógica de negocio.

### DD-5 · Los siete estados, en un solo lugar

**Problema.** El mismo estado debe verse idéntico en la rejilla, la leyenda, el detalle, el perfil del paciente y todo listado. El prototipo de Figma falla justo aquí: rotula «Pendiente» dos comportamientos opuestos, y pinta un mismo estado de dos colores (corrección A-3).

**Elegida:** un **catálogo único** en la capa de dominio. Cada estado declara su etiqueta, su rol de color, si es alcanzable desde origen web, manual o ambos, y **qué acciones ofrece**. Todo componente que muestre un estado lee de ahí; ninguno decide su propio color ni su propia etiqueta. La leyenda **se genera recorriendo el catálogo**, con lo que no puede quedar incompleta ni desactualizada.

Y la parte que importa de verdad, la del punto 7.6:

|               | Pendiente de pago                                           | Por confirmar                                 |
| ------------- | ----------------------------------------------------------- | --------------------------------------------- |
| Origen        | Solo web                                                    | Solo manual                                   |
| Qué significa | Webpay en curso                                             | Cita manual sin ratificar                     |
| Expira sola   | **Sí**                                                      | **No**                                        |
| Acciones      | **Ninguna**, todas deshabilitadas y con explicación visible | **Confirmar cita** (primaria) · Cancelar cita |
| Color         | Azul de selección                                           | Ámbar                                         |

Al declarar las acciones **dentro del catálogo**, la vista de detalle no elige qué botones mostrar: los deriva del estado. Es imposible que una cita Pendiente de pago ofrezca confirmar. Y las acciones deshabilitadas **explican por qué lo están** — sin eso, una especialista reportará «el botón no funciona» en vez de opinar sobre si la regla tiene sentido.

**El catálogo declara además cuál acción es la primaria**, y esto no es un detalle estético: las correcciones M-9 y W-3 señalan que en Figma todas las acciones del detalle tienen el mismo peso visual, con lo que la pantalla no comunica qué se espera que haga la especialista. En una cita **Por confirmar** la acción esperada es _Confirmar cita_; en una **Confirmada**, _Marcar como asistida_. Al vivir esa jerarquía en el catálogo y no en cada vista, la barra de acciones se deriva entera —qué botones, en qué estilo y cuál destacado— de un solo dato.

### DD-6 · Componentes compartidos entre sitio público y panel

**Problema.** Qué se reutiliza y qué se duplica.

**Elegida:**

| Qué                                      | Decisión                                                   | Por qué                                                                                                                  |
| ---------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Tokens de marca de `globals.css`         | **Se reutilizan**                                          | Es lo que cumple el requisito de derivar del sitio oficial, y lo que mantiene ambos sincronizados                        |
| Tipografía del `body`                    | **Se hereda, sin declarar familia propia**                 | Resolución D-2                                                                                                           |
| Escala de radios, bordes e idioma visual | **Se replica el criterio, no el código**                   | No hay código que reutilizar (§2.8)                                                                                      |
| `Navbar`, `Footer`, `WhatsAppButton`     | **No se usan**                                             | Son el cromo público; el panel tiene el suyo                                                                             |
| `Button`, `Card`                         | **No se usan**                                             | Resolución D-3                                                                                                           |
| `BookingCard`                            | **No se usa**, ni se toma como base                        | Llama a la API. El asistente del panel es otra cosa: sin pago, con cuatro pasos distintos y panel de resumen persistente |
| Los tokens nuevos del panel              | **Se añaden a `globals.css`**, derivados del azul de marca | Un solo lugar para los tokens del proyecto. Añadir no modifica                                                           |

**Regla de dependencia verificable:** ninguna importación desde `src/components/panel/` o `src/app/(panel)/` hacia `src/components/ui/`, `src/components/sections/` o `src/lib/constants.ts`. Se comprueba por búsqueda en cada fase.

**Lo único que se comparte de verdad son los tokens.** Es deliberado: es la superficie mínima que cumple el requisito de identidad visual sin acoplar los dos productos.

### DD-7 · Que el prototipo se explique solo

**Problema.** El punto 7.9. Nadie acompañará al que lo recorra.

**Elegida:** tres mecanismos, construidos como componentes, no como buenas intenciones.

1. **Aviso permanente y discreto de datos de prueba**, en el cromo del panel, visible en toda vista. Evita el reporte «los pacientes no son reales».
2. **Componente de acción simulada.** Toda acción que en el producto real mutaría algo —confirmar, cancelar, guardar ficha, registrar paciente— produce una confirmación visual que dice explícitamente que en el prototipo no se guarda. **Ningún botón queda inerte**, que es la exigencia del punto 7.9.
3. **Componente de fuera de alcance.** Donde una funcionalidad esté deliberadamente excluida —exportar a PDF, notificaciones, ajustes del encabezado, reportes—, la vista lo dice en lugar de fallar en silencio.

Los tres son de la fase 2, **antes que cualquier vista de contenido**, porque son los que hacen que las vistas posteriores no dejen cabos sueltos. Construirlos después obliga a repasar todo lo hecho.

### DD-8 · Entrega al cliente

**Problema.** El punto 7.8. El pipeline solo se dispara con `push` a `main`; el trabajo está en una rama; el cliente necesita un navegador y nada más.

**Alternativas.**

1. **Entorno de vista previa** (workflow adicional, subdominio, segunda etiqueta de imagen, entrada de proxy). Descartada: es infraestructura nueva —con el agravante de que el despliegue actual tiene una incoherencia sin resolver entre el compose versionado y el que corre en el VPS (D-10)— para servir a cuatro personas un contenido que puede vivir en producción sin riesgo.
2. **Túnel desde la máquina del desarrollador.** Descartada: solo funciona mientras alguien tiene el equipo encendido, y el cliente pidió explícitamente revisar sin coordinar horarios.
3. **Fusionar a `main` y desplegar a producción bajo `/panel`**, sin enlaces y con no indexación. **Elegida.**

**Por qué es segura:** las tres condiciones se cumplen simultáneamente y son verificables (§4.5). Ningún enlace del sitio público apunta al panel; ningún buscador lo indexa; no hay sitemap que lo enumere. **La única forma de llegar es escribir la URL completa.** El panel no expone datos reales —solo la semilla— ni ejecuta operación alguna contra el backend, así que aunque alguien llegara, no hay nada que comprometer.

**Cómo se ejerce:** al cierre de cada fase con valor mostrable, se fusiona a `main` y se despliega. El prototipo crece a la vista del cliente en lugar de aparecer entero al final, que es lo que pide la metodología de iteraciones cortas. **La primera fusión ocurre al cierre de la fase 2**, cuando solo existe el armazón: así el aislamiento se verifica en producción **antes** de que haya dieciocho vistas encima.

### DD-9 · El detalle de cita es un modal, y aun así tiene URL

**Problema.** La especificación fija que el detalle se abre **como modal sobre la agenda**, con el fondo atenuado y desenfocado (B.2). Pero es la vista sobre la que más se va a opinar, y la retroalimentación se recoge por formulario: quien encuentre un problema tiene que poder señalar dónde estaba, y quien lo corrija tiene que poder volver allí.

**Alternativas.**

1. **Modal con estado interno de la agenda, sin URL.** Es lo más simple y lo que hace Figma. Descartada: el botón «atrás» del navegador saca de la agenda en vez de cerrar el modal, y no hay forma de enlazar a una cita concreta.
2. **Página propia en lugar de modal.** Descartada: contradice la especificación, y pierde el contexto de la agenda detrás, que es lo que hace legible el modal.
3. **Rutas interceptoras del App Router**, que dan modal con ruta real y respaldo en navegación directa. Descartada aquí: es la solución canónica del framework, pero introduce un mecanismo de enrutado que nadie más en el proyecto usa, en un equipo de dos estudiantes, y con la advertencia de `AGENTS.md` de que esta versión de Next puede diferir de lo conocido. Coste de aprendizaje alto para un beneficio que la opción 4 consigue casi entero.
4. **Modal gobernado por un parámetro de búsqueda de la propia ruta de agenda.** Elegida.

**Elegida:** la agenda lee un parámetro de búsqueda; si trae un identificador de cita, monta el modal encima. La URL es enlazable y compartible, el botón «atrás» cierra el modal en lugar de abandonar la agenda, y no se introduce ningún mecanismo de enrutado nuevo.

**Se aplica igual al modal de cancelación**, que se monta sobre el detalle: un segundo parámetro, o un valor del primero.

### DD-10 · Constructor de formatos: sin dependencias nuevas

**Problema.** El constructor (B.14) pide reordenar secciones y campos por arrastre, y el paso 2 de la ficha (B.12) pide una zona de arrastre de archivos con chips. El proyecto tiene **cuatro dependencias de producción** y ninguna cubre nada de esto.

**Elegida:** **no se añaden dependencias.**

- **Reordenamiento por flechas arriba y abajo**, no por arrastre. La corrección CF-8 ya pide que las flechas acompañen al arrastre «porque el arrastre es difícil de descubrir y de usar en tablet». En un prototipo, las flechas solas cumplen el propósito —evaluar si el constructor hace falta— con una fracción del trabajo. Las asas de arrastre se dibujan como afordancia visual, sin comportamiento.
- **Adjuntos sin carga real.** La zona de arrastre y los chips se construyen; seleccionar un archivo añade su chip. No hay subida, ni almacenamiento, ni lectura del contenido.

**Fundamento:** una librería de arrastre añadiría a las dependencias de producción del sitio público —que despliega la misma imagen— peso que existe solo para el submódulo **más probable de descartarse** del prototipo entero (fase 9). Es exactamente el tipo de complejidad que el briefing pide evitar.

---

## Capítulo 8 — Plan por fases

Diez fases. El tamaño relativo se indica para justificar el orden, sin estimaciones de tiempo.

---

### Fase 1 — Reorganización de layouts y andamiaje de rutas

_Tamaño relativo: pequeña. Riesgo: el más alto del plan._

**Objetivo.** El sitio público sigue exactamente igual, servido ahora desde su propio grupo de rutas, y `/panel` responde con una página propia sin rastro del cromo público.

**Por qué va primera — y por qué nada puede adelantársele.** Es la razón declarada en el punto 7.1 del briefing y la confirmé en el código (§2.3): el layout raíz monta Navbar, Footer y WhatsApp alrededor de todo lo que cuelgue de `src/app/`, y además exporta metadata con indexación activa e inyecta el JSON-LD de la clínica en `<head>`. Cualquier vista de panel creada antes hereda las tres cosas. El costo de corregirlo crece con cada vista construida encima, porque a partir de la segunda ya no es mover un archivo: es revisar si cada vista compensaba a mano lo que heredaba. Y el JSON-LD tiene un agravante: **es invisible en pantalla**. Nadie lo va a notar recorriendo el panel; se descubre cuando el panel administrativo aparece en un buscador como clínica de fisioterapia.

**Alcance — entra.**

- **Lectura de la guía correspondiente en `node_modules/next/dist/docs/`** (§2.1), obligatoria antes de escribir código. En esta fase importa más que nunca: la variante de dos raíces depende de convenciones de enrutado que `AGENTS.md` advierte que pueden haber cambiado en esta versión.
- **Traslado de `icon.svg` dentro de cada grupo** (§4.2, punto 3). Es un caso conocido de las raíces múltiples, no algo que haya que investigar.
- **Movimiento de `layout.tsx` a `(public)/`, sin editar su contenido.**
- **Movimiento de `page.tsx` a `(public)/`, sin editar su contenido.**
- Creación de la raíz del panel: `<html>`, `<body>`, hoja de estilos, variables de fuente y metadata de no indexación.
- Layout del panel, mínimo: estructura de dos zonas sin contenido.
- Página provisional en `/panel/agenda` y redirección desde `/panel`.
- **Verificación del despliegue:** aclarar la incoherencia de nombres de servicio entre el compose versionado y el workflow (D-10), consultando el archivo real del VPS. No se corrige nada aún; se documenta.

**Alcance — no entra.** **Ninguna edición de contenido en los dos archivos que se mueven.** Ningún cambio en secciones, cromo, `metadata.ts` ni `constants.ts`. Ningún token nuevo. Ninguna higiene oportunista: cualquier mejora simultánea vuelve ambiguo el resultado de la comparación, que es el único control objetivo de esta fase.

**Dependencias.** Ninguna. Es el punto de partida.

**Trabajo.** Movimiento de archivos y reparto de responsabilidades del layout. Sin lógica nueva.

**Datos de prueba.** Ninguno.

**Criterio de término.** `/` responde igual que antes; `/panel` responde y no muestra barra de navegación, ni pie, ni botón flotante.

**Verificación de no regresión — la más exigente del plan.**

1. **Comparación del HTML servido de `/` antes y después.** Es el único control objetivo del que se dispone: no hay tests. Se guarda la salida antes de tocar nada y se compara al terminar. **Con la variante de dos raíces la expectativa es identidad, no semejanza**: como no se editó una sola línea del layout ni de la página, cualquier diferencia distinta del orden de atributos indica que algo se hizo mal. Es la ventaja concreta de haber movido en vez de repartir.
2. **Recorrido visual de las siete secciones** (§2.4 — son siete, no ocho; ver D-6): Hero, About, Team, Testimonials, Process, Gallery, Location.
3. **El pie de página sigue al fondo** en la portada y en una ventana alta. Es el punto exacto donde el detalle de §4.4 se manifestaría.
4. **El JSON-LD sigue presente en `/`**, y la metadata mantiene la indexación activa.
5. **El JSON-LD no está en `/panel`**, y su metadata declara no indexación.
6. Navbar fijo, cambio de aspecto al desplazar, menú móvil, botón flotante de WhatsApp: todos funcionando en `/`.

**Riesgos.**

| Riesgo                                                                                | Mitigación                                                                                                                                                      |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **La convención de dos raíces no se comporta como se espera en esta versión de Next** | Es ahora el riesgo principal de la fase. Se mitiga leyendo la documentación incluida **antes** de mover nada (§2.1), y comprobando en local antes de fusionar   |
| `icon.svg` deja de resolverse al no haber layout raíz                                 | **Ya resuelto en el alcance**: el archivo se mueve dentro de cada grupo. Verificación sobre el HTML servido de ambos                                            |
| El pie de página se despega del fondo (§4.4)                                          | **Prácticamente eliminado por la variante elegida**: el `<body>` público viaja intacto dentro de su propio layout. Verificación 3 queda como control redundante |
| El JSON-LD o la metadata pública dejan de emitirse                                    | Verificación 4 sobre el HTML servido, no sobre la pantalla. Al no editarse el archivo, el único modo de perderlos es que el movimiento esté mal hecho           |
| El panel hereda indexación                                                            | Verificación 5. Estructuralmente imposible: no comparte layout                                                                                                  |
| Se aprovecha el viaje para «mejorar de paso»                                          | Alcance cerrado. Cualquier mejora va a una rama distinta                                                                                                        |

**Paralelizable con.** **Con nada.** Es la única fase con exclusión total: toca la raíz de la que cuelga todo lo demás. Es también el argumento para hacerla pequeña y cerrarla rápido.

---

### Fase 2 — Cromo del panel, primitivas, tokens y sesión simulada

_Tamaño relativo: grande. Es la fase que el briefing subestima (D-7)._

**Objetivo.** El panel tiene su barra lateral, su encabezado, su pantalla de acceso y su juego completo de primitivas. Las cuatro secciones son navegables y responden con vistas vacías rotuladas. **Primera fusión a `main` y primer despliegue.**

**Por qué va aquí.** Porque el proyecto **no tiene un solo componente de interfaz reutilizable en uso** (§2.8). Toda vista posterior necesita botón, tarjeta, tabla, modal, campo y píldora. Construirlas dentro de la primera vista de contenido las deja moldeadas por ese caso particular y obliga a rehacerlas en la segunda. El desfase entre marcos que arruina cinco de las catorce pantallas de Figma (G-2, y en detalle NF2-1 a NF2-7, FM-1, FM-2, FM-5, FM-6, CF-1 y CF-2) nace exactamente de no haber fijado el marco primero.

**Alcance — entra.**

- Tokens del panel añadidos a `globals.css`, derivados del azul de marca (D-1): azul de barra lateral, escalón más oscuro para el ítem activo, azul de selección, fondo de contenido, y los colores de rol de los siete estados. **Añadidos, sin modificar ninguno existente.**
- Ajuste de contraste del logotipo sobre el azul de la barra lateral, pedido explícitamente por el cliente (briefing 6.3): fondo claro o la versión blanca ya presente en `public/`.
- **Barra lateral canónica**, en la definición única de la Parte A: logotipo con holgura, rótulo «Panel Administrativo», cuatro ítems en orden fijo —Agenda, Nueva reserva, Pacientes, Fichas clínicas—, divisor, «Cerrar Sesión». Estados inactivo, activo en píldora, y sobrevuelo. **El ítem activo se deriva de la ruta**, con lo que NF2-3 queda cerrada por construcción: es imposible que señale una sección distinta de la que está en pantalla.
- **Encabezado canónico**: título de sección a la izquierda; nombre de usuario, avatar, campana y engranaje a la derecha. Campana y engranaje usan el componente de fuera de alcance (DD-7). «Cerrar Sesión» **no** vive aquí.
- **Primitivas.** La Parte B las multiplica respecto de la lista mínima de la Parte A: botón de cuatro variantes con estado deshabilitado explicado, tarjeta, **tabla con cabecera azul tenue, distintivo de celda y paginación** (B.9, B.10), modal, buscador con lupa y texto de ayuda, campo de texto, área de texto, numérico, desplegable, interruptor, **sección plegable** (B.12), **selector de opción** (B.6, B.12), **badge informativo y badge de contraste invertido** (B.7), píldora de estado, distintivo de origen, **panel de resumen persistente**, **indicador de progreso**, barra de acciones inferior, zona de arrastre de archivos, estado vacío.
- **Ocho correcciones de la Parte B se cierran aquí, de una vez, por vivir en la primitiva y no en la vista.** Es el argumento más fuerte para construirlas antes que cualquier pantalla:

| Corrección         | Qué unifica                                                           | Dónde se decide       |
| ------------------ | --------------------------------------------------------------------- | --------------------- |
| P1-6               | Mayúsculas contra Capitalización en las etiquetas de paso             | Indicador de progreso |
| P1-7, NF1-2        | Cuadrado contra círculo; el número dentro del nodo, no en la etiqueta | Indicador de progreso |
| NF1-1, NF2-11, G-8 | `RESUMEN`, `Resumen` y `Resumen de Reserva` conviviendo               | Panel de resumen      |
| P2-1, NF2-8        | Selección en gris contra selección en azul con borde                  | Selector de opción    |
| NF1-3              | `Cancelar` como botón secundario contra enlace subrayado              | Barra de acciones     |
| NF1-5              | Flecha en `Continuar →` en unos sitios y no en otros                  | Botón                 |
| G-6                | El distintivo de origen cambia de color según el estado de la cita    | Distintivo de origen  |
| G-7, P1-5          | Raya media y guion mezclados en los rangos horarios                   | Formateador (fase 3)  |

Construidas después, cada una de estas ocho habría que corregirla en varias vistas ya hechas. Construidas ahora, **no pueden ocurrir**.

- **Accesibilidad de teclado, decidida una vez en las primitivas** (G-14). Estado de foco visible en todo control interactivo, orden de tabulación coherente con el orden visual, y foco atrapado y devuelto en los modales. **Es un panel que se va a usar a diario, muchas veces sin soltar el teclado**, y las especialistas vienen de una plataforma donde eso funciona. Va aquí y no en la fase 10 por la misma razón que las ocho correcciones de arriba: en la primitiva es una decisión; repartida por veinte vistas es una auditoría.
- **Estados vacíos** de cada listado y de la agenda (G-13): un día sin citas, una búsqueda sin resultados, un paciente sin fichas. Son situaciones que las especialistas van a encontrar recorriendo el prototipo, y la semilla las provoca a propósito (§5.5).
- **Los tres mecanismos de autoexplicación** de DD-7.
- `usePanelSessionStore` y la vista de **acceso del personal** (#1).
- Las cuatro rutas de sección, con vistas vacías que declaran qué llegará ahí.

**Alcance — no entra.** Ningún dato de dominio. Ninguna vista con contenido. La barra lateral no gana ítems (NF2-2).

**Dependencias.** Fase 1 cerrada. Sin los layouts separados, el cromo del panel convive con el público.

**Datos de prueba.** Solo el usuario del personal de la sesión simulada. **Ninguna cita, ningún paciente.** Es deliberado: fuerza a que las primitivas se diseñen contra el modelo, no contra un ejemplo.

**Criterio de término.** Se entra por `/panel/acceso`, se navega entre las cuatro secciones, el ítem activo siempre corresponde, el encabezado cambia de título, «Cerrar Sesión» devuelve al acceso, el aviso de datos de prueba está visible, y campana y engranaje declaran estar fuera de alcance en vez de no hacer nada. **El recorrido completo se puede hacer solo con teclado, con el foco siempre visible** (G-14). **Desplegado en producción y alcanzable por URL.**

**Verificación de no regresión.** Repetición de las verificaciones 1, 2 y 4 de la fase 1. Más dos propias, que se repiten en todas las fases siguientes: **cero importaciones del panel hacia `components/ui/`, `components/sections/` o `constants.ts`**; y **cero apariciones de la cadena `panel` en el sitio público** — el control de que no se coló un enlace.

**Riesgos.**

| Riesgo                                                            | Mitigación                                                                                                    |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Se subestima por creer que hay componentes reutilizables (D-7)    | El plan lo declara: es la fase grande. Se puede partir en dos —cromo, y primitivas— si hay que interrumpir    |
| Las primitivas se quedan cortas y hay que ampliarlas en la fase 4 | Aceptado y esperado. La lista sale de la Parte A, que es el marco canónico; ampliarla es barato, rehacerla no |
| Se despliega y el aislamiento no se comporta como en local        | **Es exactamente el motivo de desplegar ahora**, con el armazón vacío, y no en la fase 10                     |
| El compose del VPS no coincide con el versionado (D-10)           | Se aclaró en la fase 1. Si el despliegue falla, falla sobre una página vacía                                  |

**Paralelizable con.** **Fase 3**, sin fricción: una construye interfaz sin datos, la otra datos sin interfaz. Es el mejor punto de reparto entre los dos desarrolladores de todo el plan.

---

### Fase 3 — Modelo de dominio y universo de datos de prueba

_Tamaño relativo: media. Valor estructural: el más alto del plan._

**Objetivo.** Existe el vocabulario del panel y existe un universo de datos coherente, consultable a través de una capa de acceso asíncrona. Nada de esto se ve todavía en pantalla.

**Por qué va antes que toda vista de contenido.** Porque la coherencia entre pantallas es un **requisito**, no un detalle (punto 7.4). Si la agenda se construye primero y define sus propias citas de ejemplo, el listado de pacientes se construirá contra otras, y el prototipo reproducirá el defecto 11 de Figma. Y porque el catálogo de estados (DD-5) es la pieza de la que dependen la rejilla, la leyenda, el detalle, el perfil y todo listado: si no existe cuando se construye la agenda, la agenda inventará sus colores y habrá que rehacerla.

**Alcance — entra.**

- **Capa de dominio:** tipos y catálogos. Los siete estados con etiqueta, color, orígenes admisibles y acciones (DD-5). Los orígenes. La regla horaria como generador, con la franja 14:00–15:00 no representable (§5.4, regla 4).
- **Capa de acceso:** las funciones asíncronas del §5.2, resolviendo contra la semilla.
- **Semilla:** el universo del §5.5, con las cuatro reglas estructurales del §5.4.

**Alcance — no entra.** Ninguna vista. Ninguna mutación. Ninguna validación.

**Dependencias.** Fase 1, solo porque el árbol debe existir. **No depende de la fase 2.**

**Datos de prueba.** Es la fase que los define. Todos.

**Criterio de término.** El generador de rejilla produce los bloques correctos para un día de semana y uno de fin de semana, **y no produce ningún bloque entre 14:00 y 15:00**. El catálogo tiene siete estados. Los contadores de un paciente coinciden con su historial, comprobado sobre el caso de historial más largo. Una búsqueda de `_seed` fuera de la capa de acceso da cero resultados.

**Verificación de no regresión.** Es código nuevo y aislado; el sitio público no puede verse afectado. Se ejecuta igual la comparación del HTML de `/`, por barata.

**Riesgos.**

| Riesgo                                                                     | Mitigación                                                                                                                                                                        |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| El modelo se diseña contra lo que hará falta más tarde y hay que rehacerlo | Se construye contra las **catorce vistas de Figma más las cuatro nuevas**, que ya están inventariadas (capítulo 6). El inventario es el requisito de entrada                      |
| Se contradice el modelo que el backend está definiendo en paralelo         | **Se comparte el catálogo de estados y el modelo de cita con el equipo de backend al cerrar esta fase.** Es la decisión del prototipo que más condiciona al backend (capítulo 13) |
| La semilla queda pobre y las vistas parecen vacías                         | La cobertura mínima del §5.5 es criterio de término, no aspiración                                                                                                                |

**Paralelizable con.** **Fase 2.** Ver allí.

---

### Fase 4 — Agenda

_Tamaño relativo: grande. Valor de retroalimentación: el más alto._

**Objetivo.** La sección de trabajo diario funciona de punta a punta: rejilla de la jornada, navegación entre días, detalle de cita según origen y estado, y cancelación con advertencia de anticipo.

**Por qué va primera entre las vistas.** Es el corazón de la operación diaria y lo que las especialistas compararán directamente con AgendaPro. Es también donde se concentran cuatro decisiones que necesitan validación temprana: la distinción entre Pendiente de pago y Por confirmar (7.6), la ausencia de la franja de colación (6.1), la leyenda completa (A-3), y la advertencia de anticipo al cancelar (5.3). Si algo de esto está mal planteado, conviene saberlo **antes** de construir cinco secciones más sobre el mismo modelo.

**Alcance — entra.**

- **Agenda principal** (#2): barra de herramientas con control segmentado de día, fecha en formato extenso, filtros y botón de nueva reserva; cabecera de columna con especialista y cargo; rejilla completa **hasta las 21:00 con desplazamiento** (corrección A-5); tarjetas de cita con acento de color, rango horario, estado y distintivo de origen; filas vacías seleccionables que llevan al asistente con el bloque preseleccionado; **leyenda de los siete estados más Bloqueado** (corrección A-3).
- **Detalle de cita** (#3): una sola vista que se adapta a origen y estado. Acciones **derivadas del catálogo**, con la primaria destacada según el estado (DD-5, M-9, W-3). Correo del paciente y cargo del especialista resueltos por referencia, nunca copiados (W-1, M-2, §5.4 regla 1). Servicio mostrado desde el catálogo real, sin la glosa inexistente (M-1). Identificador único por cita y creación anterior a la atención (M-5, M-6). Icono de origen neutro o específico, nunca un globo terráqueo para una cita manual (M-4). **Notas para el paciente e internas, diferenciadas** (M-7). **Traza de auditoría plegable al pie** (M-8, RF-AUD-003). En citas web, banner de anticipo con el identificador de transacción de Webpay (W-2) y el nombre oficial del convenio (W-4).
- **Línea de hora actual** sobre la rejilla cuando el día visualizado es hoy (A-8). Es una convención de agenda que las especialistas ya conocen de AgendaPro.
- **Modal de cancelación** (#4), vista nueva de prioridad alta: advierte del anticipo de 10.000 CLP **cuando la cita es de origen web** y exige motivo. Es el punto donde el cliente y las especialistas deben pronunciarse sobre la política de devolución, que sigue abierta.
- Todas las acciones usan el componente de acción simulada (DD-7).

**Alcance — no entra.** Bloqueos y excepciones, que son la fase 8: en esta fase los bloqueos **se muestran** desde la semilla pero no se crean ni editan. Agenda por box (7.10). Vista semanal o mensual: la especificación describe jornada diaria.

**Correcciones cerradas aquí.** A-1 y A-2 (por construcción, desde la fase 3), A-3, A-4 (no se construye el indicador de sincronización), A-5, A-6, A-7, A-8; M-1 a M-9; W-1 a W-5.

**Dependencias.** Fases 2 y 3, ambas. Es la primera fase que las necesita a las dos, y el punto donde vuelven a converger los dos desarrolladores.

**Datos de prueba.** Definidos en la fase 3. Aquí se **verifica** que la jornada de referencia exhibe los siete estados a la vez (§5.5) — el caso de prueba más importante del prototipo.

**Criterio de término.** La rejilla del día de referencia muestra los siete estados; **salta de 13:30 a 15:00**; la leyenda tiene ocho entradas con los mismos colores que las tarjetas; una cita Pendiente de pago no ofrece ninguna acción y **explica por qué**; una Por confirmar ofrece confirmar; cancelar una cita web advierte del anticipo y pide motivo; ningún camino de la sección termina en un botón inerte.

**Verificación de no regresión.** Las de la fase 2, íntegras.

**Riesgos.**

| Riesgo                                                                                 | Mitigación                                                                                                |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| La rejilla completa hasta las 21:00 con desplazamiento es más trabajo del que aparenta | Es la corrección A-5 y no es opcional: una agenda que se corta a las 15:00 impide evaluar la jornada real |
| Se replica la ambigüedad de «Pendiente» del prototipo de Figma                         | Imposible por construcción: el catálogo de la fase 3 tiene dos entradas distintas con acciones distintas  |
| Reaparece el bloque de colación                                                        | Imposible por construcción: el generador no lo produce                                                    |
| El modal de cancelación abre una discusión de política de devolución no resuelta       | **Es su propósito.** El prototipo pregunta; no decide                                                     |

**Paralelizable con.** Nada crítico. Es el punto de convergencia. Puede solaparse con el arranque de la fase 5, que comparte la rejilla horaria y el catálogo de servicios.

---

### Fase 5 — Asistente de nueva reserva

_Tamaño relativo: grande._

**Objetivo.** El personal puede recorrer de principio a fin la creación de una cita manual, en cuatro pasos con resumen persistente, y llegar a una pantalla de éxito.

**Por qué va segunda.** Es la otra mitad de la operación diaria y la segunda fuente de aprendizaje. Comparte con la agenda la rejilla horaria y el catálogo de servicios, con lo que hacerla inmediatamente después aprovecha lo recién construido.

**Alcance — entra.**

- **Paso 1 · Horario** (#5): selección de fecha y bloque sobre la misma rejilla generada de la fase 3 — **sin franja de colación** (corrección A-1/A-2, ya cerrada). Acepta el bloque preseleccionado desde la agenda.
- **Paso 2 · Paciente** (#6): búsqueda y selección de paciente existente, con salida hacia el registro de paciente nuevo (#12, fase 6). **Hasta que exista, ese enlace usa el componente de fuera de alcance** — no queda inerte.
- **Paso 3 · Servicio** (#7): **Masoterapia antes que Kinesiología** (P3-1), sin duración ni precio, y con la tarjeta ajustada a su contenido (P3-2).
- **Paso 4 · Notas y resumen** (#8): notas para el paciente e internas con sus distintivos de visibilidad. **El botón dice «Confirmar reserva»**, no «Continuar» (P4-1). El panel de resumen **no desaparece** en este paso (P4-2). Cada fila de la revisión final ofrece editar y volver al paso correspondiente (P4-3), en el mismo orden que el resumen (P4-5). Cancelar la reserva pide confirmación (P4-4).
- **Pantalla de éxito** (#9), con salidas explícitas: volver a la agenda o crear otra reserva.
- **Panel de resumen persistente** en los cuatro pasos, misma posición y mismo título, con «Por definir» en cursiva para lo aún no elegido (Parte A).

**Alcance — no entra, y esto es una restricción dura.** **Ningún paso, campo, glosa ni mención de pago, anticipo, Webpay, «pagada en local», «pendiente de cobro» ni «exenta».** Ya se eliminó una vez del prototipo de Figma por indicación expresa (7.7). La cita manual no exige anticipo. Tampoco entra cálculo de disponibilidad: los bloques ocupados salen de la semilla, no de una regla.

**Correcciones cerradas aquí.** P1-1 a P1-9; P2-1 a P2-5; P3-1 a P3-3; P4-1 a P4-5; PE-1 a PE-3.

**Dependencias.** Fases 2, 3 y 4 — la 4 no por acoplamiento técnico, sino porque el paso 1 reutiliza la rejilla ya validada.

**Datos de prueba.** Los de la fase 3. Requiere que la semilla tenga suficientes pacientes para que la búsqueda del paso 2 sea significativa.

**Criterio de término.** Se recorren los cuatro pasos, hacia adelante y hacia atrás, con el resumen actualizándose; el botón final dice «Confirmar reserva»; la pantalla de éxito ofrece salidas reales; **una búsqueda de «Webpay», «anticipo» y «pago» en la sección da cero resultados**.

**Verificación de no regresión.** Las de la fase 2.

**Riesgos.**

| Riesgo                                                    | Mitigación                                                                 |
| --------------------------------------------------------- | -------------------------------------------------------------------------- |
| Reaparece el paso de pago por analogía con el flujo web   | Criterio de término explícito, por búsqueda de texto                       |
| El estado del asistente se complica más de lo previsto    | Store de vida corta, sin persistencia. Una recarga vuelve al paso 1 (DD-4) |
| El enlace a «paciente nuevo» queda inerte hasta la fase 6 | Componente de fuera de alcance mientras tanto                              |

**Paralelizable con.** **Fase 6.** Pacientes comparte con el paso 2 el modelo de paciente pero no su interfaz.

---

### Fase 6 — Pacientes

_Tamaño relativo: media._

**Objetivo.** El listado de pacientes deja de ser un callejón sin salida: cada fila abre un perfil con historial, y existe el registro de paciente nuevo.

**Por qué va aquí.** Cierra el primero de los tres vacíos de prioridad alta del punto 5.3: en Figma el listado no abre nada. Es un vacío que se nota en cuanto alguien hace clic, y por eso genera un reporte de error en vez de retroalimentación sobre el flujo. Va después de agenda y reserva porque el perfil del paciente muestra historial de citas, que la fase 4 ya modeló.

**Alcance — entra.**

- **Listado** (#10): buscador único sobre RUT, nombre o correo; columnas y paginación. **Los convenios de ejemplo son empresas o sindicatos, nunca Isapre ni Fonasa** (PA-1). **La columna de teléfono debe caber en una línea** — ninguna celda parte un dato atómico (PA-2). Botón `+ Nuevo paciente` como acción primaria: el alta no depende de iniciar una reserva (PA-3). Un solo dominio de correo ficticio (PA-6).
- **Perfil del paciente** (#11), vista nueva de prioridad alta: datos de contacto, **contadores derivados** (§5.4 regla 2), historial de citas con las mismas píldoras de estado que la agenda, y acceso a sus fichas.
- **Registro de paciente nuevo** (#12): formulario completo, **sin validación real de RUT ni de ningún campo** (restricción 6). Al enviar, acción simulada. Alcanzable desde el listado y desde el paso 2 del asistente, que deja de estar fuera de alcance.

**Alcance — no entra.** Edición de paciente. Fusión de duplicados. Gestión de convenios como entidad.

**Correcciones cerradas aquí.** PA-1 a PA-7.

**Dependencias.** Fases 2 y 3. La 4 solo para que el historial reutilice la píldora de estado.

**Datos de prueba.** Los de la fase 3, con la densidad desigual del §5.5.

**Criterio de término.** Toda fila del listado abre un perfil; **los contadores del perfil coinciden con el historial mostrado**; las fichas del paciente son alcanzables —o declaran estar fuera de alcance si la fase 7 aún no cerró—; los convenios son empresas o sindicatos.

**Verificación de no regresión.** Las de la fase 2.

**Riesgos.**

| Riesgo                                        | Mitigación                                                        |
| --------------------------------------------- | ----------------------------------------------------------------- |
| Se cuela validación de RUT «porque es fácil»  | Restricción 6. Es lógica de negocio y su regla la fija el backend |
| Los contadores se escriben a mano y discrepan | Imposible por construcción: se derivan (fase 3)                   |

**Paralelizable con.** **Fase 5**, y con la 7 si hay tres frentes.

---

### Fase 7 — Fichas clínicas

_Tamaño relativo: grande._

**Objetivo.** Se crea una ficha en dos pasos, se listan las fichas y **se abre una ficha guardada** con el historial de fichas anteriores del paciente.

**Por qué va aquí.** Cierra el segundo vacío de prioridad alta: en Figma el listado de fichas no abre nada. Va después de Pacientes porque la ficha se asocia a un paciente y a una cita, y el perfil ya establece cómo se navega hacia ella.

**Alcance — entra.**

- **Listado** (#13), con distintivo «Con ficha».
- **Listado** (#13) con distintivo «Con ficha», **filtros por tipo de ficha y por rango de fechas de atención** (F-6), y bloques de 30 minutos en la columna de reserva asociada (F-1).
- **Nueva ficha, pasos 1 y 2** (#14, #15), con panel de resumen persistente en ambos, titulado `RESUMEN` (NF1-1, NF2-11). **El marco es el canónico** — NF2-1 a NF2-7: nada de barra lateral ni encabezado distintos, ni ítem «Configuración», ni iconos propios. NF2-3 ya cerrada por construcción desde la fase 2. **Las reservas que ya tienen ficha quedan deshabilitadas**, con enlace para abrirla: una reserva admite una única ficha (NF1-4, RF-FIC-015). Campos obligatorios señalizados con asterisco (NF2-9), nombres de campo idénticos a los del constructor (NF2-10), y **aviso de contenido privado visible sin desplazarse** (NF2-12).
- **Ficha guardada** (#16), vista nueva de prioridad alta: ficha completa, historial de fichas anteriores del paciente, y **exportación a PDF mediante el componente de fuera de alcance** — la exportación real es funcionalidad, no prototipo, y hay que decirlo en vez de dejar un botón inerte.

**Alcance — no entra.** Exportación real a PDF. Edición de ficha guardada. Adjuntos.

**Correcciones cerradas aquí.** F-1 a F-7; NF1-1 a NF1-5; NF2-1 a NF2-13.

**Dependencias.** Fases 2, 3 y 6.

**Datos de prueba.** Los de la fase 3: pacientes con varias fichas, con una, y sin ninguna.

**Criterio de término.** Toda fila del listado abre una ficha; la ficha guardada muestra el historial anterior del paciente; **el marco es idéntico al del resto del panel** en las cuatro vistas; la exportación declara estar fuera de alcance.

**Verificación de no regresión.** Las de la fase 2. Y una específica: comparar barra lateral y encabezado de estas cuatro vistas contra los de la agenda. Es donde Figma se desvía y donde alguien podría desviarse de nuevo.

**Riesgos.**

| Riesgo                                       | Mitigación                                                                                                                                            |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Se replica el marco desviado de Figma        | El cromo viene del layout del panel: **no hay dónde desviarse.** La verificación es un control redundante                                             |
| El formulario de ficha crece indefinidamente | Su contenido depende de la decisión pendiente sobre formatos configurables (fase 9). **Se construye con secciones fijas** y esa limitación se declara |

**Paralelizable con.** Fase 8.

---

### Fase 8 — Bloqueos de agenda y horarios de atención

_Tamaño relativo: pequeña._

**Objetivo.** Se gestionan las excepciones que cierran franjas y se consultan los horarios de atención por especialista.

**Por qué va aquí.** Son las dos vistas de prioridad media que quedan y completan la sección Agenda. Van después de la 4 porque el bloqueo se representa **sobre** la rejilla ya construida.

**Alcance — entra.**

- **Bloqueos y excepciones** (#17): listado y creación, con tipos —feriado, emergencia, colación personal— y su representación en la rejilla de la agenda.
- **Horarios de atención por especialista** (#18): consulta de la jornada de cada especialista sobre la regla horaria del dominio.

**Alcance — no entra, y hay que ser explícito.** **La colación del centro entre 14:00 y 15:00 no es un bloqueo y no aparece aquí de ninguna forma.** Es una franja que no existe. Si aparece en esta sección, aunque sea como ejemplo, se reabre la corrección A-2 por la puerta de atrás.

**Dependencias.** Fases 2, 3 y 4.

**Datos de prueba.** El bloqueo de ejemplo del §5.5, personal del especialista y en otra franja.

**Criterio de término.** Un bloqueo creado se representa sobre la rejilla; los horarios reflejan la regla del dominio, incluido el corte de 14:00 a 15:00 **como ausencia, no como bloqueo**; ninguna vista de esta sección menciona la colación del centro.

**Verificación de no regresión.** Las de la fase 2.

**Riesgos.**

| Riesgo                                                   | Mitigación                                                                    |
| -------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Reaparece la colación del centro como bloqueo de ejemplo | Está en el alcance excluido y en el criterio de término                       |
| Se confunden bloqueo y horario                           | Vocabulario del proyecto: el bloqueo es una excepción; el horario es la regla |

**Paralelizable con.** Fases 7 y 9.

---

### Fase 9 — Formatos de ficha

_Tamaño relativo: media. Prioridad: la más baja, deliberadamente._

**Objetivo.** Existe el submódulo de formatos, con listado y constructor, **como instrumento para provocar una decisión del cliente**.

**Por qué va última entre las vistas.** Porque su propósito es distinto del de todas las demás. Las otras diecisiete prototipan funcionalidad comprometida; esta prototipa una **pregunta**: ¿acepta el cliente formatos fijos o necesita un constructor configurable? Si acepta formatos fijos, esta fase se descarta entera. Ponerla al final significa que, si los exámenes obligan a interrumpir, lo que queda sin hacer es lo que quizá no había que hacer. Es la aplicación literal del criterio 9.6 del briefing.

**Alcance — entra.**

- **Listado de formatos** (#19). **Sin caracteres duplicados en el enlace de retorno ni en el botón** (FM-3, FM-4). Marco canónico, sin bloque de usuario en la barra lateral ni «Cerrar Sesión» rojo en el encabezado (FM-1, FM-2, FM-5, FM-6). Acciones de editar y duplicar por formato (FM-7), y el distintivo «En uso» indica **sobre cuántas fichas** (FM-8).
- **Constructor** (#20): composición visual de secciones y campos, con vista previa en tiempo real fiel a lo escrito en el editor (CF-6), sin persistencia y sin efecto sobre el formulario de ficha de la fase 7. **Los campos de tipo Selección expanden su fila para definir sus opciones** (CF-5) — sin esto, el constructor no permite evaluar el único tipo de campo que exige configuración. Interruptor de obligatorio separado del desplegable y con estados inequívocos (CF-3, CF-4). Reordenamiento por flechas, no por arrastre (CF-8, DD-10). Confirmación al eliminar una sección, indicando cuántos campos se pierden (CF-10).
- **Un aviso visible, en ambas vistas, de que este submódulo está sujeto a confirmación del cliente.** Sin él, las especialistas asumirán que es funcionalidad comprometida y la retroalimentación no responderá a la pregunta que motiva su existencia.

**Alcance — no entra.** Que el constructor afecte a las fichas reales. Persistencia de formatos.

**Correcciones cerradas aquí.** FM-1 a FM-10; CF-1 a CF-10.

**Dependencias.** Fases 2 y 3.

**Datos de prueba.** Dos o tres formatos de ejemplo, coherentes con las secciones de la ficha de la fase 7.

**Criterio de término.** Ambas vistas navegables, con el marco canónico, sin caracteres duplicados, y con el aviso de estar sujetas a confirmación.

**Verificación de no regresión.** Las de la fase 2.

**Riesgos.**

| Riesgo                                         | Mitigación                                                 |
| ---------------------------------------------- | ---------------------------------------------------------- |
| Se invierte esfuerzo en algo que se descartará | Va última, precisamente por eso                            |
| El cliente lo interpreta como compromiso       | El aviso es parte del alcance, no un adorno                |
| El constructor crece hacia un editor completo  | Es un prototipo para decidir. Composición visual, nada más |

**Paralelizable con.** Fase 8.

---

### Fase 10 — Coherencia transversal, cierre y entrega

_Tamaño relativo: pequeña. Imprescindible._

**Objetivo.** El prototipo se recorre entero sin cabos sueltos y llega a manos del cliente y las tres especialistas con instrucciones de qué revisar.

**Por qué existe como fase.** Porque las nueve anteriores se construyen en momentos distintos, posiblemente por dos personas y con exámenes de por medio. La coherencia entre pantallas —que es un requisito, no un detalle— solo puede comprobarse cuando todas existen. Y porque la entrega es el propósito declarado del trabajo: un prototipo que no llega al cliente no cumple ninguna función.

**Alcance — entra.**

- **Recorrido del checklist completo de correcciones**, y es criterio de término, no una revisión de cortesía. Las correcciones son más de noventa y se cerraron a lo largo de siete fases; las menores son las que se caen. Se recorren **todas** las de la especificación visual —A-, M-, W-, P1- a P4-, PE-, PA-, F-, NF1-, NF2-, FM-, CF- y G-1 a G-14—, marcando cada una como cerrada, no aplicable o pendiente. **Ninguna puede quedar sin marcar.** Es el único mecanismo del plan que garantiza que la lista entera se recorrió (R-11).
- **Recorrido completo de coherencia**, con una lista de control explícita: los siete estados con el mismo color en las cinco pantallas donde aparecen; los mismos pacientes en agenda, listado y fichas; contadores que cuadran; ninguna fecha escrita a mano; ninguna franja de colación en ninguna vista de agenda; ningún rastro de pago en el asistente de reserva.
- **Recorrido de teclado de punta a punta** (G-14), y de los estados vacíos de cada listado (G-13).
- **Barrido de caminos muertos:** todo elemento interactivo del panel lleva a algún sitio, produce una acción simulada, o declara estar fuera de alcance. Ninguno inerte.
- **Verificación final de aislamiento** en producción: recorrer el sitio público buscando cualquier enlace al panel, y comprobar la no indexación de `/panel` sobre el HTML servido.
- Despliegue final y **material de acompañamiento**: la URL, qué se pide revisar y qué no, y el formulario de retroalimentación (capítulo 9).

**Alcance — no entra.** Funcionalidad nueva. Correcciones estéticas que no provengan de las correcciones numeradas.

**Dependencias.** Todas.

**Criterio de término.** La lista de control pasa entera. El prototipo está desplegado, es alcanzable por URL, no es alcanzable desde el sitio público, y el formulario está distribuido.

**Verificación de no regresión.** La comparación completa del HTML de `/` **contra la salida guardada antes de la fase 1**. Es el control definitivo de que diez fases de trabajo no movieron un byte del sitio público.

**Riesgos.**

| Riesgo                                                          | Mitigación                                                                                           |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Se descubren incoherencias tarde y hay que retocar varias fases | Las cuatro reglas del §5.4 las previenen por construcción. Esta fase debería confirmar, no descubrir |
| Se recorta por falta de tiempo                                  | Es la fase que convierte el trabajo en retroalimentación. Recortarla es tirar las nueve anteriores   |

**Paralelizable con.** Nada.

---

### 8.1 Resumen del orden y sus dependencias

```
F1  Layouts                      ← nada puede adelantársele
     ├── F2  Cromo + primitivas + sesión ──┐   ← primer despliegue
     └── F3  Dominio + datos      ─────────┤   ← en paralelo con F2
                                           ↓
                                  F4  Agenda            (valor máximo)
                                           ↓
                                  F5  Nueva reserva ──┐
                                  F6  Pacientes     ──┤  ← paralelizables
                                           ↓          │
                                  F7  Fichas        ──┤
                                  F8  Bloqueos/Horarios┤
                                  F9  Formatos        ─┘  ← la descartable
                                           ↓
                                  F10 Coherencia y entrega
```

**Reparto entre dos desarrolladores.** F1 en solitario. F2 y F3 son el mejor punto de reparto del plan: interfaz sin datos contra datos sin interfaz. F4 los reúne. De F5 a F9 se reparten por sección, con la única precaución de que F6 (Pacientes) cierre antes que F7 (Fichas). F10 en conjunto.

**Si hay que interrumpir.** Todas las fases dejan algo mostrable y desplegable. El corte más natural es al cerrar F4: agenda completa con detalle y cancelación ya sostiene una ronda entera de retroalimentación sobre el corazón de la operación.

---

## Capítulo 9 — Estrategia de entrega y validación

### 9.1 Cómo llega

Desplegado en producción bajo `/panel`, alcanzable solo escribiendo la URL (DD-8). Se despliega al cierre de la fase 2 y en cada fase posterior con valor mostrable, para que el prototipo crezca a la vista del cliente.

**Esto se aparta de lo acordado en la última reunión**, donde se mantuvo la exportación a PDF como mecanismo de validación (requerimientos 13.5). El fundamento está en D-12: ese mecanismo se pactó cuando el prototipo era el de Figma, y aplicado a este anula justamente la navegabilidad que motivó construirlo. **Decidido el 28 de julio de 2026: se entrega desplegado y el PDF queda descartado**; falta comunicárselo a Diego. Del mecanismo acordado se conserva íntegra la parte que sí funciona —**el formulario, sin reuniones**—, que responde a una restricción real: el equipo clínico está saturado con las capacitaciones de AgendaPro.

### 9.2 Cómo se garantiza que no sea alcanzable desde el sitio público

Cuatro controles, todos verificables, ejecutados en cada fase (§4.5): sin enlaces, sin sitemap, con no indexación en la metadata de su layout, y sin cromo compartido. El último es el que sostiene a los demás: **el panel y el sitio público no comparten un solo componente de navegación**, así que no hay dónde aparezca un enlace por descuido.

### 9.3 Qué se les pide que revisen

El cliente pidió expresamente centrar la revisión en lo **funcional**, no en lo estético, recogida por formulario y sin reuniones. El material de acompañamiento debe dirigir la atención en consecuencia.

**Sí se pide opinar sobre:**

- Si el flujo de la jornada refleja cómo trabajan de verdad.
- Si falta un paso, un dato o una acción en algún punto.
- Si la distinción entre **Pendiente de pago** y **Por confirmar** se entiende sin explicación. _(Es la pregunta más importante del prototipo: es la trampa 7.6 y solo ellas pueden responderla.)_
- Si la advertencia de anticipo al cancelar dice lo que debe decir, y qué debería pasar con esos 10.000 CLP.
- Si el asistente de reserva manual pide lo necesario y nada más.
- Si el perfil del paciente y la ficha muestran lo que se consulta en la práctica.
- **Los campos de la ficha clínica**, dirigido en particular a **Valeria Araneda**: los del prototipo son provisorios y su estructura definitiva le corresponde definirla a ella. Es la decisión pendiente N° 1 y está marcada **bloqueante** — de todas las preguntas del formulario, es la que más trabajo desbloquea.
- Si el constructor de formatos hace falta, o basta con formatos fijos. _(Es la decisión que este submódulo existe para provocar, y la de mayor impacto en el alcance: los formatos configurables obligan a versionarlos para que las fichas históricas conserven su estructura.)_
- Si cada especialista debe ver todas las fichas del centro o solo las de sus propias atenciones (decisión pendiente N° 2, también bloqueante).
- Si los horarios de atención que muestra el panel corresponden a los reales de cada una.
- Qué echan de menos de AgendaPro. _(El cliente dio la directriz de parecerse a esa plataforma; esta pregunta la convierte en una lista concreta en vez de una aspiración abierta.)_

**No se pide opinar sobre:** colores, tipografías, tamaños ni espaciados; los datos mostrados, que son de prueba y así lo declara el propio panel; el rendimiento; nada marcado como fuera de alcance, que las propias vistas señalan.

### 9.4 Advertencias explícitas en el material

Tres, para que ningún reporte se gaste en ellas: los datos son ficticios; nada se guarda —confirmar, cancelar o registrar produce una confirmación visual pero no persiste—; y las funciones señaladas como fuera de alcance lo están a propósito.

### 9.5 Qué hacer si algo se cuela

DD-8 fusiona a `main` y despliega a producción en cada fase con valor mostrable. Es la decisión correcta, pero tiene una consecuencia que hay que nombrar: **un error se ve en kinefitchile.com**. El plan verifica antes de fusionar; falta decir qué pasa si algo pasa igual.

| Regla          | Detalle                                                                                                                                                                                                                                             |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Reversión**  | Revertir el commit de fusión en `main` y volver a desplegar. El pipeline se dispara con el push, así que la vuelta atrás usa el mismo camino que la ida. No se corrige en caliente sobre `main`: se revierte primero, se arregla después en la rama |
| **Horario**    | **La primera fusión —la de la fase 1, la única que toca el sitio público— se hace en horario de baja visita.** Las nueve siguientes solo añaden rutas bajo `/panel` y no pueden afectar a `/`                                                       |
| **Quién mira** | Quien fusiona comprueba `/` en producción inmediatamente después del despliegue, no al día siguiente                                                                                                                                                |
| **Referencia** | El HTML de `/` guardado antes de la fase 1 (§8, F1) es la referencia contra la cual se compara en cualquier momento del proyecto, no solo en esa fase                                                                                               |

**El riesgo se concentra entero en la fase 1.** A partir de la fase 2, el sitio público y el panel no comparten ningún archivo, y un fallo del panel es invisible desde `/`.

---

## Capítulo 10 — Riesgos del proyecto

| #    | Riesgo                                                                                                                                                           | Prob.        | Impacto | Mitigación                                                                                                                                                                                                                                                                                |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-1  | **Contaminación del sitio público por la reorganización de layouts.** El único punto donde el trabajo puede romper algo que funciona                             | **Baja**     | Alto    | Bajó de media a baja al adoptar la variante de dos raíces (DD-1): el sitio público se **mueve sin editarse**, con lo que la expectativa de la comparación pasa a ser identidad exacta. Fase 1 aislada, pequeña y primera, con alcance cerrado y sin higiene oportunista                   |
| R-1b | **La convención de dos raíces se comporta distinto en Next 16.2.9** de lo que sugiere la experiencia previa                                                      | Media        | Medio   | `AGENTS.md` lo advierte explícitamente. Lectura obligatoria de la documentación incluida antes de mover nada, y comprobación en local antes de fusionar. Si la convención no sirve, se cae a la variante de raíz compartida mínima —descartada pero válida— sin rehacer nada más del plan |
| R-2  | **Incoherencia de datos entre pantallas.** El defecto que arruina la retroalimentación (7.4)                                                                     | Baja tras F3 | Alto    | Las cuatro reglas estructurales del §5.4: referencias por identidad, contadores derivados, fecha única, rejilla generada. Comprobación transversal en F10                                                                                                                                 |
| R-3  | **La fase 2 se subestima** por suponer un sistema de componentes que no existe (D-7)                                                                             | Alta         | Medio   | Declarado como fase grande. Divisible en cromo y primitivas                                                                                                                                                                                                                               |
| R-4  | **Interrupción por exámenes** a mitad de una fase                                                                                                                | Alta         | Bajo    | Toda fase deja algo desplegable. Corte natural al cerrar F4                                                                                                                                                                                                                               |
| R-5  | **Divergencia con el modelo del backend**, que avanza en paralelo                                                                                                | Media        | Alto    | El catálogo de estados y el modelo de cita se comparten al cerrar F3, no al final (capítulo 13)                                                                                                                                                                                           |
| R-6  | **Inflado de alcance** por la directriz de parecerse a AgendaPro (7.10)                                                                                          | Media        | Medio   | El inventario del capítulo 6 es cerrado. Toda vista adicional es cambio de alcance, no ajuste                                                                                                                                                                                             |
| R-7  | **El despliegue falla por la incoherencia entre el compose versionado y el del VPS** (D-10)                                                                      | Media        | Medio   | Se aclara en F1 y se ejerce por primera vez en F2, sobre un armazón vacío                                                                                                                                                                                                                 |
| R-8  | **Reintroducción del paso de pago** en la reserva manual por analogía con el flujo web (7.7)                                                                     | Baja         | Medio   | Criterio de término de F5 por búsqueda de texto                                                                                                                                                                                                                                           |
| R-9  | **El cliente pospone la validación más allá de tres semanas** y el prototipo envejece sin retroalimentación                                                      | Media        | Alto    | Despliegue incremental desde F2: hay algo que mirar mucho antes del final. **Fuera del control del equipo**                                                                                                                                                                               |
| R-10 | **El plazo de AgendaPro (tres meses) vence** antes de alcanzar paridad funcional                                                                                 | Media        | Alto    | Fuera del alcance de este plan. Se registra porque el orden de fases —agenda y reserva primero— es la mejor contribución posible a mitigarlo                                                                                                                                              |
| R-11 | **Se pierden correcciones por el camino.** Son más de noventa, repartidas en catorce vistas y una tabla transversal, y se van cerrando a lo largo de siete fases | Alta         | Medio   | Cada fase declara qué códigos cierra, y **la fase 10 recorre el checklist completo como criterio de término** (§8.2). Sin ese recorrido explícito, las menores —A-8, F-6, CF-5, NF2-12, PA-2— son las primeras en caerse                                                                  |
| R-12 | **Un error llega a producción** por la política de desplegar en cada fase (DD-8)                                                                                 | Media        | Medio   | Verificación antes de fusionar, primera fusión en horario de baja visita, y **procedimiento de reversión escrito** (§9.5). El sitio público solo está expuesto en la fase 1; a partir de la 2, un fallo del panel no lo afecta                                                            |

---

## Capítulo 11 — Supuestos

Con las cuatro fuentes completas, **tres supuestos de la primera versión de este plan quedaron resueltos** y se retiran: la composición de las vistas B.2–B.14, la fecha de referencia del universo —resuelta por D.1: se calcula en tiempo de ejecución— y el alcance de dispositivos —resuelto por RF-GEN-008 y RNF-001: responsivo con prioridad de escritorio y uso en tablet, sin exigencia de móvil—.

Quedan estos:

| #       | Supuesto                                                                                                                                                 | Si resulta falso                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **S-1** | La sesión simulada es Franchesca Astudillo. **Ya no es supuesto sino decisión tomada** (D-11), pero se conserva la fila porque el cliente aún no lo sabe | Si el cliente insistiera en Valeria Araneda, hay que elegir entre su horario real y la corrección A-7. **Recomendación en ese caso: sacrificar A-7 antes que el horario**, repartiendo los siete estados entre varios días navegables y compensando con el listado de fichas y el perfil del paciente, donde la codificación de color también se ve junta. Se pierde poder juzgarla de un vistazo, que era el punto. Afecta a la semilla (F3) y a la agenda (F4) |
| **S-2** | **Las especialistas ven todas las fichas del centro**, no solo las propias. Es lo que asume el prototipo de Figma                                        | Es la **decisión pendiente N° 2 de los requerimientos, marcada bloqueante**. Si resulta que cada una ve solo las suyas, cambia el listado de fichas (#13), el perfil del paciente (#11) y la semilla. Conviene resolverla antes de F7                                                                                                                                                                                                                            |
| **S-3** | El rol Especialista es el único que se prototipa; el panel del Administrador queda fuera (requerimientos 1.2)                                            | El inventario del capítulo 6 crecería con vistas no especificadas                                                                                                                                                                                                                                                                                                                                                                                                |
| **S-4** | Los datos del panel no incluyen información real de pacientes                                                                                            | Si se pidiera cargar datos reales, la decisión de desplegar a producción sin autenticación (DD-8) **deja de ser válida** y hay que rehacer la estrategia de entrega                                                                                                                                                                                                                                                                                              |
| **S-5** | Los servicios del prototipo son exactamente dos: Masoterapia y Kinesiología, en ese orden                                                                | Los requerimientos mencionan además Kinesiología Deportiva y Entrenamiento Funcional para el sitio público, y su activación depende de la resolución sanitaria. Si entran, cambia la semilla y el paso 3. Trabajo menor                                                                                                                                                                                                                                          |
| **S-6** | Un usuario del personal puede estar asociado a un especialista, pero son entidades distintas                                                             | Si el backend los unifica, cambia el modelo de dominio de F3                                                                                                                                                                                                                                                                                                                                                                                                     |
| **S-7** | El campo convenio mantiene su definición de acuerdo con empresas y sindicatos, sin campo adicional de previsión de salud                                 | Es la **decisión pendiente N° 11**. Si se añade previsión, gana una columna el listado de pacientes y un campo el formulario de alta                                                                                                                                                                                                                                                                                                                             |
| **S-8** | El despliegue actual funciona pese a la incoherencia de nombres de servicio (D-10)                                                                       | Si el compose del VPS resulta ser el versionado y el despliegue está roto, la entrega necesita arreglar el pipeline primero — trabajo de infraestructura no contemplado. Se agrava porque el VPS **está contratado a nombre del desarrollador de frontend y su traspaso a la empresa sigue sin formalizarse** (requerimientos 13.8)                                                                                                                              |
| **S-9** | La restricción de **dos atenciones simultáneas** (13.2) no se representa en el prototipo                                                                 | Es la decisión pendiente N° 14, y depende de si responde a boxes o a personal. Si debe representarse, afecta a la agenda y al paso 1 del asistente                                                                                                                                                                                                                                                                                                               |

---

## Capítulo 12 — Qué queda deliberadamente fuera

| Qué                                                                                                   | Motivo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Integración con el backend, en cualquier forma                                                        | Restricción 2. El prototipo existe para validar flujo antes de que exista lógica                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Autenticación real, token, validación de credenciales, guardia de rutas                               | Restricción 5, y el mecanismo definitivo sigue abierto con el cliente. Un guardia dejaría gente atascada en una pantalla de acceso simulada                                                                                                                                                                                                                                                                                                                                                                                             |
| Lógica de negocio: validación de RUT, cálculo de disponibilidad, transiciones de estado, persistencia | Restricción 6. Su definición es del backend, y prototiparla induciría a validar reglas inventadas                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Reportes operativos y panel del rol Administrador                                                     | Fuera del alcance declarado (5.4)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Gestión de contenido institucional                                                                    | Vive en Sanity                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Agenda por box**                                                                                    | Decisión pendiente sin parámetros definidos: no se sabe cuántos boxes hay, cómo se identifican ni cómo se asignan (7.10). Prototiparla sería inventar el requisito                                                                                                                                                                                                                                                                                                                                                                      |
| Boxes de atención y registro de pago de cita manual                                                   | Marcados «por confirmar» (5.4). El registro de pago manual además **ya se eliminó una vez del prototipo por indicación expresa** y no se reintroduce                                                                                                                                                                                                                                                                                                                                                                                    |
| **Restricción de dos atenciones simultáneas** (RF-HOR-008)                                            | Decisión pendiente N° 14: no se sabe si responde a boxes o a personal, y eso determina cómo se modela. No se prototipa lo que no está definido                                                                                                                                                                                                                                                                                                                                                                                          |
| **Notificaciones al paciente** (RF-NOT-001 a 003)                                                     | El canal —correo, WhatsApp o ambos— no está formalizado, y WhatsApp exige infraestructura con costo aún sin evaluar. El icono de campana del encabezado declara estar fuera de alcance                                                                                                                                                                                                                                                                                                                                                  |
| **Crear una ficha desde el detalle de la cita** (RF-FIC-017)                                          | Decisión pendiente N° 12. El detalle de una cita Atendida sí ofrece **acceder** a su ficha, que es lo que fija A.6; crearla desde ahí es otra cosa y está sin resolver                                                                                                                                                                                                                                                                                                                                                                  |
| Auditoría real                                                                                        | El prototipo **muestra** la traza de la cita (M-8, RF-AUD-003) con datos de la semilla, pero no registra nada. Registrar es del backend                                                                                                                                                                                                                                                                                                                                                                                                 |
| Exportación real a PDF                                                                                | Es funcionalidad, no prototipo. La vista la declara fuera de alcance en lugar de dejar un botón inerte                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **Corrección de la deuda técnica del sitio público**                                                  | Restricción de no modificarlo. Se reporta: `ServicesSection` inalcanzable, `BookingCard` importado sin usarse, `Button` y `Card` sin consumidores, `--color-primary-glow` sin uso, `animate-fade-in` sin definición, el espacio inicial en el nombre de ` auth.service.ts`, el Dockerfile que ignora `output: 'standalone'`, la red no declarada en el compose, `apiClient` sin cabecera de autorización, y las **dos versiones contradictorias del horario** en `constants.ts` con un JSON-LD que usa la incorrecta y omite el domingo |
| Corrección del token verde y de `Button.tsx`                                                          | D-3: el panel no los importa, así que no hace falta tocarlos. Se dejan como están                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Conectar Geist correctamente                                                                          | D-2: el `body` fija Arial y anula a Geist. **Es deuda del sitio público**, no del panel. El panel hereda la fuente del `body`, sea cual sea                                                                                                                                                                                                                                                                                                                                                                                             |
| Tests automatizados                                                                                   | El proyecto no tiene ninguno y montar la infraestructura excede el alcance. La verificación es manual y está especificada fase a fase. **Es una debilidad reconocida, no un olvido**                                                                                                                                                                                                                                                                                                                                                    |
| Adaptación a móvil del panel                                                                          | S-3. La Parte A describe una estructura de escritorio                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| robots.txt                                                                                            | §4.5: no existe hoy, y enumerar `/panel` en un Disallow sería la única pista pública de su existencia                                                                                                                                                                                                                                                                                                                                                                                                                                   |

---

## Capítulo 13 — Puente hacia el backend

### 13.1 Qué queda preparado

- **La capa de dominio** (§5.2, capa 1): tipos y catálogos que sobreviven a la integración. Es vocabulario compartido, no andamiaje.
- **La capa de acceso** (capa 2): funciones **asíncronas desde el primer día**, con la forma que tendrán al consultar la API. La integración reimplementa su interior.
- **Las vistas**, construidas contra la capa 2 y nunca contra la semilla (§5.3).

### 13.2 Qué habría que cambiar

Tres cosas, y ninguna toca una vista: reimplementar la capa 2 contra los endpoints reales; borrar `_seed/` entera; alinear los tipos del dominio con el contrato del backend. **Si al llegar la integración hay que reescribir una vista, el prototipo se hizo mal** — y por eso la regla de §5.3 se verifica en cada fase, no al final.

### 13.3 Decisiones del prototipo que condicionan al backend

Estas son las que conviene poner sobre la mesa **al cerrar la fase 3**, no al final:

1. **Los siete estados son siete, no cuatro.** Y en particular **Pendiente de pago y Por confirmar deben ser dos estados distintos en el modelo del backend**, con comportamiento opuesto: uno expira solo y no admite modificación, el otro requiere acción y no expira. Si el backend los unifica en un «pendiente», la distinción es irrepresentable y se pierde el aprendizaje central del prototipo.
2. **El origen (web / manual) es un campo del modelo**, no una inferencia. Determina qué acciones se ofrecen y si la cancelación advierte del anticipo.
3. **La franja 14:00–15:00 es una ausencia, no un bloqueo.** El generador de bloques del backend no debe emitirla, y no debe representarse como franja bloqueada. Es la diferencia entre «no hay hora» y «hay hora ocupada», y el cliente la confirmó expresamente.
4. **La ficha clínica se asocia a una cita concreta.** El backend debe poder recuperar la ficha por la cita y las fichas anteriores por el paciente.
5. **Convenio es una entidad distinta de previsión de salud.** Isapre y Fonasa no son convenios.
6. **Usuario del personal y especialista son entidades distintas**, relacionadas pero no equivalentes. Los roles son `Administrador` y `Especialista`, no los `Paciente`/`Kinesiologo` del `useAuthStore` actual.
7. **Los contadores del perfil del paciente se derivan de las listas** (§5.4 regla 2). Si el backend pagina el historial, **debe entregar los contadores explícitamente**, porque el cliente ya no podrá calcularlos con una lista parcial. Es una consecuencia poco evidente de una decisión de coherencia, y conviene decirla antes de que el endpoint esté escrito.
8. **La cancelación exige motivo.** El backend necesita el campo, y **la política del anticipo de 10.000 CLP sigue abierta**: es una de las preguntas que el prototipo lleva al cliente.

### 13.4 Qué depende del backend

- El contrato definitivo de todas las entidades del dominio.
- El mecanismo de autenticación del personal, que sigue abierto (decisión pendiente N° 7).
- Las reglas de transición entre estados, que el prototipo no implementa a propósito.
- El cálculo de disponibilidad, que según RF-GEN-012 es la intersección entre horario del centro, plantilla del especialista y excepciones vigentes.
- La política de anticipo y devolución.
- La estructura definitiva de campos de la ficha, que define Valeria Araneda (decisión pendiente N° 1, bloqueante).

### 13.5 Un cambio de prioridad del backend que este plan no controla pero sí acusa

El capítulo 13.1 de los requerimientos reordena el flujo de reserva **público** —Servicio, Fecha, Horario, Especialista— para que el paciente no pueda elegir a una profesional que no atiende en el bloque que quiere. Es trabajo del Hito 2 y no toca el panel.

Pero tiene una consecuencia que sí conviene tener presente aquí: **resolver qué especialista atiende en un bloque exige que las plantillas de horario por especialista existan**, con lo que RF-HOR-001 a RF-HOR-006 pasan de ser trabajo del Hito 3 a ser **prerrequisito del Hito 2**.

Para este plan eso significa dos cosas:

1. **La vista de horarios de atención (#18) deja de ser la pieza menor que su prioridad «media» sugiere.** Es la representación en pantalla de un modelo que el backend necesita **antes** que el resto. Si el equipo de backend va a implementar plantillas de horario pronto, prototipar esa vista antes que otras de la fase 8 permite validar el modelo con las especialistas mientras todavía se puede cambiar. **Es el único punto del plan donde el orden podría alterarse por una razón externa**, y merece revisarse al llegar a la fase 8.
2. Los horarios confirmados en 13.2 —Franchesca jornada completa, Constanza 09:00–17:00, Valeria 18:00–21:00— son datos reales y **deben ser los de la semilla**, no ejemplos inventados. Es lo que hace que esa validación sirva de algo.

---

## Capítulo 14 — Preguntas abiertas

Ordenadas por lo que bloquean.

**Resueltas.** Con las cuatro fuentes completas quedaron respondidas las de la primera versión sobre el detalle de las vistas, el alcance de dispositivos, la fecha de referencia y `BookingCard` —el capítulo 13.8 de los requerimientos confirma que la derivación del agendamiento a AgendaPro es una **«redirección temporal» deliberada**, no un descuido—. Y el **28 de julio de 2026** se resolvieron las dos que estaban en cabeza:

| Resuelta                                         | Decisión                                                                                         |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| ¿Franchesca o Valeria como usuaria de la sesión? | **Franchesca Astudillo** (D-11). Falta comunicárselo al cliente                                  |
| ¿Desplegado o PDF?                               | **Desplegado** (D-12). El PDF era una idea de una etapa anterior. Falta comunicárselo al cliente |

**Abiertas**, ordenadas por lo que bloquean:

| #       | Pregunta                                                                                                                                                                     | Qué queda condicionado                                                                                                                                                                                             |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **P-1** | **¿Cada especialista ve todas las fichas del centro o solo las suyas?** Decisión pendiente N° 2 de los requerimientos, marcada **bloqueante** (S-2)                          | El listado de fichas, el perfil del paciente y la semilla. Debe resolverse antes de F7                                                                                                                             |
| **P-2** | **¿Cuántos pacientes tiene la base de prueba?** La Parte D exige que «si un listado dice 48 pacientes registrados, la paginación recorra 48», pero su elenco nombra **diez** | La semilla (F3). Recomendación: **el recuento se deriva de la semilla** —regla de contadores derivados— y se siembra lo suficiente para que la paginación tenga sentido, con los diez nombrados como protagonistas |
| **P-3** | **El horario de Constanza Maldonado se contradice**: 13.2 dice «09:00 a 17:00» y a continuación «la última atención finaliza a las 18:00»                                    | La semilla y la vista de horarios (#18). Menor, pero es un dato que se va a mostrar en pantalla                                                                                                                    |
| **P-4** | ¿Cuál es el compose que corre realmente en el VPS, y por qué el workflow opera sobre un servicio con otro nombre? (D-10)                                                     | La entrega. Se resuelve en la fase 1 consultando el VPS, no adivinando                                                                                                                                             |
| **P-5** | ¿Qué debe ocurrir con el anticipo de 10.000 CLP al cancelar una cita web? Y su corolario de la decisión pendiente N° 3: ¿puede el especialista cancelarla por sí mismo?      | El texto y las acciones del modal de la fase 4. Mientras siga abierta, el modal **advierte sin prometer**, que es lo que corresponde a un prototipo cuya función es preguntar                                      |
| **P-6** | El horario del sitio público se contradice a sí mismo y el JSON-LD publica una versión que omite el domingo (§2.12)                                                          | Nada de este plan: el panel usa la regla canónica. **Se pregunta porque es un dato público incorrecto**, y corregirlo es trabajo del sitio, no del panel                                                           |

---

_Fin del documento._
