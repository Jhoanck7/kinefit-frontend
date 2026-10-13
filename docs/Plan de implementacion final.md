# KineFit — Plan de implementación

Complemento del **Plan de cierre**. Ese documento dice qué se entrega cada día; este dice exactamente qué se toca, en qué archivo y con qué contrato.

**Ventana: sábado 22 a viernes 28 de agosto de 2026.**
Las fases siguen el mismo orden y los mismos días del plan de cierre.

---

## Cómo se usa

Al abrir cada sesión de trabajo se pega el **Plan de cierre** completo más **la fase de este documento que corresponda al día**. Nada más.

**Granularidad de aprobación: por bloque.** Cada bloque de este plan lleva un identificador. Antes de escribir código para un bloque se responde con el resumen de lo entendido, los archivos exactos a tocar y el esquema de cambios en viñetas, y se espera la palabra "Procede". Un bloque aprobado se ejecuta completo, tarea por tarea, sin volver a pedir permiso dentro del bloque.

**Al cerrar cada bloque** se entrega el código, un resumen de tres puntos y la pregunta de cierre.

**Reparto:** Maxi toma backend, panel y la página pública de firma. Jhoan toma el sitio público y la configuración de contenido.

---

## Estado verificado del código

Leído directamente del repositorio, no de documentación. Es la línea base del plan.

**Backend** — `kinefit-backend/api-dotnet`, rama `dev`, último commit `a33fee6`. 331 archivos C#, arquitectura por capas: `src/Api/Controllers`, `src/Application/{DTOs,Services,Security,Validators}`, `src/Domain/{Models,Enums}`, `src/Infrastructure/{Data,Repositories,Storage,BackgroundServices}`. Migraciones en `src/Infrastructure/Data/Migrations`, la última es `20260817110213_EliminarDuracionMinutosServicio`.

**Frontend** — `kinefit-frontend`, rama `feature/last-implementations`, último commit `dde323f`. Next con App Router. Las rutas viven en `src/app` y sólo montan vistas; la implementación está en `src/views/app/...`, con `components/` y `hooks/` por vista. El acceso al API está en `src/services/*.ts` y se consume con hooks de React Query en `src/hooks/api`.

**Lo que ya está construido y no hay que rehacer:**

* Cálculo de reparto completo en `src/Application/Services/CalculoReparto.cs`, con extracción de impuesto, comisión porcentual y mixta, y vigencias por fecha.
* Configuración financiera completa: `TerminalPago`, `ComisionTerminal` con `TipoModelo` y `CargoFijo`, `RepartoProfesional` y `TasaImpuesto`, todos con vigencia, expuestos desde `VentaController`.
* Reportes en el backend prácticamente completos contra REP-001: `ReporteController` expone `ventas`, `reservas` y `comisiones`, con distribución por hora, por día de semana y por estado, origen de reservas, evolución temporal, los tres rankings, clientes nuevos y recurrentes, comparación con período anterior, vistas día/semana/mes y exportación a CSV con separador y codificación aptos para Excel en configuración chilena.
* Correo real por Resend en `EmailService.cs`, con reintentos y traza en `NotificacionService.cs` y un servicio en segundo plano que los procesa.
* Almacenamiento de archivos clínicos en disco, con identificador opaco, en `src/Infrastructure/Storage/AlmacenamientoArchivosLocalService.cs`, y validación de tipo por contenido real en `src/Application/Validators/ValidadorTipoArchivo.cs`.
* Autorización por rol y guardas de especialista en `src/Application/Security`.

**Lo que no existe y hay que construir:**

* `Servicio` no tiene duración. Se eliminó en la migración del 17 de agosto.
* `Empresa` no tiene vigencia ni descuento.
* `TerminalPago` no tiene campo de notas.
* `LandingConfig` no tiene vouchers, ni Apple Maps, ni interruptor de reservas.
* `TipoNotificacion` sólo tiene `Confirmacion`, `Recordatorio` y `CambioEstado`.
* **Los formatos de ficha viven en `localStorage`**, en `src/lib/formatos-ficha.ts` bajo la clave `kinefit_formatos`. No hay tabla, ni endpoint, ni controlador. Existen sólo en el navegador de quien los creó.
* No existe nada del módulo de documentos del paciente.
* El impuesto sobre la comisión del terminal no se aplica en `CalculoReparto.cs`.

---

## Convenciones que el plan respeta

**Backend.** Un cambio de modelo toca, en este orden: `Domain/Models`, `Infrastructure/Data/AppDbContext.cs`, migración nueva, DTO, servicio, controlador. Las migraciones son aditivas y se revisa el orden de operaciones que genera el motor antes de aplicarlas. Toda escritura relevante pasa por auditoría.

**Frontend.** Una funcionalidad nueva toca, en este orden: `src/models/{requests,responses}`, `src/services/<x>-service.ts`, `src/hooks/api/use-<x>-service.ts`, la vista en `src/views/app/...` con sus `components/` y `hooks/`, y por último la ruta en `src/app`. Nada de llamadas al API desde componentes.

**Diseño.** Rige la especificación visual ya fijada: tipografía Satoshi, fondo blanco con grises azulados muy tenues, barra lateral azul marino, acento azul cobalto, bordes de un píxel en vez de sombras, radios bajos, y estados como punto más texto en lugar de píldoras.

---

# Fase 1 · Sábado 22 — Sitio público

Responsable principal: Jhoan, salvo los bloques marcados como backend.
Origen: ADM-001, AGE-001, WEB-001.

## F1-A · Interruptor de reservas y destino alterno

Es lo que habilita el hito del lunes, así que va primero.

**Backend**

`src/Domain/Models/LandingConfig.cs` — agregar:

```csharp
public bool ReservasHabilitadas { get; set; } = true;
public string? ReservasUrlAlterna { get; set; }
public string? ReservasCtaTextoAlterno { get; set; }
```

`src/Application/DTOs/LandingConfigDTO.cs` — los tres campos, nulos para que el `PATCH` existente siga funcionando por campo.

Migración `AddReservasToggleToLandingConfig`. `ReservasHabilitadas` no admite nulos y se crea con valor verdadero, para que el sitio no quede sin reservas al aplicar la migración.

No hace falta tocar `ConfiguracionController.cs`: ya expone `GET/PUT/PATCH landing` y el `PATCH` es por campo.

**Frontend**

* `src/models/responses/landing.ts` y `src/views/app/panel/configuracion/landing/landing-config-schema.ts` — incorporar los tres campos al esquema de validación.
* `src/views/app/panel/configuracion/landing/index.tsx` — bloque nuevo "Reservas en línea" con un interruptor y, cuando queda apagado, dos campos de texto para la dirección alterna y el texto del botón.
* `src/views/app/(public)/home/components/booking-card.tsx` — si `reservasHabilitadas` es falso, no renderiza el formulario.
* `src/views/app/(public)/home/components/hero-section.tsx` — el botón principal usa `heroCtaText` y dispara el flujo interno cuando las reservas están activas, o abre `reservasUrlAlterna` en pestaña nueva cuando están apagadas.

**Criterio de aceptación.** Con el interruptor apagado el sitio no muestra el formulario y el botón principal lleva al destino configurado. Con el interruptor encendido todo vuelve a operar sin redesplegar.

## F1-B · Sección de vouchers de regalo

**Backend**

`LandingConfig.cs`:

```csharp
public string? VouchersTitle { get; set; }
public string? VouchersSubtitle { get; set; }
public string? VouchersJson { get; set; }
```

`VouchersJson` sigue el mismo patrón que `GalleryJson`: arreglo de objetos con dirección de imagen y texto alternativo. Migración `AddVouchersToLandingConfig`.

**Frontend**

* `src/views/app/(public)/home/components/vouchers-section.tsx` — componente nuevo, con la misma estructura que `gallery-section.tsx` para no inventar un patrón distinto. Dos o tres fotografías, título y subtítulo.
* `src/views/app/(public)/home/components/index.ts` — exportarlo.
* La página de inicio — insertarlo **después de la galería de instalaciones y antes de la sección de ubicación**, que es la posición que pidió el cliente.
* `configuracion/landing/index.tsx` — bloque de administración reutilizando el mismo control de carga de imágenes de la galería, que ya sube a través del servicio de medios.

**Criterio de aceptación.** El administrador carga título, subtítulo y fotos, y la sección aparece en el sitio en la posición correcta, sin deformar las imágenes.

## F1-C · Apple Maps y etiqueta de opiniones

**Backend**

`LandingConfig.cs`:

```csharp
public string? LocationAppleMapsUrl { get; set; }
```

Migración `AddAppleMapsUrlToLandingConfig`. `GoogleReviewsUrl` ya existe y se conserva.

**Frontend**

* `src/views/app/(public)/home/components/location-section.tsx` — segundo botón junto al de Google Maps, con idéntico tratamiento visual y sólo distinto rótulo. Si la dirección no está configurada, el botón no se renderiza.
* Cambiar el subtítulo por defecto de la sección de opiniones. Hoy `TestimonialsSubtitle` dice *"Testimonios verificados en Google Maps de personas que han recuperado su salud y rendimiento"*. Pasa a hablar de opiniones de Google, según pidió el cliente. Se cambia el valor por defecto en `LandingConfig.cs` y, además, el valor ya guardado en la base del entorno de pruebas, porque el defecto sólo aplica a filas nuevas.

## F1-D · Defectos visibles de la demo

* **Tarjetas del equipo comprimidas.** `src/views/app/(public)/home/components/team-section.tsx` — fijar relación de aspecto en el contenedor de la imagen y usar recorte que preserve la proporción, en lugar de estirar. Verificar en escritorio, tablet y móvil.
* **Video de Instagram.** Los tres últimos commits del repositorio ya atacan este problema. Verificar que la dirección guardada en el entorno de pruebas tenga el formato que la expresión regular acepta y, si no, ampliarla en vez de pedirle al cliente que escriba la dirección de una forma concreta.
* **Reseñas de Google.** `GooglePlaceId` y `GoogleApiKey` viven en `LandingConfig`. Reponer la credencial en el entorno de pruebas y verificar el endpoint `POST /api/configuracion/sincronizar-google-reviews`. Si la credencial venció, se genera una nueva y se restringe por dirección de origen antes de cargarla.
* **Fotografías de las profesionales** que envió el cliente, cargadas desde la sección de especialistas.

## F1-E · Calidad técnica del sitio

Origen: WEB-001. Se hace ahora porque el lunes esto sale a producción.

* Título y descripción propios por página, mediante los metadatos de cada ruta.
* Atributo de idioma en el diseño raíz.
* Página de error propia en `src/app/not-found.tsx`, coherente con la identidad visual y con retorno a la portada.
* Dirección canónica, imagen para compartir e ícono de pestaña en los metadatos raíz.
* `robots.txt` y `sitemap.xml` mediante los archivos convencionales del framework, sin bloquear el contenido público.
* Datos estructurados de negocio local, con dirección, horario y teléfono tomados de `LandingConfig`.
* Texto alternativo en todas las imágenes, tomando los campos `...Alt` que ya existen.
* Un único encabezado principal por página.
* Verificar que la compilación de producción no publique mapas de código.

**Criterio de aceptación.** La auditoría del domingo no arroja hallazgos bloqueantes ni críticos sobre estos puntos.

---

# Fase 2 · Domingo 23 — Infraestructura e integración

Responsable: Maxi en el servidor, Claude en la auditoría.
Origen: SEG-001, WEB-001.

## F2-A · Respaldo de la base de datos

Se hace antes de cualquier despliegue a producción. Es la deuda más antigua del proyecto y ya costó una base completa.

* Script de volcado del contenedor de Postgres, comprimido y con marca de tiempo en el nombre.
* Tarea programada diaria en el servidor.
* Retención definida, con borrado de los volcados más antiguos.
* Copia fuera del propio servidor. Un respaldo que vive en el mismo disco que la base no protege del escenario que ya ocurrió.
* **Restauración verificada**: levantar un contenedor limpio, restaurar el último volcado y comprobar que las tablas principales traen datos. Un respaldo sin restauración probada no cuenta como respaldo.

## F2-B · Firewall de Hetzner

En el panel de Hetzner no hay ninguno configurado. El cortafuegos del sistema operativo ya limita a los puertos 22, 80 y 443, pero opera dentro de la máquina.

* Regla de entrada permitiendo sólo 22, 80 y 443.
* Verificar desde fuera que el puerto de Postgres y el puerto interno del backend no responden.

## F2-C · Guion de sembrado y reseteo

Insumo del plan de pruebas, se prepara ahora para tenerlo listo el jueves.

* `seed_pruebas.sql` con el conjunto determinista descrito en la hoja "Datos de prueba" del plan de pruebas.
* `reset_pruebas.sh` que restaura desde un volcado limpio y vuelve a aplicar el sembrado.

## F2-D · Integración del sitio y verificación del despliegue

* Integrar la rama del sitio público al entorno de pruebas.
* Verificar que el flujo automático de despliegue completa las tres etapas y que el contenedor que queda corriendo es el de la última construcción.
* Recordatorio: la dirección del API se incrusta en la construcción del frontend, así que un cambio de esa variable exige reconstruir la imagen, no basta con reiniciar el contenedor.

## F2-E · Auditoría técnica del sitio

La ejecuta Claude sobre el entorno de pruebas y entrega los hallazgos clasificados por severidad. Cubre los quince puntos de WEB-001, más cabeceras de seguridad, errores de consola, peso de los recursos entregados al navegador y ausencia de mapas de código en producción.

**Entregable:** informe con los hallazgos priorizados, para corregir el lunes por la mañana.

---

# Fase 3 · Lunes 24 — Producción del sitio y bloque de ventas

## F3-A · Corrección de hallazgos y salida a producción

* Corregir los hallazgos bloqueantes y críticos de la auditoría.
* Desplegar el sitio público a producción, con el interruptor de reservas **apagado** y el botón principal apuntando al canal vigente del cliente.
* Verificación en producción: portada, secciones, reseñas, video, ambos mapas, formularios de contacto y comportamiento en móvil.

## F3-B · Notas del terminal y días hábiles

Origen: VEN-001. Responsable: Maxi.

**Backend**

`src/Domain/Models/TerminalPago.cs`:

```csharp
public string? Notas { get; set; }
```

`src/Application/DTOs/VentaDTO/VentaDTOs.cs` — agregar `Notas` a `CreateTerminalPagoDTO` y al DTO de respuesta del terminal. Migración `AddNotasToTerminalPago`.

**Frontend**

* `src/views/app/panel/ventas/components/configuracion-financiera-modal.tsx` — área de texto para las notas, y la etiqueta del plazo de abono pasa a decir **días hábiles**.
* `src/views/app/panel/ventas/components/venta-detalle-modal.tsx` — mostrar las notas del terminal utilizado.

**Criterio de aceptación.** El cliente registra por qué modelo de comisión optó y lo vuelve a leer meses después desde el detalle de cualquier venta hecha con ese terminal.

## F3-C · Margen de la empresa

Origen: VEN-001, REP-002. Cambio de nomenclatura, sin cambio de cálculo.

`CalculoReparto.cs` ya usa `MontoCentro`, que es correcto. Lo que se ajusta es lo que ve el usuario: en `venta-detalle-modal.tsx`, en la tabla de `src/views/app/panel/ventas/index.tsx` y en `reporte-comisiones-view.tsx`, toda etiqueta que hoy diga clínica pasa a decir **margen de la empresa**.

## F3-D · Impuesto sobre la comisión del terminal

Origen: VEN-001. Es cambio de fórmula, así que va con verificación aritmética explícita.

**Backend**

`src/Domain/Models/ComisionTerminal.cs`:

```csharp
public bool ImpuestoIncluidoEnTasa { get; set; } = true;
```

Verdadero significa que la tasa cargada ya viene con impuesto, como la publican los terminales, y el cálculo no le suma nada. Falso significa que la tasa es neta y el cálculo debe aplicarle la tasa de impuesto vigente.

`src/Application/Services/CalculoReparto.cs` — `Calcular` recibe un parámetro más y, cuando corresponde, la comisión pasa a ser:

```
comisionBase = round(montoTotal × porcentaje / 100) + (cargoFijo ?? 0)
comision     = impuestoIncluidoEnTasa
               ? comisionBase
               : comisionBase + round(comisionBase × tasaIva / 100)
```

`DesgloseCobro` gana `ImpuestoComisionTerminal`, para que el desglose muestre por separado la comisión y su impuesto. El mismo campo se agrega a `DesgloseCobroDTO`.

Migración `AddImpuestoIncluidoEnTasaComision`, con valor verdadero por defecto para no alterar ninguna venta ya registrada.

**Frontend**

* `configuracion-financiera-modal.tsx` — casilla por comisión que indique si la tasa ya incluye impuesto, con la aclaración de qué significa cada opción.
* `venta-detalle-modal.tsx` — línea propia para el impuesto de la comisión dentro del desglose.

**Verificación obligatoria antes de dar el bloque por cerrado.** Con una venta de 100.000, impuesto de 19% y reparto de 50%, el desglose debe cuadrar a mano: neto igual a 84.034, impuesto igual a 15.966, y el reparto aplicado sobre el neto menos la comisión. Si no cuadra al peso, el bloque no se cierra.

## F3-E · Desglose paso a paso en el detalle de la venta

Origen: VEN-001, REP-002. Pedido de Maxi para dar confianza en el cálculo.

`venta-detalle-modal.tsx` — el desglose se presenta como una secuencia legible, en este orden:

1. Monto bruto cobrado
2. Descuento por convenio, cuando aplique
3. Impuesto de la venta y monto neto resultante
4. Comisión del terminal, con su impuesto si corresponde
5. Base de reparto
6. Pago al profesional y margen de la empresa

Cada línea indica la tasa o el porcentaje aplicado, que ya viajan en `DesgloseCobroDTO`. Sin fórmulas escritas en pantalla: cifras encadenadas que el usuario puede seguir.

---

# Fase 4 · Martes 25 — Convenios, duración y modelo de documentos

## F4-A · Vigencia del convenio

Origen: CON-001. Responsable: Maxi.

**Backend**

`src/Domain/Models/Empresa.cs`:

```csharp
public DateOnly? VigenteDesde { get; set; }
public DateOnly? VigenteHasta { get; set; }
```

`src/Application/DTOs/EmpresaDTO/EmpresaDTOs.cs` — los dos campos en `EmpresaResponseDTO`, `CreateEmpresaDTO` y `UpdateEmpresaDTO`. Migración `AddVigenciaToEmpresa`.

`src/Application/Services/Implements/EmpresaService.cs` — método interno que resuelve si un convenio está vigente a una fecha dada. Es el que consumirá el cálculo del descuento.

**Frontend**

* `src/views/app/panel/configuracion/empresas/components/empresa-modal.tsx` — dos selectores de fecha.
* La tabla de convenios — **columna de vigencia visible en el listado**, sin abrir el detalle. Un convenio fuera de vigencia se distingue con punto y texto, no con píldora.

## F4-B · Descuento por convenio y por servicio

Origen: CON-001, VEN-001. Es el bloque de negocio más delicado de la semana.

**Backend**

Modelo nuevo `src/Domain/Models/ConvenioDescuento.cs`:

```csharp
public int Id { get; set; }
public int EmpresaId { get; set; }
public Empresa Empresa { get; set; } = null!;
public int ServicioId { get; set; }
public Servicio Servicio { get; set; } = null!;
public decimal Porcentaje { get; set; }
public bool Activo { get; set; } = true;
```

`AppDbContext.cs` — conjunto nuevo e índice único compuesto sobre empresa y servicio: un convenio define un único descuento por servicio. Migración `AddConvenioDescuento`.

`Empresa.cs` y `Servicio.cs` — colección de navegación en cada uno.

DTOs en `EmpresaDTOs.cs`: `ConvenioDescuentoDTO` con servicio, porcentaje y estado, incorporado a la respuesta y a la actualización del convenio, de modo que se administre desde el mismo formulario.

`VentaService.cs` — al crear una venta, si el paciente tiene convenio y ese convenio está vigente a la fecha de la venta, se resuelve el descuento por cada ítem de tipo servicio y se aplica.

`Venta.cs` gana:

```csharp
public int? EmpresaId { get; set; }
public int DescuentoConvenio { get; set; }
```

Se copia el convenio a la venta en vez de leerlo del paciente al consultar, porque el convenio del paciente puede cambiar y una venta pasada no debe recalcularse. Migración `AddDescuentoConvenioToVenta`.

**Orden de aplicación.** El descuento de convenio se aplica **primero**, sobre el monto bruto, y el resultado es el que entra al cálculo de impuesto y comisión. Queda como primer descuento de la fila, tal como pidió Maxi, sujeto a la confirmación del cliente sobre el orden definitivo. Por eso se implementa como un paso identificable dentro del cálculo y no fundido en el monto, de modo que cambiar su posición después sea mover una línea.

`CalculoReparto.Calcular` recibe el descuento y `DesgloseCobro` gana `DescuentoConvenio` y `PorcentajeDescuentoAplicado`.

**Frontend**

* `empresa-modal.tsx` — tabla de servicios del catálogo con una casilla de habilitación y un campo de porcentaje por cada uno.
* `nueva-venta-modal.tsx` — al seleccionar paciente y servicio, mostrar el descuento que se aplicará antes de confirmar.
* `src/views/app/panel/ventas/index.tsx` — **columna de descuento en la tabla de ventas, como primer descuento de la fila**, antes de impuesto y comisión.

**Criterio de aceptación.** Un paciente con convenio vigente y descuento en masoterapia recibe el descuento automáticamente al registrar una venta de masoterapia, y no lo recibe en kinesiología. Un convenio vencido no descuenta. Las ventas anteriores conservan lo que se les aplicó.

## F4-C · Duración configurable de servicios

Origen: AGE-001, ADM-001.

**Backend**

Modelo nuevo `src/Domain/Models/ConfiguracionSistema.cs`, con `Clave`, `Valor`, `Descripcion`, `UpdatedAt` y usuario que modificó. Clave inicial `duracion_servicios_activa`. Migración `AddConfiguracionSistema`.

Servicio e interfaz `IConfiguracionSistemaService` con lectura por clave y actualización, expuestos desde `ConfiguracionController.cs` en `GET /api/configuracion/sistema` y `PATCH /api/configuracion/sistema`.

`src/Domain/Models/Servicio.cs`:

```csharp
public int? DuracionMinutos { get; set; }
```

Migración `RestituirDuracionMinutosServicio`. **Cuidado**: existe una migración previa que eliminó esta columna y otra que corrigió operaciones duplicadas en ella. Revisar el orden de operaciones antes de aplicar.

Validación en `ServicioService.cs`: los valores admitidos son 30, 60 y 90. Con el interruptor global activo, un servicio sin duración no puede quedar activo.

`DisponibilidadService.cs` y `CitaService.cs` — cuando el interruptor está activo, la cantidad de bloques consecutivos exigida se deriva de la duración del servicio y no de lo que envíe el cliente. `CadenaBloques.cs` ya resuelve la consecutividad; lo que se agrega es la exigencia.

**Frontend**

* `configuracion/servicios/components/servicio-modal.tsx` — selector de duración con las tres opciones, visible sólo con el interruptor activo.
* La vista de configuración de servicios — interruptor global arriba, con explicación de qué implica apagarlo.
* Flujo público y asistente manual — al elegir horario, mensaje con la duración del servicio y la cantidad de bloques exigida, y bloqueo de la confirmación mientras no se cumpla.

## F4-D · Persistencia de los formatos de ficha

Origen: FIC-003. **Bloqueante**: hoy los formatos viven en `localStorage`, existen sólo en el navegador que los creó, y el cliente ya los dio por funcionales.

**Backend, todo nuevo**

`src/Domain/Models/FormatoFicha.cs`:

```csharp
public int Id { get; set; }
public string Nombre { get; set; } = null!;
public TipoDocumentoClinico Tipo { get; set; }
public OrigenFormato Origen { get; set; }
public string? Cuerpo { get; set; }
public string? ArchivoRutaInterna { get; set; }
public int Version { get; set; } = 1;
public bool RequiereFirmaPaciente { get; set; }
public bool RequiereFirmaProfesional { get; set; }
public bool Activo { get; set; } = true;
public DateTime CreatedAt { get; set; }
public DateTime UpdatedAt { get; set; }
public ICollection<FormatoSeccion> Secciones { get; set; } = new List<FormatoSeccion>();
```

`FormatoSeccion.cs` con formato, nombre y orden. `FormatoCampo.cs` con sección, nombre, tipo de dato, obligatoriedad, opciones, orden y **quién completa**, paciente o profesional.

Enums nuevos en `src/Domain/Enums`: `OrigenFormato` con `Constructor` y `Documento`; `TipoCampoFormato` con texto corto, texto largo, numérico, fecha, selección y **texto informativo**, este último de sólo lectura, necesario para el articulado de los consentimientos; `CompletadoPor` con paciente y profesional.

`TipoDocumentoClinico` ya existe: verificar que contemple ficha clínica, consentimiento y recomendación, y ampliarlo si falta alguno.

`FichaClinica.cs` — agregar `FormatoFichaId` nulo, para registrar con qué formato se completó.

Migración `AddFormatosFicha`.

Servicio `FormatoFichaService` y controlador `FormatoFichaController`:

| Método | Ruta | Uso |
|---|---|---|
| GET | `/api/formatos` | Listado con nombre, tipo, cantidad de secciones y campos, versión y si tiene documentos asociados |
| GET | `/api/formatos/{id}` | Formato con secciones y campos |
| POST | `/api/formatos` | Alta |
| PUT | `/api/formatos/{id}` | Genera **versión nueva**, nunca edita en sitio |
| PATCH | `/api/formatos/{id}/estado` | Activar y desactivar |
| POST | `/api/formatos/importar` | Carga de documento externo |

Reglas: un formato con documentos asociados no se elimina, se desactiva. Modificar un formato en uso responde primero cuántos documentos se verían afectados. Toda mutación queda en auditoría.

**Importación desde documento.** `POST /api/formatos/importar` recibe el archivo, valida su tipo por contenido real con `ValidadorTipoArchivo.cs`, lo convierte a un documento de presentación fija conservando el formato original, guarda el binario con `AlmacenamientoArchivosLocalService` y deja la ruta opaca en `ArchivoRutaInterna`. La conversión requiere una herramienta de conversión en la imagen del backend: se agrega al `Dockerfile` de `api-dotnet`, y se verifica el peso resultante de la imagen antes de integrar.

**Frontend, migración desde `localStorage`**

* `src/services/formato-service.ts` — nuevo, contra los endpoints de arriba.
* `src/hooks/api/use-formato-service.ts` — reescribir para consumir el servicio en lugar de `localStorage`.
* `src/lib/formatos-ficha.ts` — **se elimina**. Antes, una rutina de migración única: si hay formatos en `localStorage`, se suben al backend y se limpia la clave. Sin eso, lo que Maxi creó en la demo se pierde.
* `formatos/nuevo/hooks/use-constructor-formato.ts` — agregar tipo de campo informativo, atributo de quién completa y declaración de recuadros de firma.
* La vista de formatos — mostrar versión y cantidad de documentos asociados, y advertir antes de modificar un formato en uso.

**Criterio de aceptación.** Un formato creado en el panel sobrevive a recargar la página, a cerrar sesión, a abrirlo desde otro navegador y a un redespliegue.

---

# Fase 5 · Miércoles 26 — Documentos del paciente y reportes

## F5-A · Modelo de documentos del paciente

Origen: DOC-001. Responsable: Maxi, backend y página pública.

**Modelo `src/Domain/Models/ServicioDocumento.cs`**

```csharp
public int Id { get; set; }
public int ServicioId { get; set; }
public int FormatoFichaId { get; set; }
public bool Obligatorio { get; set; } = true;
public MomentoDocumento Momento { get; set; }
public DateTime CreatedAt { get; set; }
```

`MomentoDocumento`: `TrasConfirmarReserva` y `AlFinalizarAtencion`.

**Modelo `src/Domain/Models/DocumentoPaciente.cs`**

```csharp
public int Id { get; set; }
public int CitaId { get; set; }
public int PacienteId { get; set; }
public int FormatoFichaId { get; set; }      // versión exacta usada
public string? Contenido { get; set; }        // jsonb, campos del paciente
public string CuerpoCongelado { get; set; } = null!;
public string HuellaDocumento { get; set; } = null!;
public OrigenDocumento Origen { get; set; }
public string? FirmaPacienteRuta { get; set; }
public DateTime? FirmadoPacienteEn { get; set; }
public int? FirmaUsuarioId { get; set; }
public DateTime? FirmadoProfesionalEn { get; set; }
public string? ArchivoEscaneadoRuta { get; set; }
public string? TokenAcceso { get; set; }
public DateTime? TokenExpiraEn { get; set; }
public DateTime? TokenUsadoEn { get; set; }
public EstadoDocumento Estado { get; set; }
public string? IpOrigen { get; set; }
public DateTime CreatedAt { get; set; }
public DateTime UpdatedAt { get; set; }
```

`OrigenDocumento`: `FirmadoEnLinea` y `CargadoEnPapel`. `EstadoDocumento`: `Pendiente` y `Completado`.

Índice único parcial sobre `TokenAcceso` cuando no es nulo. El token se genera con un generador criptográficamente seguro, de al menos 32 bytes, en representación apta para direcciones web.

Migración `AddDocumentosPaciente`.

**Regla que no se puede omitir.** `CuerpoCongelado` guarda el texto exacto que se mostró al firmante y `HuellaDocumento` su resumen criptográfico. Sin esto, publicar una versión nueva de un formato deja todas las firmas anteriores apuntando a un documento que nadie firmó.

**Almacenamiento.** Trazos de firma, documentos generados y escaneos van al **disco del servidor**, reutilizando `AlmacenamientoArchivosLocalService`, igual que los adjuntos clínicos. No van al servicio externo de imágenes: son datos de salud.

## F5-B · Endpoints de documentos

Controlador nuevo `src/Api/Controllers/DocumentoPacienteController.cs`.

| Método | Ruta | Autorización | Uso |
|---|---|---|---|
| GET | `/api/documentos/publico/{token}` | Anónimo | Devuelve el documento a firmar y sus campos |
| POST | `/api/documentos/publico/{token}/firmar` | Anónimo | Recibe campos del paciente y trazo de firma |
| GET | `/api/documentos/cita/{citaId}` | Sólo personal | Estado de la documentación de una cita |
| POST | `/api/documentos/{id}/firma-profesional` | Sólo personal | Estampa la firma del profesional |
| POST | `/api/documentos/{id}/escaneo` | Sólo personal | Carga del documento firmado en papel |
| GET | `/api/documentos/{id}/archivo` | Sólo personal | Descarga del documento resultante |
| GET | `/api/documentos/pendientes` | Sólo personal | Conteo y listado de pendientes de carga |

Reglas de negocio en `DocumentoPacienteService`:

* El token es de un solo uso: al firmar se sella `TokenUsadoEn` y deja de servir.
* El token expira al llegar la hora de la cita o al cargarse el escaneo, lo que ocurra primero.
* La firma del profesional sólo se acepta si el paciente ya firmó.
* Un documento con origen escaneo no admite firma digital del profesional.
* Un documento firmado en línea no admite carga de escaneo, y a la inversa.
* La entrega pública nunca incluye datos clínicos ajenos al documento, ni el identificador interno de la cita o del paciente.
* Límite de intentos sobre los endpoints públicos, por dirección de origen.
* Creación, firma, carga y consulta quedan en auditoría con identidad individual.

## F5-C · Página pública de firma

Responsable: Maxi.

* `src/app/(public)/documentos/[token]/page.tsx` — ruta nueva.
* `src/views/app/(public)/documentos/` — vista con sus componentes: presentación del documento con desplazamiento, campos del paciente cuando el formato los declara, y recuadro de captura de firma que funcione **con el dedo en móvil**, que es donde la mayoría lo va a abrir.
* Sin opción de descarga ni de exportación para el paciente. El cliente lo pidió expresamente por derecho de autor sobre sus formatos. Conviene decirle que se puede quitar el botón y desalentar la copia, pero que una captura de pantalla siempre será posible.
* Al confirmar el pago, la pantalla de retorno de la pasarela ofrece firmar en el momento, reutilizando la misma vista con la sesión iniciada en lugar del token.
* `src/services/documento-service.ts` y `src/hooks/api/use-documento-service.ts`.

## F5-D · Documentos en el panel

* `src/views/app/panel/agenda/components/` — en el detalle de la cita, pestaña de documentos con su estado, acceso al documento firmado, acción de estampar la firma del profesional y acción de cargar el escaneo.
* **Tablero de hitos** en el detalle de la cita, con los cuatro estados que pidió el cliente: anticipo pagado, pago total registrado, documentos firmados y recomendaciones enviadas. Cada uno con su acción disponible. El hito de pago total se marca cuando existe una venta asociada a esa cita. El de recomendaciones permite reenviarlas si no salieron.
* **Conteo de documentos pendientes** visible en el armazón del panel, porque la carga de escaneos ocurre al final de la jornada y sin recordatorio no ocurre.
* Registro de firma del profesional en su perfil: `UsuarioPersonal.cs` gana `FirmaRutaInterna`, con su migración, y la vista de perfil incorpora la captura. Se dibuja una sola vez y el sistema la estampa en cada documento.
* `configuracion/servicios/components/servicio-modal.tsx` — asignación de documentos exigidos por servicio, con obligatoriedad y momento, y acceso directo para crear un formato si no existe.

## F5-E · Correos de documentos

Origen: NOT-001, DOC-001.

* `src/Domain/Enums/TipoNotificacion.cs` — agregar `DocumentoParaFirma` y `DocumentoPostAtencion`.
* `NotificacionService.cs` — plantillas de ambos, siguiendo el patrón del método que ya resuelve asunto y cuerpo por tipo.
* Disparadores: al confirmarse el pago en `TransaccionService.cs`, y al crearse una cita manual en `CitaService.cs`, porque ahí no media anticipo. Al pasar la cita a atendida, el envío del documento posterior.
* El correo lleva **un enlace**, nunca el documento como archivo adjunto.

## F5-F · Reportes

Origen: REP-001, REP-002. **Auditar antes de construir.**

El backend está prácticamente completo: `ReporteController` ya entrega indicadores, distribución por hora, por día de semana y por estado, origen de reservas, evolución temporal, los tres rankings, clientes nuevos y recurrentes, comparación con el período anterior, vistas día, semana y mes, y exportación con separador y codificación aptos para Excel chileno.

Lo que detecté que falta, a confirmar en la auditoría:

* **Pagos parciales y ventas eliminadas** en los contadores de resumen. `ReporteVentasDTO` sólo trae total de ventas y monto del período.
* **Filtro por estado** en el reporte de ventas. El controlador acepta fechas, cliente y método de pago.
* Exportación en el reporte de reservas y en el de comisiones. Hoy sólo el de ventas la ofrece.
* Reflejar el descuento por convenio en el reporte de ventas, ahora que existe.

**Frontend.** Las tres vistas existen, con mil cuarenta líneas entre ellas. Primer paso: recorrerlas contra las once validaciones de REP-001 y anotar qué indicador no se está mostrando. Recién con esa lista se decide qué construir. Para lo que haya que rehacer visualmente, explorar el diseño primero y validarlo antes de escribir el componente.

---

# Fase 6 · Jueves 27 — Integración, secretos y ejecución del plan

## F6-A · Integración

* Integrar todas las ramas al entorno de pruebas, backend primero y frontend después, según la regla del plan de cierre.
* Verificar que las migraciones se aplican al arrancar. Recordatorio: `Program.cs` llama a `DataSeeder.Initialize`, que ejecuta la migración al inicio. Una migración inválida no falla en silencio: tumba el contenedor en bucle de reinicio.
* Verificar que la imagen del backend, ahora con la herramienta de conversión de documentos, arranca con normalidad y no creció más de lo aceptable.

## F6-B · Sembrado

Ejecutar `seed_pruebas.sql` sobre el entorno de pruebas y verificar que quedan cargados los treinta y un registros de la hoja "Datos de prueba" del plan de pruebas.

## F6-C · Rotación de secretos

**El orden importa y no se puede alterar.** La contraseña de administrador está fijada en `src/Infrastructure/Data/DataSeeder.cs`, y el sembrador corre en cada arranque: cambiarla sólo en la base no sirve, porque el próximo despliegue la revierte.

1. **Modificar `DataSeeder.cs`**: que cree la cuenta de administrador sólo si no existe, con contraseña aleatoria y `DebeCambiarPassword` en verdadero. Ninguna contraseña queda escrita en el código.
2. Desplegar ese cambio.
3. **Recién entonces**, cambiar la contraseña real en producción.
4. **Verificar con un redespliegue** que la rotación no se revierte y que la contraseña anterior ya no funciona.
5. Rotar el resto de los secretos que viven en `/etc/kinefit/appsettings.json`: pasarela de pago, servicio de imágenes, firma de sesiones, servicio de correo y credencial del servicio de mapas.
6. Rotar la clave de sesión del panel. Esto cierra todas las sesiones activas: es esperable, no es un error.
7. Dar por comprometidos todos los secretos anteriores. Siguen en el historial del repositorio.

**Nota.** La contraseña del entorno de pruebas que circuló por chat entra en esta rotación.

## F6-D · Ejecución del plan de pruebas

* Maxi y Jhoan ejecutan las pruebas funcionales según el responsable de cada fila.
* Claude ejecuta en paralelo las técnicas: concurrencia y doble reserva, carga sostenida sobre disponibilidad, autorización cruzada, enumeración de identificadores, fuerza bruta sobre el enlace de firma, validación de archivos por contenido, cabeceras de seguridad, límites de tasa y auditoría del sitio.
* Todo caso fallido genera una fila en la hoja de hallazgos con su severidad.

## F6-E · Documentación de entrega

En paralelo a la ejecución: manual de usuario orientado al cliente y a las especialistas, y manual del sistema orientado a quien opere la infraestructura.

---

# Fase 7 · Viernes 28 — Cierre y producción

## F7-A · Corrección y reejecución

* Corregir todos los hallazgos bloqueantes y críticos.
* **Reejecutar cada caso fallido.** Ningún caso se marca aprobado sin volver a ejecutarse.
* Verificar que la hoja de resumen del plan declara el estado aprobado. Esa celda es el criterio, no la impresión de que todo funciona.

## F7-B · Producción

* Desplegar backend y panel a producción.
* Mantener el interruptor de reservas **apagado**, según lo acordado con el cliente, que sigue con su plataforma actual durante la marcha blanca.
* Verificar en producción: acceso al panel, agenda, registro de venta con desglose correcto, creación de ficha, carga de documento y envío de correo.
* Confirmar que el respaldo automático está corriendo sobre la base de producción, no sólo sobre la de pruebas.

## F7-C · Entrega

Manuales, videos de uso y credenciales. Con la pasarela de pago pendiente si el cliente aún no entregó las credenciales productivas: eso no bloquea la salida, porque las reservas están apagadas.

---

# Anexo A · Migraciones nuevas, en orden

| # | Migración | Fase |
|---|---|---|
| 1 | `AddReservasToggleToLandingConfig` | F1-A |
| 2 | `AddVouchersToLandingConfig` | F1-B |
| 3 | `AddAppleMapsUrlToLandingConfig` | F1-C |
| 4 | `AddNotasToTerminalPago` | F3-B |
| 5 | `AddImpuestoIncluidoEnTasaComision` | F3-D |
| 6 | `AddVigenciaToEmpresa` | F4-A |
| 7 | `AddConvenioDescuento` | F4-B |
| 8 | `AddDescuentoConvenioToVenta` | F4-B |
| 9 | `AddConfiguracionSistema` | F4-C |
| 10 | `RestituirDuracionMinutosServicio` | F4-C |
| 11 | `AddFormatosFicha` | F4-D |
| 12 | `AddDocumentosPaciente` | F5-A |
| 13 | `AddServicioDocumento` | F5-A |
| 14 | `AddFirmaToUsuarioPersonal` | F5-D |

Todas aditivas. Antes de aplicar cada una se revisa el orden de operaciones que genera el motor, porque tiende a colocar la eliminación de índices antes de crear las columnas de las que dependen. La número 10 merece atención especial: hay dos migraciones previas sobre esa misma columna, una que la eliminó y otra que corrigió operaciones duplicadas en ella.

# Anexo B · Endpoints nuevos

| Método | Ruta | Fase |
|---|---|---|
| GET / PATCH | `/api/configuracion/sistema` | F4-C |
| GET | `/api/formatos` | F4-D |
| GET | `/api/formatos/{id}` | F4-D |
| POST | `/api/formatos` | F4-D |
| PUT | `/api/formatos/{id}` | F4-D |
| PATCH | `/api/formatos/{id}/estado` | F4-D |
| POST | `/api/formatos/importar` | F4-D |
| GET | `/api/documentos/publico/{token}` | F5-B |
| POST | `/api/documentos/publico/{token}/firmar` | F5-B |
| GET | `/api/documentos/cita/{citaId}` | F5-B |
| POST | `/api/documentos/{id}/firma-profesional` | F5-B |
| POST | `/api/documentos/{id}/escaneo` | F5-B |
| GET | `/api/documentos/{id}/archivo` | F5-B |
| GET | `/api/documentos/pendientes` | F5-B |

# Anexo C · Riesgos de este plan

**El martes y el miércoles concentran el ochenta por ciento del trabajo nuevo.** Persistencia de formatos, descuento por convenio, duración de servicios y todo el módulo de documentos caen en dos días. Si algo se atrasa, se atrasa ahí. La mitigación es adelantar el modelo de datos de documentos al martes, que es lo que este plan ya hace.

**El descuento por convenio toca el cálculo de dinero.** Cualquier error se traduce en pagar mal a una profesional. Por eso F3-D y F4-B llevan verificación aritmética manual obligatoria antes de darse por cerrados.

**La conversión de documentos agrega una dependencia a la imagen del backend.** Si el contenedor no arranca o crece demasiado, hay que detectarlo el martes y no el jueves.

**La página pública de firma abre una superficie nueva a internet** que expone documentos con datos de salud. Sus pruebas de seguridad son bloqueantes en el plan de pruebas, no opcionales.