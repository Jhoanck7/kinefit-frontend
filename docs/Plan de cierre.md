# KineFit — Plan de cierre del proyecto

**Ventana de ejecución: sábado 22 a viernes 28 de agosto de 2026.**
**Hito intermedio: lunes 24, sitio público en producción.**
**Hito final: viernes 28, sistema completo en producción con el plan de pruebas cerrado.**

Cómo usar este documento: pégalo al inicio de cada sesión de trabajo, junto con el día que corresponda. Es la instrucción operativa completa del cierre. No se ejecuta nada de lo aquí descrito sin pasar por las fases y permisos indicados.

---

## 0. Restricciones permanentes

* Sin confirmación explícita de Maxi, prohibido tocar código. Si hay duda, se pregunta antes.
* Trabajo incremental: un cambio o componente a la vez, nunca adelantarse a fases futuras.
* No regenerar archivos completos salvo que Maxi lo pida o dé el visto bueno explícito tras proponerlo.
* Respuestas concisas, sin verbosidad.
* Maxi conoce la arquitectura objetivo y quiere control total de cada cambio. El rol de la IA es ejecutar de forma auditable, no decidir por su cuenta.
* **Ninguna operación destructiva sobre el VPS sin confirmación explícita.** El proyecto ya perdió una base de datos completa por un Rebuild en el panel de Hetzner.

---

## 1. Fuente de verdad

Las **Historias de Usuario v-final** y la **Info Base de Datos v-final** son la especificación. Si el código difiere de ellas, el código está mal. Si la especificación está incompleta, se pregunta a Maxi antes de decidir.

El **Plan de Pruebas** es el criterio de salida. El sistema está listo para producción cuando ese plan cierra, y no antes.

**Este es el alcance final del proyecto.** No se incorporan funcionalidades nuevas después de esta ventana. Cualquier idea que surja se registra como trabajo posterior y no entra al plan.

---

## 2. Definición de terminado

El sistema sale a producción cuando se cumplen las cinco condiciones:

1. Todos los casos del plan de pruebas ejecutados, sin ninguno pendiente.
2. Cero hallazgos bloqueantes abiertos.
3. Cero hallazgos críticos abiertos.
4. Respaldo de la base de datos automatizado y con restauración verificada sobre un entorno limpio.
5. Secretos rotados, incluida la contraseña del inicializador de datos.

Las reservas del sitio permanecen desactivadas al salir a producción, según lo acordado con el cliente, que mantiene su plataforma actual durante la marcha blanca. Eso no exime de probar el flujo de reserva completo en el entorno de pruebas.

---

## 3. Ramas y reparto

Maxi y Jhoan trabajan en ramas distintas. Para que eso no repita los conflictos de la semana pasada, rige la siguiente regla:

* **Jhoan trabaja el sitio público**: componentes de la landing, secciones, presentación y configuración de contenido del sitio.
* **Maxi trabaja el panel y el backend**: agenda, ventas, fichas, documentos, reportes, modelo de datos y migraciones.
* **Ninguno toca archivos del dominio del otro.** Si un cambio exige tocar el otro dominio, se avisa antes de hacerlo, no después.
* **El backend lo mergea siempre Maxi primero.** El frontend se sincroniza contra el backend ya mergeado, nunca al revés.
* **Un merge por día como mínimo**, al cierre de la jornada. Una rama que vive más de veinticuatro horas sin integrarse es la causa raíz del problema anterior.
* Las migraciones son aditivas. Antes de escribir una, se revisa el orden de operaciones que genera el motor, porque tiende a colocar la eliminación de índices primero.

---

## 4. Plan día por día

### Sábado 22 — Sitio público

Objetivo: dejar el sitio listo para desplegar, con todo lo que el cliente pidió y con los defectos visibles corregidos.

* Interruptor de activación y desactivación del formulario de reserva, con el destino de la llamada a la acción configurable desde el panel.
* Sección de vouchers de regalo, ubicada después de la galería de instalaciones y antes de la sección de ubicación, con título, subtítulo y fotografías administrables.
* Acceso a Apple Maps junto al de Google Maps, con el mismo tratamiento visual.
* Etiqueta de la sección de opiniones cambiada a opiniones de Google.
* Reposición de la credencial del servicio de mapas y verificación de que las reseñas cargan.
* Corrección del enlace del video de Instagram.
* Corrección de la relación de aspecto de las tarjetas del equipo.
* Carga de las fotografías que entregó el cliente.

**Entregable del día:** rama de sitio público con todos los puntos anteriores, verificada en local, lista para integrar.

### Domingo 23 — Respaldos, firewall e integración del sitio

Objetivo: asegurar la infraestructura antes de poner algo en producción, e integrar el sitio en el entorno de pruebas.

* **Respaldo de la base de datos**: volcado automatizado y programado, con retención definida.
* **Restauración verificada**: restaurar el respaldo sobre un entorno limpio y confirmar la integridad de los datos. Un respaldo sin restauración probada no cuenta como respaldo.
* **Firewall de Hetzner** configurado en el panel, además del que ya opera en el sistema operativo.
* Integración del sitio público al entorno de pruebas y verificación del despliegue automático.
* Auditoría técnica del sitio, correspondiente a WEB-001: títulos, descripciones, idioma, contenido entregado al navegador, página 404, canónico, mapa del sitio, reglas para rastreadores, datos estructurados, imagen para compartir, ícono, textos alternativos, encabezados, mapas de código y peso de los recursos.

**Entregable del día:** respaldo funcionando con restauración verificada, firewall activo, sitio desplegado en el entorno de pruebas e informe de auditoría con los hallazgos priorizados.

### Lunes 24 — Sitio público en producción

Objetivo: cumplir el hito que el cliente pidió expresamente.

* Corrección de los hallazgos de la auditoría del día anterior, priorizando bloqueantes y críticos.
* Despliegue del sitio público a producción, **con las reservas desactivadas** y la llamada a la acción apuntando al canal vigente del cliente.
* Verificación en producción: carga, formularios de contacto, enlaces, reseñas, video, mapas y comportamiento en móvil.
* En paralelo, inicio del bloque de ventas: notas del terminal, plazo de abono expresado en días hábiles, renombrado a margen de la empresa, y desglose paso a paso del cálculo en el detalle de la venta.

**Entregable del día:** sitio público operativo en producción y bloque de ventas avanzado en rama.

### Martes 25 — Convenios, duración y modelo de documentos

Objetivo: cerrar los cambios de negocio y dejar montado el modelo del módulo de documentos.

* Vigencia del convenio, visible como columna del listado.
* Descuento por convenio configurable por servicio, aplicado automáticamente al registrar la venta.
* **El descuento por convenio aparece en la tabla de ventas como primer descuento de la fila.** El orden definitivo respecto de los demás descuentos queda sujeto a confirmación del cliente.
* Interruptor global de duración de servicios y duración de 30, 60 o 90 minutos por servicio, con la exigencia de bloques consecutivos en la reserva.
* Modelo de documentos: extensión del catálogo de formatos con tipo, origen, cuerpo e indicadores de firma; tablas de documentos exigidos por servicio y de documentos del paciente; migraciones aditivas.
* **Persistencia del constructor de formatos.** Hoy los formatos no sobreviven a una recarga, y el cliente ya dio por hecho que son configurables.

**Entregable del día:** convenios y duración operativos en rama, modelo de documentos migrado y constructor de formatos persistente.

### Miércoles 26 — Documentos y reportes

Objetivo: completar el módulo de documentos de punta a punta y la sección que quedó incompleta.

* Página de firma del paciente: presentación del documento, captura de firma, generación del documento firmado y copia congelada con su huella.
* Enlace de firma por correo, de un solo uso, con expiración y sin patrón derivable.
* Firma del profesional estampada desde su perfil, siempre posterior a la del paciente.
* Carga de documento firmado en papel, con validación del archivo por su contenido real.
* Conteo de documentos pendientes en el panel.
* Tablero de hitos en el detalle de la cita: anticipo pagado, pago total registrado, documentos firmados y recomendaciones enviadas, con la acción disponible desde cada uno.
* Correo de documentos tras el pago y correo de recomendaciones al marcar la cita como atendida.
* Sección de reportes: exploración de diseño primero, validación de Maxi, e implementación después.

**Entregable del día:** módulo de documentos completo y sección de reportes funcional.

### Jueves 27 — Integración, rotación de secretos y ejecución del plan

Objetivo: dejar todo integrado y ejecutar el grueso del plan de pruebas.

* Integración de todas las ramas al entorno de pruebas y verificación del despliegue.
* Sembrado de la base del entorno de pruebas con el set determinista.
* **Rotación de secretos**, en este orden estricto:
  1. Sacar la contraseña del inicializador de datos. Que cree la cuenta de administrador sólo si no existe, con clave aleatoria y obligación de cambiarla en el primer ingreso.
  2. Recién entonces, cambiar la clave real en el entorno productivo.
  3. Verificar con un redespliegue que la rotación no se revierte.
  4. Rotar el resto de los secretos de integración y dar por comprometidos los anteriores, que siguen en el historial del repositorio.
* Ejecución del plan de pruebas: Maxi y Jhoan las funcionales, según el responsable de cada fila; las técnicas de concurrencia, carga, autorización, seguridad y auditoría en paralelo.
* Redacción del manual de usuario y del manual del sistema, en paralelo a la ejecución.

**Entregable del día:** entorno de pruebas íntegro, secretos rotados, plan de pruebas ejecutado en su mayor parte y manuales redactados.

### Viernes 28 — Cierre y producción

Objetivo: cerrar el plan y salir a producción.

* Corrección de todos los hallazgos bloqueantes y críticos.
* Reejecución de los casos fallidos. Ningún caso se marca aprobado sin volver a ejecutarse.
* Verificación de que la hoja de resumen del plan declara el estado aprobado.
* Despliegue a producción de backend y panel, con las reservas desactivadas.
* Verificación en producción de los flujos principales.
* Entrega al cliente: manuales, videos de uso y credenciales de acceso.

**Entregable del día:** sistema completo en producción y plan de pruebas cerrado.

---

## 5. Protocolo de trabajo obligatorio

**1. Fase de planificación, obligatoria antes de escribir código.** Ante cualquier instrucción, no generar código de inmediato. Responder primero con:

* Resumen de lo entendido.
* Archivos o componentes exactos que se van a tocar.
* Esquema breve, en viñetas, de los cambios propuestos.

Detenerse ahí y esperar la palabra "Procede" de Maxi.

**2. Trabajo incremental y atómico.**

* Un cambio o componente a la vez.
* No adelantarse a pasos futuros ni agregar funcionalidad no solicitada.
* Si la tarea es amplia, dividirla en sub-pasos y ejecutar sólo el primero.

**3. Preservación de código y estilo.**

* Modificar únicamente las líneas o bloques necesarios.
* No reescribir archivos completos salvo pedido explícito.
* Respetar el estándar de diseño ya fijado. Si una sección no lo sigue, refactorizarla sólo con autorización.

**4. Entregable y control.** Cada entrega de código incluye:

* El código o componente modificado.
* Resumen de tres puntos sobre qué se cambió.
* La pregunta de cierre: "¿Deseas revisar o ajustar algo antes de pasar al siguiente punto?"

---

## 6. Gestión de hallazgos

Todo caso de prueba fallido genera una fila en la hoja de hallazgos, con su severidad:

* **Bloqueante** — impide operar, pierde dinero o pierde datos. Tolerancia cero.
* **Crítico** — funcionalidad central rota, aunque exista vía alternativa. Tolerancia cero.
* **Mayor** — funciona de forma incorrecta o incómoda. Se acepta pasar con un máximo acordado y fecha comprometida.
* **Menor** — cosmético o de conveniencia. No bloquea.

Un hallazgo corregido no se cierra hasta que su caso de prueba se vuelve a ejecutar y aprueba.

---

## 7. Dependencias externas y plan alternativo

Dos cosas no dependen del equipo:

**Credenciales productivas de la pasarela de pago.** El cliente debe completar la contratación y entregar el código de comercio y la clave de producción. Si no llegan antes del 28, el sistema sale igual a producción con las reservas desactivadas, que es lo acordado con el cliente, y la pasarela se activa cuando lleguen. No es motivo para retrasar el hito.

**Ficha clínica de kinesiología.** Las especialistas del centro la están preparando. Si no llega antes del 28, el módulo queda operativo con los formatos disponibles y esa ficha se carga después desde el panel, sin tocar código.

---

## 8. Qué no hacer

* No ejecutar un Rebuild en el panel de Hetzner. Reinstala el sistema y borra el disco completo.
* No levantar el archivo de composición de contenedores sin indicar el servicio de base de datos. Levantaría un backend duplicado y desactualizado.
* No modificar la configuración del servidor web para resolver problemas de sesión. Fue verificada y descartada como causa.
* No volver a intentar un ejecutor de integración continua alojado en el propio servidor. Ya fue un callejón sin salida.
* No agregar funcionalidad nueva al alcance. Este es el cierre.