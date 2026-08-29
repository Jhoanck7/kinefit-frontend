Informe de investigación — Fase 5 "Documentos del paciente"
Nota inicial importante: el plan de la Fase 5 ya está escrito en c:\Users\mrcer\OneDrive\Desktop\Proyecto KineFit\kinefit-frontend\docs\Plan de implementacion final.md, líneas 450-559 (F5-A a F5-F). Especifica DocumentoPaciente, ServicioDocumento, la tabla de endpoints /api/documentos/publico/{token}, y textualmente src/app/(public)/documentos/[token]/page.tsx. Lo detallo al final porque cambia cómo debes planificar.

1. TransaccionService.cs — flujo completo y punto exacto de inserción
Ruta: c:\Users\mrcer\OneDrive\Desktop\Proyecto KineFit\kinefit-backend\api-dotnet\src\Application\Services\Implements\TransaccionService.cs (380 líneas)

Dependencias inyectadas (líneas 15-24)
ITransaccionRepository, ICitaRepository, IBloqueHorarioRepository, IAuditReasonContext, IEspecialistaAccessGuard, IOcupacionCitaService, IWebpayService, AppDbContext, IConfiguration, ILogger<TransaccionService>.

IniciarAsync(int citaId, int pacienteId) — líneas 52-126
Secuencia:

Comprueba LandingConfigs.ReservasHabilitadas → UnprocessableException("RESERVAS_DESHABILITADAS").
Busca cita (404) y valida cita.PacienteId != pacienteId → ForbiddenException("CITA_AJENA").
Exige cita.Estado == EstadoCita.PendientePago.
ExisteTransaccionActivaAsync(citaId) → 409.
buyOrder = $"KF-{citaId}-{timestamp}", sessionId = Guid.NewGuid().ToString(), monto = Webpay:MontoAnticipo (10000), returnUrl = Webpay:ReturnUrl.
_webpayService.CreateTransactionAsync(...) (fallo → BadGatewayException).
Persiste Transaccion con Estado = Iniciado y ExpiraEn = ahora.AddMinutes(PlazoExpiracionMinutos) (Webpay:ExpiracionMinutos, default 10 — línea 50).
Devuelve TransaccionIniciadaResponseDTO con Token, UrlRedireccion, ExpiraEn.
ReclamarAsync — líneas 141-161 (mecanismo clave)
UPDATE condicional atómico, no read-then-write:


var filas = await _context.Database.ExecuteSqlInterpolatedAsync(
    $"UPDATE transacciones SET estado = {(int)nuevoEstado}, updated_at = {ahora} WHERE id = {transaccion.Id} AND estado = {(int)EstadoTransaccion.Iniciado}");
if (filas == 0) return false;
transaccion.Estado = nuevoEstado;
transaccion.UpdatedAt = ahora;
_context.Entry(transaccion).State = EntityState.Detached;  // NO Unchanged: EF revierte valores
return true;
ExpirarSiCorrespondeAsync — líneas 169-201 y ExpirarVencidasAsync — 208-225
Compartidos entre confirmación y el ExpiracionTransaccionesBackgroundService.

ConfirmarAsync(string tokenWs) — líneas 227-352 — AQUÍ ESTÁ EL PUNTO DE INSERCIÓN
Línea 230: GetByTokenAsync(tokenWs) → si null, UnprocessableException("TOKEN_INVALIDO").
Línea 235: si Estado != Iniciado → UnprocessableException("TOKEN_YA_PROCESADO").
Líneas 239-241: carga la cita (_citaRepository.GetByIdAsync — incluye Paciente).
Líneas 247-264: comprobación de expiración; si venció, expira y retorna temprano.
Líneas 267-275: _webpayService.CommitTransactionAsync(tokenWs).
Líneas 286-337: transacción de BD + reclamo atómico.
El bloque exacto donde el pago queda aprobado (líneas 308-330):


                else
                {
                    var estadoDestino = commitResult.Approved ? EstadoCita.Confirmada : EstadoCita.Cancelada;
                    var transicion = MaquinaEstadosCita.Buscar(cita.Estado, estadoDestino, ActorTransicion.Sistema)
                        ?? throw new InvalidOperationException($"No se permite llevar una cita en estado {cita.Estado} a {estadoDestino}.");

                    if (commitResult.Approved)
                    {
                        _auditReasonContext.Set("Pago confirmado vía Webpay Plus.");   // ← línea 316
                    }
                    else
                    {
                        if (transicion.EfectoBloque == EfectoBloque.Liberar)
                        {
                            await LiberarBloquesCitaAsync(cita);
                        }
                        _auditReasonContext.Set("Pago rechazado o abandonado en Webpay Plus.");
                    }
                    cita.Estado = estadoDestino;
                    cita.UpdatedAt = DateTime.UtcNow;
                    await _citaRepository.UpdateAsync(cita);      // ← línea 328
                    await dbTransaction.CommitAsync();            // ← línea 329
                }
Punto exacto para "generar los DocumentoPaciente pendientes de firma": dentro de ese else, en la rama if (commitResult.Approved) — es decir entre la línea 316 y la 326, o inmediatamente después de await _citaRepository.UpdateAsync(cita); (línea 328) y antes de await dbTransaction.CommitAsync(); (línea 329). Ese es el único lugar del método donde se sabe que (a) el reclamo atómico se ganó, (b) Webpay aprobó, y (c) sigues dentro de la transacción de BD abierta en la línea 286, con lo cual la creación de documentos es atómica junto con cita.Estado = Confirmada.

Advertencia importante: si el reclamo falla (líneas 291-307) el pago pudo estar aprobado igual. Ahí no se debe generar el documento (la cita quedó Expirada); ese camino ya emite _logger.LogCritical y devuelve Advertencia.

Líneas 339-351: arma TransaccionConfirmadaResponseDTO.
GetByCitaIdAsync — líneas 354-379
Resuelve la cita primero y llama _especialistaAccessGuard.VerificarAcceso(cita.EspecialistaId).

Punto de inserción ALTERNATIVO (transversal) — muy relevante
c:\Users\mrcer\OneDrive\Desktop\Proyecto KineFit\kinefit-backend\api-dotnet\src\Infrastructure\Interceptors\AuditingSaveChangesInterceptor.cs, método EncolarNotificacionSiCorresponde (líneas 151-183), ya es el lugar donde el sistema reacciona a EstadoCita.Confirmada encolando la notificación de correo:


        TipoNotificacion? tipo = estadoNuevo switch
        {
            EstadoCita.Confirmada => TipoNotificacion.Confirmacion,
            EstadoCita.Cancelada or EstadoCita.NoAsistida when tipoActor == TipoActorAuditoria.Personal
                => TipoNotificacion.CambioEstado,
            _ => null
        };
        ...
        context.Set<Notificacion>().Add(new Notificacion
        {
            CitaId = cita.Id,
            Tipo = tipo.Value,
            Canal = CanalNotificacion.Correo,
            Destinatario = destinatario,
            Estado = EstadoNotificacion.Pendiente
        });
Este camino cubre también las citas creadas manualmente por personal (que no pasan por Webpay). El plan (F5-E, línea 553) pide explícitamente los dos disparadores: TransaccionService.cs y CitaService.cs. Si prefieres un solo punto, el interceptor los unifica; si prefieres explícito, van los dos.

2. TransaccionController.cs — rutas y autorización
Ruta: c:\Users\mrcer\OneDrive\Desktop\Proyecto KineFit\kinefit-backend\api-dotnet\src\Api\Controllers\TransaccionController.cs (53 líneas, completo arriba en mi lectura)

Método	Ruta	Atributo	Efecto real
POST	/api/transacciones/iniciar	[Authorize(Policy = PolicyNames.SoloPaciente)]	Requiere JWT con claim TipoSujeto = Paciente
POST	/api/transacciones/confirmar	ninguno	Anónimo de hecho
GET	/api/transacciones/{citaId}	[Authorize(Policy = PolicyNames.SoloPersonal)]	Requiere JWT de Personal
Clave: la clase no tiene [Authorize] a nivel de clase (línea 10-11: solo [Route("api/transacciones")]), y en Program.cs (líneas 158-167) AddAuthorization no define FallbackPolicy. Por tanto, un endpoint sin [Authorize] es público. POST /api/transacciones/confirmar es 100% anónimo: su única "credencial" es el tokenWs en el cuerpo.

El comentario XML de la línea 44 dice "Protegido con Api-Key" pero el atributo real es SoloPersonal — el comentario está desactualizado, no hay Api-Key en el proyecto.

Para contexto, atributos a nivel de clase del resto de controladores (útil para saber dónde encaja DocumentoPacienteController):

SoloPersonal: Agenda, Auditoria, BloqueoAgenda, Empresa, FichaClinica, FormatoFicha, PlantillaHorario, Venta, TerminalPago
SoloAdministrador: File (api/archivos), HorarioCentro, Notificacion, Reporte, UsuarioPersonal
Sin atributo de clase (mezcla por método): Auth, BloqueHorario, Cita, Configuracion, Contenido/Testimonio/ProcesoEtapa, Disponibilidad, Especialista, Paciente, Servicio, Transaccion
3. Frontend — página de retorno del pago
Hay dos rutas que apuntan al mismo componente:

c:\Users\mrcer\OneDrive\Desktop\Proyecto KineFit\kinefit-frontend\src\app\(public)\confirmacion\page.tsx — 3 líneas, es un re-export:


import ConfirmarPagoPage from "@/app/(public)/pago/confirmar/page";

export default ConfirmarPagoPage;
La real: c:\Users\mrcer\OneDrive\Desktop\Proyecto KineFit\kinefit-frontend\src\app\(public)\pago\confirmar\page.tsx (167 líneas).

Webpay:ReturnUrl en appsettings.json (línea 21) y appsettings.example.json (línea 17) es http://localhost:3000/confirmacion → la ruta viva es /confirmacion, /pago/confirmar es el archivo fuente.

Estructura del componente:

"use client", envuelto en <Suspense> (líneas 154-166) porque usa useSearchParams.
Línea 12: const tokenWs = searchParams.get("token_ws") || searchParams.get("TBK_TOKEN");
Líneas 20-43: useEffect que llama transaccionService.confirmarTransaccion(tokenWs) y guarda response.data.data.
Líneas 45-60: spinner "Validando Pago con Webpay...".
Líneas 62-86: rama de error / rechazo, con un único botón router.push("/") "Volver a Intentar".
Líneas 88-151: rama de éxito. Muestra: "¡Reserva y Pago Confirmados!", tarjeta con Orden de Compra, Servicio, Especialista, Fecha y Hora, Monto Pagado, y un único botón "Volver al Inicio" → router.push("/").
Qué se le muestra hoy al paciente: un recibo estático y un botón al home. No hay ninguna acción posterior, ni firma, ni siguiente paso. Éste es exactamente el hueco de F5-C línea 536 del plan.

Defecto real que vas a encontrar al tocar esta página (afecta directamente a tu Fase 5, porque vas a leer el resultado del pago aquí): el contrato del frontend y el del backend no coinciden.

src/types/index.ts líneas 92-108 declara:


export interface ConfirmarTransaccionResponseData {
  resultado: "Aprobado" | "Rechazado";
  cita?: { id: number; estado: string; especialista: string; servicio: string; fecha: string; hora: string; };
  transaccion?: { id: number; buyOrder: string; monto: number; estado: string; };
}
Pero TransaccionConfirmadaResponseDTO (src/Application/DTOs/TransaccionDTO/TransaccionResponseDTO.cs) devuelve plano: id, citaId, buyOrder, monto, estado, createdAt, updatedAt, estadoCita, advertencia. No existe resultado, ni objetos anidados cita / transaccion.

Consecuencias en producción hoy:

Línea 62 result.resultado === "Rechazado" es siempre undefined → un pago rechazado se muestra como "¡Reserva y Pago Confirmados!".
Las líneas 108, 114, 120, 126-127, 134 caen todas a sus defaults: "KF-CITA", "Kinesiología", "KineFit", fecha vacía, $10.000. El recibo que ve el paciente es literalmente texto fijo.
advertencia (el caso crítico de cobro sin cita) nunca se muestra.
Si vas a inyectar "ahora firma tu consentimiento" en esta pantalla, necesitas leer algo real de la respuesta, así que este desajuste hay que resolverlo en la misma tarea.

4. Rutas públicas — estructura completa
Todo lo que existe bajo src/app/(public)/:


c:\Users\mrcer\OneDrive\Desktop\Proyecto KineFit\kinefit-frontend\src\app\(public)\layout.tsx
c:\Users\mrcer\OneDrive\Desktop\Proyecto KineFit\kinefit-frontend\src\app\(public)\page.tsx
c:\Users\mrcer\OneDrive\Desktop\Proyecto KineFit\kinefit-frontend\src\app\(public)\icon.svg
c:\Users\mrcer\OneDrive\Desktop\Proyecto KineFit\kinefit-frontend\src\app\(public)\confirmacion\layout.tsx
c:\Users\mrcer\OneDrive\Desktop\Proyecto KineFit\kinefit-frontend\src\app\(public)\confirmacion\page.tsx
c:\Users\mrcer\OneDrive\Desktop\Proyecto KineFit\kinefit-frontend\src\app\(public)\pago\confirmar\layout.tsx
c:\Users\mrcer\OneDrive\Desktop\Proyecto KineFit\kinefit-frontend\src\app\(public)\pago\confirmar\page.tsx
Eso es todo. Solo hay dos grupos de rutas: (public) y (panel).

No existe ninguna ruta pública con parámetro dinámico. Los únicos [param] del proyecto están en el panel y son triviales:

src\app\(panel)\panel\(shell)\pacientes\[id]\page.tsx (17 líneas, completo):


"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PerfilPacientePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      router.replace(`/panel/pacientes?paciente=${id}`);
    }
  }, [id, router]);

  return <div aria-hidden />;
}
fichas\[id]\page.tsx es idéntico salvo el nombre. Ambos son redirecciones a query string, no un patrón reutilizable para /documentos/[token].

El patrón que sí debes copiar es el de pago/confirmar: carpeta con layout.tsx + page.tsx, donde layout.tsx solo exporta metadata con robots: { index: false, follow: false } (crítico para /documentos/[token]) y devuelve children sin envolver:


import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confirmando tu pago",
  description: "Confirmación del pago de tu reserva en KineFit Chile.",
  robots: { index: false, follow: false },
};

export default function ConfirmarPagoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
Aviso sobre el layout del grupo: src\app\(public)\layout.tsx (137 líneas) es el <html>/<body> raíz del grupo y envuelve todo con <Navbar>, <Footer> y <WhatsAppButton> (líneas 126-133), además de hacer una llamada de servidor a landingConfigService.getConfig() (línea 57) e inyectar JSON-LD de PhysicalTherapyClinic. Una página de firma en móvil heredará navbar y footer de marketing. pago/confirmar los hereda igual hoy. Si quieres una vista limpia a pantalla completa para firmar con el dedo, tendrás que decidirlo explícitamente (el layout.tsx anidado no puede quitar el del padre; requeriría otro grupo de rutas hermano de (public)).

También src/app/robots.ts y src/app/sitemap.ts existen — conviene revisarlos para excluir /documentos.

5. Llamadas al backend sin sesión
c:\Users\mrcer\OneDrive\Desktop\Proyecto KineFit\kinefit-frontend\src\services\base-api-service.ts (13 líneas, completo):


import { AxiosInstance } from "axios";

import { axiosInstance } from "@/providers";

export abstract class BaseApiService {
  protected readonly baseURL: string;
  protected readonly httpClient: AxiosInstance;

  constructor(baseURL: string, httpClient: AxiosInstance = axiosInstance) {
    this.baseURL = baseURL;
    this.httpClient = httpClient;
  }
}
c:\Users\mrcer\OneDrive\Desktop\Proyecto KineFit\kinefit-frontend\src\providers\axios-provider.tsx (40 líneas, completo — es el cliente http entero, solo hay interceptor de request, ninguno de response):


import axios from "axios";
import { getSession, signOut } from "next-auth/react";
import { toast } from "sonner";

import { isSessionExpired } from "@/lib/auth";

// El backend autentica con Authorization: Bearer, no con cookies.
export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(async config => {
  const yaTieneAuthorization = Boolean(
    (config.headers as Record<string, string> | undefined)?.["Authorization"]
  );

  // El token explícito del paciente (flujo público) siempre gana sobre la sesión del panel.
  if (typeof window !== "undefined" && !yaTieneAuthorization) {
    const session = await getSession();
    const token = session?.accessToken;

    if (session && isSessionExpired(session)) {
      toast.error("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
      await signOut({ redirect: false });
      return Promise.reject(new Error("Token expired"));
    }

    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  }

  return config;
});
Respuestas concretas a tu pregunta:

Llamada anónima: funciona por omisión. Si no hay sesión NextAuth, session?.accessToken es undefined y no se adjunta ninguna cabecera. No hace falta ningún opt-out ni cliente alternativo. transaccionService.confirmarTransaccion(tokenWs) (src/services/transaccion-service.ts líneas 24-29) es precisamente eso: this.httpClient.post(...) sin headers, y es el que corre en la página pública de retorno de pago.
Riesgo a tener en cuenta para /documentos/[token]: si el paciente abre el enlace del correo en el mismo navegador donde una kinesióloga tiene el panel abierto, getSession() devolverá esa sesión de Personal y el interceptor adjuntará su Bearer de Personal a la llamada a /api/documentos/publico/{token}. El backend recibirá un JWT de Personal en un endpoint anónimo. Si el endpoint es [AllowAnonymous] puro no rompe nada, pero si usas ICurrentUserContext para auditar, quedará registrado como Personal en vez de Paciente. Además isSessionExpired puede disparar un toast.error("Tu sesión ha expirado") y rechazar la promesa, rompiendo la página pública de firma por una sesión de panel caducada ajena al paciente.
Patrón de token explícito: el mecanismo previsto es pasar { headers: { Authorization: \Bearer ${token}` } }en la llamada, como hacetransaccionService.iniciarTransaccion(líneas 13-22) yuse-appointment-service.tslínea 89. El comentario de la línea 21 del provider dice que "el token explícito del paciente siempre gana". Para el flujo público con token de URL, lo limpio es unhttpClientpropio inyectado por el constructor deBaseApiService` (el segundo parámetro existe justo para eso y hoy nadie lo usa) — una instancia axios sin interceptor.
Base URL: process.env.NEXT_PUBLIC_API_URL, timeout 10s. Manejo de errores centralizado aparte en src/lib/api.ts → handleApiError.
6. Middleware / proxy
No existe middleware.ts en el proyecto (Next 16.2.9 — package.json línea 25 — lo renombró a proxy.ts).

c:\Users\mrcer\OneDrive\Desktop\Proyecto KineFit\kinefit-frontend\src\proxy.ts (50 líneas, completo):


import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { isTokenExpired } from "@/lib/auth";

const RUTA_ACCESO = "/panel/acceso";

// Coincide con [Authorize(Policy = PolicyNames.SoloAdministrador)] del backend
// para las secciones del panel que ya existen como página.
const RUTAS_SOLO_ADMINISTRADOR = [
  "/panel/especialistas",
  "/panel/landing",
  "/panel/ventas",
  "/panel/reportes",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });
  const autenticado = Boolean(token) && !isTokenExpired(token);

  if (pathname === RUTA_ACCESO) {
    if (autenticado) {
      return NextResponse.redirect(new URL("/panel/agenda", request.url));
    }
    return NextResponse.next();
  }

  if (!autenticado) {
    return NextResponse.redirect(new URL(RUTA_ACCESO, request.url));
  }

  const requiereAdministrador = RUTAS_SOLO_ADMINISTRADOR.some(ruta =>
    pathname.startsWith(ruta)
  );
  if (requiereAdministrador && token?.rol !== "Administrador") {
    return NextResponse.redirect(new URL("/panel/agenda", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*"],
};
Respuesta directa: NO, /documentos/[token] no quedaría bloqueado. El matcher es exclusivamente ["/panel/:path*"]; el proxy ni siquiera se ejecuta para otras rutas. /confirmacion funciona hoy sin sesión por esta misma razón. No hay que tocar proxy.ts para la Fase 5.

7. ¿Existe ya "acceso por token anónimo" en el backend?
No existe ningún patrón de token en la URL. Lo digo explícitamente: no hay nada de eso implementado.

Lo que sí existe, y es el precedente más cercano, es un token anónimo en el cuerpo del request: POST /api/transacciones/confirmar (TransaccionController.cs líneas 36-41) no tiene [Authorize], recibe ConfirmarTransaccionDTO { TokenWs } y TransaccionService.ConfirmarAsync lo resuelve con _transaccionRepository.GetByTokenAsync(tokenWs). Ese token es de un solo uso de facto por la guarda de la línea 235 (Estado != Iniciado → TOKEN_YA_PROCESADO) más el reclamo atómico ReclamarAsync. Es el modelo mental a copiar para el token de firma, pero el token no lo genera KineFit, lo genera Transbank.

El resto del acceso anónimo son tres endpoints de solo lectura de contenido público, sin token de ninguna clase, en src\Api\Controllers\ConfiguracionController.cs: [AllowAnonymous] en las líneas 34 (GET /api/configuracion/landing), 71 (POST /api/configuracion/sincronizar-google-reviews) y 80 (GET /api/configuracion/sistema). Nada más en todo el backend usa [AllowAnonymous].

Toda la autenticación es JWT Bearer: Program.cs líneas 136-155, con políticas por claim TipoSujeto (líneas 158-167). Hay además ValidacionSesionPersonalMiddleware (src\Api\Middlewares\ValidacionSesionPersonalMiddleware.cs, registrado en Program.cs línea 243, entre UseAuthentication y UseAuthorization) que revalida contra BD los tokens de Personal. Su línea 39-43 hace if (!esPersonal) { await _next(context); return; }, así que una petición anónima con token en URL lo atraviesa sin coste.

No hay rate limiting configurado en Program.cs (ni AddRateLimiter ni UseRateLimiter), pese a que el plan lo exige en la línea 526 ("Límite de intentos sobre los endpoints públicos, por dirección de origen"). Eso hay que construirlo desde cero.

8. Generación de tokens / identificadores seguros
Inventario completo de lo que existe hoy:

El único uso de criptografía para generar un secreto legible — src\Application\Services\Implements\UsuarioPersonalService.cs líneas 217-231:


    /// <summary>
    /// Contraseña temporal aleatoria criptográficamente segura. Se evitan los
    /// caracteres que se confunden al dictarla o transcribirla (O/0, l/1/I),
    /// porque el administrador va a entregarla a mano.
    /// </summary>
    private static string GenerarPasswordTemporal()
    {
        const string alfabeto = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
        var caracteres = new char[14];
        for (var i = 0; i < caracteres.Length; i++)
        {
            caracteres[i] = alfabeto[RandomNumberGenerator.GetInt32(alfabeto.Length)];
        }
        return new string(caracteres);
    }
14 caracteres sobre alfabeto de 55 ≈ 81 bits. Sirve para dictar, no para el token de firma (el plan pide ≥32 bytes).

RandomNumberGenerator.GetBytes + Base64 — src\Application\Validators\PasswordHasher.cs líneas 19-21:


        var salt = RandomNumberGenerator.GetBytes(SaltSizeBytes);
        ...
        return $"{Iterations}.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(key)}";
Éste es el patrón base correcto. Ojo: Convert.ToBase64String produce +, / y =, no apto para URL. Para /documentos/[token] necesitas Base64UrlEncoder.Encode(...) (ya disponible vía Microsoft.IdentityModel.Tokens, que el proyecto referencia en Program.cs) o un .Replace. El plan lo llama "representación apta para direcciones web" (línea 496).

Guid — tres usos, ninguno como secreto de seguridad real:

src\Application\Services\Implements\TransaccionService.cs:80 → var sessionId = Guid.NewGuid().ToString(); (sessionId de Webpay)
src\Application\Services\Implements\FakeWebpayService.cs:18 → var token = $"fake_{Guid.NewGuid():N}";
src\Application\Services\Implements\CitaService.cs:124 → Guid? grupoCitaId = bloques.Count > 1 ? Guid.NewGuid() : null;
src\Infrastructure\Storage\AlmacenamientoArchivosLocalService.cs:27 → var nombreOpaco = $"{Guid.NewGuid():N}{extensionOriginal}";
Ese último es directamente relevante: es el servicio donde el plan (línea 502) manda guardar los trazos de firma y escaneos. Archivo completo en src\Infrastructure\Storage\AlmacenamientoArchivosLocalService.cs (53 líneas): GuardarAsync(Stream, string extension), AbrirAsync(string rutaInterna), EliminarAsync(string rutaInterna), ruta base desde Adjuntos:RutaBase.

Conclusión del punto 8: no hay ningún generador de tokens de URL. Hay que escribirlo, combinando RandomNumberGenerator.GetBytes(32) (patrón de PasswordHasher) con codificación Base64Url.

Hallazgos adicionales que cambian tu planificación
a) Parte del modelo de Fase 5 ya está en el código, esperándote.

src\Domain\Enums\TipoDocumentoClinico.cs ya incluye el valor Consentimiento:


public enum TipoDocumentoClinico
{
    FichaClinica,
    Recomendacion,
    Consentimiento
}
src\Domain\Models\FormatoFicha.cs líneas 33-35 — los flags ya existen y su comentario apunta literalmente a tu fase:


    /// <summary>Declarativo: lo consume el módulo de firma al generar el documento del paciente.</summary>
    public bool RequiereFirmaPaciente { get; set; }
    public bool RequiereFirmaProfesional { get; set; }
Y el comentario de clase (líneas 14-17) ya define la regla del cuerpo congelado: "lo que protege a un documento ya firmado de ese cambio es la copia congelada del texto que se guarda al firmarlo, no una versión de esta plantilla."

Además FormatoFicha soporta dos orígenes (OrigenFormato.Constructor con Cuerpo jsonb, u OrigenFormato.Documento con ArchivoRutaInterna a un PDF), y ya está en la lista de entidades auditadas del interceptor (línea 39).

No existe DocumentoPaciente, ServicioDocumento, MomentoDocumento, OrigenDocumento, EstadoDocumento, ni DocumentoPacienteController, ni documento-service.ts, ni use-documento-service.ts. Verificado por grep en ambos repos.

b) UsuarioPersonal.FirmaRutaInterna no existe — el plan (línea 544) lo pide con su migración para estampar la firma del profesional.

c) TipoNotificacion no tiene DocumentoParaFirma ni DocumentoPostAtencion. Las plantillas están en NotificacionService.Redactar (líneas 190-208), un switch por tipo — patrón a extender. El envío ya tiene reintentos con espera exponencial (2/4/8/16 min, MaxIntentos = 5, líneas 154-188) y reclamo atómico, así que la infraestructura de correo está lista.

d) Migraciones existentes para referencia de nomenclatura: 20260827201102_AddFormatosFicha es la más reciente en src\Infrastructure\Data\Migrations\.

e) No existe librería de captura de firma en package.json (ni react-signature-canvas ni similar). Habrá que elegir una o implementar canvas con pointer events.

He investigado el backend completo. Aquí va el informe con código real y rutas exactas.

1. TipoNotificacion.cs (completo)
c:\Users\mrcer\OneDrive\Desktop\Proyecto KineFit\kinefit-backend\api-dotnet\src\Domain\Enums\TipoNotificacion.cs


namespace reserva_citas_api.Domain.Enums;

public enum TipoNotificacion
{
    Confirmacion,
    Recordatorio,
    CambioEstado
}
Sin valores explícitos (0,1,2 implícitos). La columna en BD es integer (ver migración abajo), así que los tipos nuevos van al final, nunca intercalados. El proyecto ya documenta esa regla explícitamente en EstadoCita.cs y TipoDocumentoClinico.cs ("Valores implícitos por orden de declaración... nunca reordenar, los nuevos al final").

Enums vecinos relevantes (mismo directorio):


// EstadoNotificacion.cs
public enum EstadoNotificacion { Pendiente, Enviada, Fallida }

// CanalNotificacion.cs
public enum CanalNotificacion { Correo }
Y ya existe src\Domain\Enums\TipoDocumentoClinico.cs con FichaClinica, Recomendacion, Consentimiento — vocabulario que la Fase 5 probablemente deba reutilizar.

2. Notificacion.cs (completo)
c:\Users\mrcer\OneDrive\Desktop\Proyecto KineFit\kinefit-backend\api-dotnet\src\Domain\Models\Notificacion.cs


using reserva_citas_api.Domain.Enums;

namespace reserva_citas_api.Domain.Models;

public class Notificacion
{
    public int Id { get; set; }
    public int CitaId { get; set; }
    public Cita Cita { get; set; } = null!;

    public TipoNotificacion Tipo { get; set; }
    public CanalNotificacion Canal { get; set; } = CanalNotificacion.Correo;
    public string Destinatario { get; set; } = null!;

    public EstadoNotificacion Estado { get; set; } = EstadoNotificacion.Pendiente;
    public int Intentos { get; set; }
    public string? DetalleFallo { get; set; }

    // Reintento con espera creciente: nulo hasta el primer fallo. Sin esto,
    // un proveedor caído diez minutos agota los cinco intentos en los
    // primeros cinco (uno por vuelta del proceso) y termina Fallida igual.
    public DateTime? ProximoIntentoEn { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? EnviadoEn { get; set; }
}
Hallazgo crítico para Fase 5: Notificacion no tiene ningún campo de carga útil — no hay DocumentoId, ni Token, ni Url, ni Payload/Datos jsonb. La única referencia es CitaId. Un correo con enlace a un documento concreto necesita, o bien una columna nueva (FK al documento o el token), o bien que Redactar resuelva el documento por consulta a partir de CitaId + Tipo.

3. NotificacionService.cs (COMPLETO)
c:\Users\mrcer\OneDrive\Desktop\Proyecto KineFit\kinefit-backend\api-dotnet\src\Application\Services\Implements\NotificacionService.cs


using Microsoft.EntityFrameworkCore;
using reserva_citas_api.Application.DTOs;
using reserva_citas_api.Domain.Enums;
using reserva_citas_api.Domain.Models;
using reserva_citas_api.Infrastructure.Data;

namespace reserva_citas_api.Application.Services;

public class NotificacionService : INotificacionService
{
    private readonly AppDbContext _context;
    private readonly IEmailSender _emailSender;

    public NotificacionService(AppDbContext context, IEmailSender emailSender)
    {
        _context = context;
        _emailSender = emailSender;
    }

    public async Task<GenericResponse<NotificacionesPaginadasDTO>> ListarAsync(
        int? citaId, string? tipo, string? estado, DateOnly? fechaDesde, DateOnly? fechaHasta, int page, int pageSize)
    {
        var query = _context.Notificaciones.AsQueryable();

        if (citaId.HasValue)
        {
            query = query.Where(n => n.CitaId == citaId.Value);
        }
        if (!string.IsNullOrWhiteSpace(tipo) && Enum.TryParse<TipoNotificacion>(tipo, true, out var tipoEnum))
        {
            query = query.Where(n => n.Tipo == tipoEnum);
        }
        if (!string.IsNullOrWhiteSpace(estado) && Enum.TryParse<EstadoNotificacion>(estado, true, out var estadoEnum))
        {
            query = query.Where(n => n.Estado == estadoEnum);
        }
        if (fechaDesde.HasValue)
        {
            query = query.Where(n => n.CreatedAt >= ChileTimeZone.InicioDiaUtc(fechaDesde.Value));
        }
        if (fechaHasta.HasValue)
        {
            query = query.Where(n => n.CreatedAt < ChileTimeZone.InicioDiaUtc(fechaHasta.Value.AddDays(1)));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new NotificacionResponseDTO
            {
                Id = n.Id,
                CitaId = n.CitaId,
                Tipo = n.Tipo.ToString(),
                Canal = n.Canal.ToString(),
                Destinatario = n.Destinatario,
                Estado = n.Estado.ToString(),
                Intentos = n.Intentos,
                DetalleFallo = n.DetalleFallo,
                EnviadoEn = n.EnviadoEn,
                CreatedAt = n.CreatedAt
            })
            .ToListAsync();

        return GenericResponse<NotificacionesPaginadasDTO>.Success(new NotificacionesPaginadasDTO
        {
            Total = total,
            Page = page,
            PageSize = pageSize,
            Items = items
        }, null);
    }

    public async Task<int> GenerarRecordatoriosPendientesAsync(TimeSpan antelacion)
    {
        var ahora = DateTime.UtcNow;
        var limite = ahora.Add(antelacion);
        // Acota por Fecha antes de convertir hora por hora: evita recorrer toda
        // la tabla de citas confirmadas para comparar solo un puñado de ellas.
        var desdeFecha = DateOnly.FromDateTime(ahora.AddDays(-1));
        var hastaFecha = DateOnly.FromDateTime(limite.AddDays(1));

        var candidatas = await _context.Citas
            .Where(c => c.Estado == EstadoCita.Confirmada && c.Fecha >= desdeFecha && c.Fecha <= hastaFecha)
            .Where(c => !_context.Notificaciones.Any(n => n.CitaId == c.Id && n.Tipo == TipoNotificacion.Recordatorio))
            .Include(c => c.Paciente)
            .ToListAsync();

        // Regla tomada en sesión de trabajo el 09/08/2026 (no es una
        // confirmación de Diego por canal aparte, ver docs/plan_implementacion_hito4.md):
        // si la reserva se agendó cuando ya faltaba menos que la antelación
        // para la atención, no se envía recordatorio — no solo se pospone, se
        // omite para siempre. Pendiente de que el cliente la ratifique.
        var enVentana = candidatas
            .Where(c => ChileTimeZone.AUtc(c.Fecha, c.HoraInicio) is var inicioUtc
                     && inicioUtc >= ahora && inicioUtc <= limite
                     && inicioUtc - c.CreatedAt >= antelacion)
            .ToList();

        if (enVentana.Count == 0)
        {
            return 0;
        }

        foreach (var cita in enVentana)
        {
            _context.Notificaciones.Add(new Notificacion
            {
                CitaId = cita.Id,
                Tipo = TipoNotificacion.Recordatorio,
                Canal = CanalNotificacion.Correo,
                Destinatario = cita.Paciente.Email,
                Estado = EstadoNotificacion.Pendiente
            });
        }
        await _context.SaveChangesAsync();
        return enVentana.Count;
    }

    public async Task<int> ProcesarPendientesAsync()
    {
        var ahora = DateTime.UtcNow;
        var pendientes = await _context.Notificaciones
            .Include(n => n.Cita).ThenInclude(c => c.Paciente)
            .Where(n => n.Estado == EstadoNotificacion.Pendiente
                     && (n.ProximoIntentoEn == null || n.ProximoIntentoEn <= ahora))
            .ToListAsync();

        var procesadas = 0;
        foreach (var notificacion in pendientes)
        {
            if (!await ReclamarAsync(notificacion.Id, ahora))
            {
                continue;
            }
            var intentos = notificacion.Intentos + 1;

            var (asunto, cuerpo) = Redactar(notificacion);
            var resultado = await _emailSender.EnviarAsync(notificacion.Destinatario, asunto, cuerpo);

            await FinalizarAsync(notificacion.Id, intentos, resultado);
            procesadas++;
        }
        return procesadas;
    }

    // Una falla transitoria (el proveedor caído un rato) no debe quemar el
    // aviso: se queda Pendiente y reintenta con espera creciente — 2, 4, 8 y
    // 16 minutos — hasta agotar MaxIntentos, que recién ahí marca Fallida. Sin
    // el espaciado, cinco intentos con el proceso corriendo cada minuto son
    // cinco intentos en cinco minutos: el mismo fallo repetido rápido, no un
    // reintento real frente a una caída de diez minutos o más.
    private const int MaxIntentos = 5;

    private static TimeSpan Espera(int intentos) => TimeSpan.FromMinutes(2 * Math.Pow(2, intentos - 1));

    // Reclamo atómico igual al de TransaccionService.ReclamarAsync: si dos
    // pasadas del proceso en segundo plano llegan a tomar la misma fila
    // (reinicio a mitad de una pasada), solo una gana la condición del WHERE.
    private async Task<bool> ReclamarAsync(int notificacionId, DateTime ahora)
    {
        var filas = await _context.Database.ExecuteSqlInterpolatedAsync(
            $"UPDATE notificaciones SET intentos = intentos + 1 WHERE id = {notificacionId} AND estado = {(int)EstadoNotificacion.Pendiente} AND (proximo_intento_en IS NULL OR proximo_intento_en <= {ahora})");
        return filas > 0;
    }

    private async Task FinalizarAsync(int notificacionId, int intentos, EmailEnviadoResult resultado)
    {
        if (resultado.Enviado)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync(
                $"UPDATE notificaciones SET estado = {(int)EstadoNotificacion.Enviada}, enviado_en = {DateTime.UtcNow}, detalle_fallo = NULL WHERE id = {notificacionId}");
            return;
        }

        if (intentos >= MaxIntentos)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync(
                $"UPDATE notificaciones SET estado = {(int)EstadoNotificacion.Fallida}, detalle_fallo = {resultado.DetalleFallo} WHERE id = {notificacionId}");
        }
        else
        {
            var proximoIntento = DateTime.UtcNow.Add(Espera(intentos));
            await _context.Database.ExecuteSqlInterpolatedAsync(
                $"UPDATE notificaciones SET detalle_fallo = {resultado.DetalleFallo}, proximo_intento_en = {proximoIntento} WHERE id = {notificacionId}");
        }
    }

    private static (string Asunto, string Cuerpo) Redactar(Notificacion n)
    {
        var cita = n.Cita;
        var fechaHora = $"{cita.Fecha:dd-MM-yyyy} {cita.HoraInicio:HH:mm}";
        return n.Tipo switch
        {
            TipoNotificacion.Confirmacion => (
                "Tu cita en KineFit está confirmada",
                $"Tu cita del {fechaHora} quedó confirmada." +
                    (string.IsNullOrWhiteSpace(cita.NotaPaciente) ? "" : $"\n\n{cita.NotaPaciente}")),
            TipoNotificacion.Recordatorio => (
                "Recordatorio de tu cita en KineFit",
                $"Te recordamos tu cita del {fechaHora}."),
            TipoNotificacion.CambioEstado => (
                "Actualización sobre tu cita en KineFit",
                $"Tu cita del {fechaHora} {DescripcionCambioEstado(cita.Estado)}."),
            _ => throw new InvalidOperationException($"Tipo de notificación no reconocido: {n.Tipo}")
        };
    }

    // El enum crudo suena a acusación en un correo ("cambió de estado a
    // NoAsistida"); esto es lo único que se le muestra al paciente.
    private static string DescripcionCambioEstado(EstadoCita estado) => estado switch
    {
        EstadoCita.Cancelada => "fue cancelada",
        EstadoCita.NoAsistida => "quedó registrada como no asistida",
        _ => "cambió de estado"
    };
}
Puntos que condicionan la Fase 5:

Redactar es private static y solo recibe la Notificacion. Para meter una URL configurable hay que convertirlo en método de instancia y inyectar IConfiguration en NotificacionService (hoy el constructor solo recibe AppDbContext e IEmailSender).
ProcesarPendientesAsync solo hace .Include(n => n.Cita).ThenInclude(c => c.Paciente). Si el correo del documento necesita nombre del especialista o del servicio, hay que agregar los Include (c.Especialista, c.Servicio), o Redactar verá null.
El switch de Redactar lanza InvalidOperationException en el _. Ese throw ocurre dentro del foreach de ProcesarPendientesAsync, fuera de try/catch → rompe toda la pasada y sube al catch del background service. Si se agrega un tipo nuevo al enum y se olvida el brazo en Redactar, se cae el procesamiento de todas las notificaciones de esa vuelta, no solo la del tipo nuevo.
El reclamo atómico es SQL crudo con nombres de columna literales (notificaciones, intentos, proximo_intento_en) — cualquier columna nueva del modelo no participa ahí salvo que se agregue a mano.
Interfaz: c:\...\src\Application\Services\Interfaces\INotificacionService.cs


public interface INotificacionService
{
    Task<GenericResponse<NotificacionesPaginadasDTO>> ListarAsync(
        int? citaId, string? tipo, string? estado, DateOnly? fechaDesde, DateOnly? fechaHasta, int page, int pageSize);

    /// <summary>Encola un recordatorio para cada cita Confirmada que entra en la ventana de antelación y todavía no tiene uno.</summary>
    Task<int> GenerarRecordatoriosPendientesAsync(TimeSpan antelacion);

    /// <summary>Reclama y envía las notificaciones Pendiente. Devuelve cuántas procesó.</summary>
    Task<int> ProcesarPendientesAsync();
}
No existe un método público tipo EncolarAsync(...). Hoy encolar = hacer _context.Notificaciones.Add(...) a mano donde sea.

4. EmailService (Resend) y el background service
4.1 EmailService.cs — ojo, NO está en Infrastructure, está en Application
c:\Users\mrcer\OneDrive\Desktop\Proyecto KineFit\kinefit-backend\api-dotnet\src\Application\Services\Implements\EmailService.cs


using Resend;

namespace reserva_citas_api.Application.Services;

public class EmailService : IEmailSender
{
    private readonly IResend _resend;
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _webHostEnvironment;

    public EmailService(IResend resend, IConfiguration configuration, IWebHostEnvironment webHostEnvironment)
    {
        _resend = resend;
        _configuration = configuration;
        _webHostEnvironment = webHostEnvironment;
    }

    public async Task<EmailEnviadoResult> EnviarAsync(string destinatario, string asunto, string cuerpo)
    {
        try
        {
            var htmlBody = await LoadTemplate(asunto, cuerpo);
            var message = new EmailMessage
            {
                To = destinatario,
                Subject = asunto,
                From = _configuration["EmailConfiguration:From"] ?? throw new ArgumentNullException("La configuración de 'From' no puede ser nula."),
                HtmlBody = htmlBody
            };
            await _resend.EmailSendAsync(message);
            return new EmailEnviadoResult { Enviado = true };
        }
        catch (Exception ex)
        {
            return new EmailEnviadoResult { Enviado = false, DetalleFallo = ex.Message };
        }
    }

    private async Task<string> LoadTemplate(string asunto, string cuerpo)
    {
        var templatePath = Path.Combine(_webHostEnvironment.ContentRootPath, "src", "Application", "Templates", "Email", "Notificacion.html");
        var html = await File.ReadAllTextAsync(templatePath);
        return html.Replace("{{ASUNTO}}", asunto).Replace("{{CUERPO}}", cuerpo);
    }
}
Contrato (c:\...\src\Application\Services\Interfaces\IEmailSender.cs):


public class EmailEnviadoResult
{
    public bool Enviado { get; set; }
    public string? DetalleFallo { get; set; }
}

public interface IEmailSender
{
    Task<EmailEnviadoResult> EnviarAsync(string destinatario, string asunto, string cuerpo);
}
Firma de tres strings, sin adjuntos ni ReplyTo. Para "el correo lleva UN ENLACE, nunca adjunto" esto ya sirve tal cual: no hay que tocar IEmailSender.

4.2 La plantilla HTML
c:\Users\mrcer\OneDrive\Desktop\Proyecto KineFit\kinefit-backend\api-dotnet\src\Application\Templates\Email\Notificacion.html

Lo relevante:


        .content {
            padding: 30px;
            font-size: 16px;
            color: #333;
            white-space: pre-line;
        }
...
        <div class="content">{{CUERPO}}</div>
        <div class="footer">Este es un correo automático, por favor no respondas a esta dirección.</div>
El {{CUERPO}} se inyecta como HTML crudo (string.Replace, sin escapar). Consecuencias para Fase 5:

Se puede meter directamente <a href="https://...">Firmar documento</a> desde Redactar y va a renderizar como enlace. No hace falta tocar la plantilla ni el IEmailSender.
Corolario de seguridad: cualquier texto de usuario que hoy entra al cuerpo (cita.NotaPaciente en el brazo Confirmacion) llega sin sanitizar al HTML del correo. Si el enlace de firma se arma concatenando datos del paciente, hay riesgo de inyección de HTML en el correo.
white-space: pre-line es lo que convierte los \n del cuerpo en saltos de línea.
4.3 Background service
c:\Users\mrcer\OneDrive\Desktop\Proyecto KineFit\kinefit-backend\api-dotnet\src\Infrastructure\BackgroundServices\NotificacionesBackgroundService.cs


using reserva_citas_api.Application.Services;

namespace reserva_citas_api.Infrastructure.BackgroundServices;

/// <summary>
/// Tercer proceso en segundo plano con la misma forma que los otros dos
/// (expiración de transacciones, horizonte de agenda): propio scope de DI por
/// iteración, captura de errores para que un fallo no detenga el proceso.
/// El envío nunca ocurre dentro de la transacción de la cita (decisión 6.5):
/// aquí solo se procesa lo que ya quedó encolado como Pendiente.
/// </summary>
public class NotificacionesBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<NotificacionesBackgroundService> _logger;
    private readonly TimeSpan _intervalo;
    private readonly TimeSpan _antelacionRecordatorio;

    public NotificacionesBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<NotificacionesBackgroundService> logger,
        IConfiguration config)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        _intervalo = TimeSpan.FromSeconds(config.GetValue("Notificaciones:IntervaloProcesamientoSegundos", 60));
        // Antelación PENDIENTE de confirmar con el cliente (capítulo 11): 24
        // horas por omisión, configurable sin recompilar.
        _antelacionRecordatorio = TimeSpan.FromHours(config.GetValue("Notificaciones:AntelacionRecordatorioHoras", 24));
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(_intervalo);
        do
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var notificacionService = scope.ServiceProvider.GetRequiredService<INotificacionService>();

                var recordatorios = await notificacionService.GenerarRecordatoriosPendientesAsync(_antelacionRecordatorio);
                var procesadas = await notificacionService.ProcesarPendientesAsync();

                if (recordatorios > 0 || procesadas > 0)
                {
                    _logger.LogInformation(
                        "Notificaciones: {Recordatorios} recordatorio(s) encolado(s), {Procesadas} notificación(es) procesada(s).",
                        recordatorios, procesadas);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en el proceso de notificaciones.");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }
}
Nota: no existe la sección "Notificaciones" en appsettings.json; corre con los defaults (60 s / 24 h).

4.4 Registro en DI
c:\Users\mrcer\OneDrive\Desktop\Proyecto KineFit\kinefit-backend\api-dotnet\Program.cs


builder.Services.AddScoped<INotificacionService, NotificacionService>();   // línea 92
...
// Servicio de correo con Resend
builder.Services.AddOptions();
builder.Services.AddHttpClient<ResendClient>();
builder.Services.Configure<ResendClientOptions>(o =>
{
    o.ApiToken =
        builder.Configuration["ResendAPIKey"]
        ?? throw new InvalidOperationException("El token de API de Resend no está configurado.");
});
builder.Services.AddTransient<IResend, ResendClient>();
builder.Services.AddScoped<IEmailSender, EmailService>();                  // líneas 95-105
...
// Recordatorios y envío de notificaciones pendientes
builder.Services.AddHostedService<NotificacionesBackgroundService>();      // línea 132
5. TODOS los puntos donde HOY se encola una notificación
Son exactamente dos, y aquí está la sorpresa arquitectónica más importante del informe:

CitaService.cs y TransaccionService.cs NO encolan notificaciones. Ni una sola línea. El encolado de Confirmacion y CambioEstado vive en un interceptor de SaveChanges de EF Core, que observa el ChangeTracker y detecta cambios de Cita.Estado.

Punto 1 — AuditingSaveChangesInterceptor (los disparos por cambio de estado)
c:\Users\mrcer\OneDrive\Desktop\Proyecto KineFit\kinefit-backend\api-dotnet\src\Infrastructure\Interceptors\AuditingSaveChangesInterceptor.cs, líneas 104-183:


    private void AuditarTransicionesDeCita(DbContext context)
    {
        var entradas = context.ChangeTracker.Entries<Cita>().Where(e => e.State == EntityState.Modified).ToList();
        if (entradas.Count == 0)
        {
            return;
        }

        var (tipoActor, usuarioId) = ResolverActor();
        var motivo = _auditReason.Tomar();

        foreach (var entrada in entradas)
        {
            var estadoProp = entrada.Property(c => c.Estado);
            if (!estadoProp.IsModified)
            {
                continue;
            }

            var estadoAnterior = (EstadoCita)estadoProp.OriginalValue!;
            var estadoNuevo = (EstadoCita)estadoProp.CurrentValue!;
            if (estadoAnterior == estadoNuevo)
            {
                continue;
            }

            context.Set<AuditoriaCita>().Add(new AuditoriaCita { ... });

            EncolarNotificacionSiCorresponde(context, entrada.Entity, estadoNuevo, tipoActor);
        }
    }

    // Fase 7: los tres momentos de disparo son confirmar (cualquier actor) y
    // que el PERSONAL cambie el estado a uno de los otros dos terminales — no
    // Sistema (expiración, rechazo de pago), que el contrato no incluye entre
    // los tres momentos. El recordatorio no nace de una transición, así que no
    // se encola aquí: lo hace NotificacionesBackgroundService por horario.
    private static void EncolarNotificacionSiCorresponde(
        DbContext context, Cita cita, EstadoCita estadoNuevo, TipoActorAuditoria tipoActor)
    {
        TipoNotificacion? tipo = estadoNuevo switch
        {
            EstadoCita.Confirmada => TipoNotificacion.Confirmacion,
            EstadoCita.Cancelada or EstadoCita.NoAsistida when tipoActor == TipoActorAuditoria.Personal
                => TipoNotificacion.CambioEstado,
            _ => null
        };
        if (tipo is null)
        {
            return;
        }

        // La navegación ya viene cargada: todos los caminos que cambian
        // Cita.Estado obtienen la cita vía CitaRepository.GetByIdAsync, que
        // incluye Paciente.
        var destinatario = cita.Paciente?.Email;
        if (string.IsNullOrWhiteSpace(destinatario))
        {
            return;
        }

        context.Set<Notificacion>().Add(new Notificacion
        {
            CitaId = cita.Id,
            Tipo = tipo.Value,
            Canal = CanalNotificacion.Correo,
            Destinatario = destinatario,
            Estado = EstadoNotificacion.Pendiente
        });
    }
Observaciones fuertes:

Solo mira EntityState.Modified. Una cita recién creada (Added) nunca dispara nada → "documento para firma al crear una cita manual" no puede colgarse del interceptor; hay que ponerlo en CitaService.
EstadoCita.Atendida no está en el switch → hoy pasar a Atendida no manda ningún correo.
El Notificacion se agrega al mismo SaveChanges que el cambio de estado (mismo DbContext, misma transacción de BD). Ver el punto 8: una violación del índice único aquí revienta la transición de estado entera.
Punto 2 — NotificacionService.GenerarRecordatoriosPendientesAsync (recordatorio por horario)
Ya citado íntegro arriba (líneas 106-118): _context.Notificaciones.Add(new Notificacion { Tipo = TipoNotificacion.Recordatorio, ... }).

Disparadores indirectos (quiénes provocan el punto 1)
a) TransaccionService.ConfirmarAsync — c:\...\src\Application\Services\Implements\TransaccionService.cs, líneas 308-330. Éste es el "al confirmarse el pago" de tu Fase 5:


                else
                {
                    var estadoDestino = commitResult.Approved ? EstadoCita.Confirmada : EstadoCita.Cancelada;
                    var transicion = MaquinaEstadosCita.Buscar(cita.Estado, estadoDestino, ActorTransicion.Sistema)
                        ?? throw new InvalidOperationException($"No se permite llevar una cita en estado {cita.Estado} a {estadoDestino}.");

                    if (commitResult.Approved)
                    {
                        _auditReasonContext.Set("Pago confirmado vía Webpay Plus.");
                    }
                    else
                    {
                        if (transicion.EfectoBloque == EfectoBloque.Liberar)
                        {
                            await LiberarBloquesCitaAsync(cita);
                        }
                        _auditReasonContext.Set("Pago rechazado o abandonado en Webpay Plus.");
                    }
                    cita.Estado = estadoDestino;
                    cita.UpdatedAt = DateTime.UtcNow;
                    await _citaRepository.UpdateAsync(cita);
                    await dbTransaction.CommitAsync();
                }
La cita viene de _citaRepository.GetByIdAsync(transaccion.CitaId) (línea 239), que sí incluye Paciente, así que el interceptor tiene Destinatario.

b) TransaccionService.ExpirarSiCorrespondeAsync (líneas 169-200): pasa a Expirada con actor Sistema → el switch devuelve null, no encola nada. Correcto.

c) CitaService.UpdateEstadoAsync — ver punto 6.

6. CitaService.UpdateEstadoAsync (el método que cambia de estado, incl. → Atendida) — COMPLETO
c:\Users\mrcer\OneDrive\Desktop\Proyecto KineFit\kinefit-backend\api-dotnet\src\Application\Services\Implements\CitaService.cs, líneas 494-636:


    public async Task<GenericResponse<CitaEstadoActualizadoDTO>> UpdateEstadoAsync(int id, UpdateCitaEstadoDTO dto)
    {
        // 1. Buscar cita por ID
        var cita = await _citaRepository.GetByIdAsync(id);
        if (cita == null)
        {
            throw new KeyNotFoundException($"La cita con ID {id} no fue encontrada.");
        }
        _especialistaAccessGuard.VerificarAcceso(cita.EspecialistaId);
        // 2. Validar que el nuevo estado sea válido
        if (!Enum.TryParse<EstadoCita>(dto.EstadoNuevo, true, out var targetEstado))
        {
            throw new BadHttpRequestException($"El estado '{dto.EstadoNuevo}' no es un estado de cita válido.");
        }
        // Fase 1, orden corregido. Primero: ¿este estado admite ALGUNA
        // modificación manual? PendientePago no admite ninguna —es la cita con
        // Webpay en curso, que expira sola— y los terminales tampoco. Esta
        // comprobación va ANTES de la idempotencia porque, si no, pedirle a una
        // cita en PendientePago el estado que ya tiene devolvía 200 y el
        // contrato exige 422 sin excepciones.
        if (!MaquinaEstadosCita.PermiteAlgunaTransicion(cita.Estado, ActorTransicion.Usuario))
        {
            throw new UnprocessableException(
                $"Una cita en estado {cita.Estado} no es modificable manualmente.",
                "ESTADO_NO_MODIFICABLE");
        }

        // Idempotencia: si ya tiene el estado solicitado, retornar con éxito de inmediato
        if (cita.Estado == targetEstado)
        {
            var responseDto = new CitaEstadoActualizadoDTO
            {
                Id = cita.Id,
                EstadoAnterior = cita.Estado.ToString(),
                EstadoNuevo = cita.Estado.ToString(),
                UpdatedAt = cita.UpdatedAt
            };
            return GenericResponse<CitaEstadoActualizadoDTO>.Success(responseDto, "El estado de la cita ya es el solicitado.");
        }
        // 3. La máquina de estados (5.5) decide si la transición está permitida
        // para un actor de tipo Usuario. Su ausencia de la tabla —incluyendo
        // salir de un estado terminal— se interpreta uniformemente como no
        // permitida, sin necesidad de condicionales por caso.
        var transicion = MaquinaEstadosCita.Buscar(cita.Estado, targetEstado, ActorTransicion.Usuario);
        if (transicion is null)
        {
            throw new UnprocessableException($"No se permite la transición de estado desde {cita.Estado} a {targetEstado}.");
        }

        // Fase 8, ítem 4: el motivo de cancelación es obligatorio, sea cual sea
        // el origen de la cita, y se conserva en su propia columna (además de
        // fluir a la auditoría, que ya recibe dto.Motivo más abajo).
        if (targetEstado == EstadoCita.Cancelada && string.IsNullOrWhiteSpace(dto.Motivo))
        {
            throw new UnprocessableException("El motivo de cancelación es obligatorio.", "MOTIVO_CANCELACION_REQUERIDO");
        }

        string? advertencia = null;
        var anteriorEstado = cita.Estado;
        // Iniciar transacción de BD para realizar la actualización del estado y la liberación del bloque de manera atómica
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            if (transicion.EfectoBloque == EfectoBloque.Liberar)
            {
                // Libera TODOS los bloques de la cita, no solo el inicial. Es el
                // punto que el plan senalaba como mas facil de olvidar.
                await _ocupacion.LiberarAsync(cita);
                // Generar advertencia si tiene un pago aprobado asociado
                if (targetEstado == EstadoCita.Cancelada && cita.Transaccion != null && cita.Transaccion.Estado == EstadoTransaccion.Aprobado)
                {
                    advertencia = "Esta cita tiene un pago de $10.000 CLP asociado. Verifique la devolución del monto al paciente.";
                }
            }
            // El interceptor de auditoría (5.4) detecta el cambio de Estado y
            // genera la fila de AuditoriaCita automáticamente al guardar; aquí
            // solo se entrega el motivo, que es la única información que el
            // interceptor no puede deducir por sí mismo.
            _auditReasonContext.Set(dto.Motivo);
            
            OrigenConfirmacion? confirmadoPorParseado = null;
            if (targetEstado == EstadoCita.Confirmada)
            {
                confirmadoPorParseado = string.IsNullOrWhiteSpace(dto.ConfirmadoPor)
                    ? OrigenConfirmacion.Profesional
                    : Enum.TryParse<OrigenConfirmacion>(dto.ConfirmadoPor, true, out var origen)
                        ? origen
                        : throw new BadHttpRequestException(
                            $"confirmadoPor '{dto.ConfirmadoPor}' no es válido. Valores admitidos: Profesional, Correo, WhatsApp.");
            }

            if (cita.GrupoCitaId.HasValue)
            {
                var citasGrupo = await _citaRepository.GetByGrupoCitaIdAsync(cita.GrupoCitaId.Value);
                foreach (var c in citasGrupo)
                {
                    c.Estado = targetEstado;
                    c.UpdatedAt = DateTime.UtcNow;
                    if (targetEstado == EstadoCita.Cancelada)
                    {
                        c.MotivoCancelacion = dto.Motivo;
                        c.BloqueHorario.Estado = Domain.Enums.EstadoBloque.Disponible;
                        await _bloqueHorarioRepository.UpdateAsync(c.BloqueHorario);
                    }
                    if (targetEstado == EstadoCita.Confirmada)
                    {
                        c.ConfirmadoPor = confirmadoPorParseado;
                    }
                    await _citaRepository.UpdateAsync(c);
                }
            }
            else
            {
                cita.Estado = targetEstado;
                cita.UpdatedAt = DateTime.UtcNow;
                if (targetEstado == EstadoCita.Cancelada)
                {
                    cita.MotivoCancelacion = dto.Motivo;
                }
                if (targetEstado == EstadoCita.Confirmada)
                {
                    cita.ConfirmadoPor = confirmadoPorParseado;
                }
                await _citaRepository.UpdateAsync(cita);
            }

            await transaction.CommitAsync();
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
        var resultDto = new CitaEstadoActualizadoDTO
        {
            Id = cita.Id,
            EstadoAnterior = anteriorEstado.ToString(),
            EstadoNuevo = cita.Estado.ToString(),
            UpdatedAt = cita.UpdatedAt,
            Advertencia = advertencia
        };
        return GenericResponse<CitaEstadoActualizadoDTO>.Success(resultDto, "Estado de la cita actualizado correctamente.");
    }
Transición relevante, en c:\...\src\Application\Services\MaquinaEstadosCita.cs:


        new(EstadoCita.Confirmada, EstadoCita.Atendida, ActorTransicion.Usuario, EfectoBloque.Mantener),
Es decir: Atendida solo se alcanza desde Confirmada, por actor Usuario, vía UpdateEstadoAsync. No hay otro camino. EstadoCita.Atendida = 6.

Trampa de citas en grupo (crítica para el correo post-atención): cuando cita.GrupoCitaId.HasValue, se recorren todas las citas del grupo. GetByGrupoCitaIdAsync (en c:\...\src\Infrastructure\Repositories\Implements\CitaRepository.cs) hace:


    public async Task<List<Cita>> GetByGrupoCitaIdAsync(Guid grupoCitaId)
    {
        return await _context.Citas
            .Include(c => c.BloqueHorario)
            .Where(c => c.GrupoCitaId == grupoCitaId)
            .ToListAsync();
    }
No incluye Paciente. Por eso hoy, en un grupo de 3 citas, el interceptor encola una sola notificación: la de la cita ya trackeada desde GetByIdAsync (que sí trae Paciente por identity map); las otras dos caen en if (string.IsNullOrWhiteSpace(destinatario)) return;. Esa "protección contra correos duplicados" es accidental. Si en Fase 5 encolas el documento post-atención desde CitaService (donde sí tienes el paciente), vas a mandar 3 correos por una atención de 3 bloques salvo que filtres por GrupoCitaId/primera cita.

Para referencia, GetByIdAsync sí carga todo lo necesario:


    public async Task<Cita?> GetByIdAsync(int id)
    {
        return await _context.Citas
            .Include(c => c.Paciente)
            .Include(c => c.Especialista)
            .Include(c => c.BloqueHorario)
            .Include(c => c.Servicio)
            .Include(c => c.Transaccion)
            .FirstOrDefaultAsync(c => c.Id == id);
    }
Creación de cita manual (el otro disparador que pides)
Dos rutas, ambas en CitaService.cs, ninguna encola nada hoy:

CreateManualAsync(CreateCitaManualDTO dto, int usuarioPersonalId) (línea 88): crea una Cita por cada bloque, todas con el mismo GrupoCitaId, Estado = EstadoCita.PorConfirmar, Origen = OrigenCita.Manual (líneas 186-213). Acepta de 1 a 3 bloques → hasta 3 filas de cita para una sola atención.
CrearInternoAsync(...) (línea 252), usado por CreateAsync (web): Estado = origen == OrigenCita.Web ? EstadoCita.PendientePago : EstadoCita.PorConfirmar (línea 320).
7. URLs en los correos — NO EXISTE configuración de URL base del frontend
Lo digo explícitamente, porque lo verifiqué de tres formas:

Ningún correo lleva URL hoy. Redactar produce solo texto plano; no hay ni un http en los cuerpos.

Grep exhaustivo de BaseUrl|Frontend|SitioPublico|FrontendUrl|PublicUrl|ReturnUrl|localhost:3000 sobre todo api-dotnet (excluyendo bin/) devuelve una única coincidencia en código:

c:\...\src\Application\Services\Implements\TransaccionService.cs:82


var returnUrl = _config.GetValue<string>("Webpay:ReturnUrl");
appsettings.json no tiene ninguna clave Frontend, SitioPublico, App:BaseUrl ni equivalente. Lo único parecido a una URL de frontend son:


  "Webpay": {
    ...
    "ReturnUrl": "http://localhost:3000/confirmacion",
    ...
  },
  "CORS": {
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:3333"
    ]
  },
  ...
  "ResendAPIKey": "re_2wqBz72f_...",
  "EmailConfiguration": {
    "From": "KineFit <notificaciones@kinefit.cl>"
  },
(archivos: c:\...\api-dotnet\appsettings.json y c:\...\api-dotnet\appsettings.example.json; appsettings.Development.json solo tiene logging.)

Conclusión para la Fase 5: hay que crear la clave (p. ej. "Frontend": { "BaseUrl": "http://localhost:3000" }) en appsettings.json y en appsettings.example.json (el ejemplo se mantiene sincronizado en este repo), e inyectar IConfiguration en NotificacionService para que Redactar la use. Antitrampa: no reutilices Webpay:ReturnUrl — ya trae el path /confirmacion pegado.

Nota adicional: appsettings.json está versionado con secretos reales dentro (API key de Resend, key de Webpay, secret JWT, credenciales Cloudinary). Al agregar la clave nueva conviene tocar también appsettings.example.json y no empeorar eso.

8. El índice único (CitaId, Tipo) — sí existe, y sí es un problema
c:\Users\mrcer\OneDrive\Desktop\Proyecto KineFit\kinefit-backend\api-dotnet\src\Infrastructure\Data\AppDbContext.cs, líneas 151-157:


        \ Fase 7. Cada tipo de aviso ocurre a lo sumo una vez por cita: la
        // máquina de estados no permite reingresar a Confirmada ni volver a
        // Cancelada/NoAsistida una vez alcanzados. Sirve además de barrera
        // contra encolar un recordatorio duplicado.
        modelBuilder.Entity<Notificacion>()
            .HasIndex(n => new { n.CitaId, n.Tipo })
            .IsUnique();
(De paso: la línea 146 y la 151 empiezan con \ en vez de //. Compila porque C# permite… en realidad no; probablemente sea un artefacto de cómo se leyó el archivo — vale la pena que lo mires en el editor, pero no puedo confirmarlo sin escribir.)

Y la migración que lo materializa — c:\...\src\Infrastructure\Data\Migrations\20260809061043_Notificaciones.cs:


            migrationBuilder.CreateTable(
                name: "notificaciones",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    cita_id = table.Column<int>(type: "integer", nullable: false),
                    tipo = table.Column<int>(type: "integer", nullable: false),
                    canal = table.Column<int>(type: "integer", nullable: false),
                    destinatario = table.Column<string>(type: "text", nullable: false),
                    estado = table.Column<int>(type: "integer", nullable: false),
                    intentos = table.Column<int>(type: "integer", nullable: false),
                    detalle_fallo = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    enviado_en = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_notificaciones", x => x.id);
                    table.ForeignKey(
                        name: "fk_notificaciones_citas_cita_id",
                        column: x => x.cita_id,
                        principalTable: "citas",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_notificaciones_cita_id_tipo",
                table: "notificaciones",
                columns: new[] { "cita_id", "tipo" },
                unique: true);
Confirmado: tipo es integer (no ENUM nativo de Postgres), así que agregar valores al final de TipoNotificacion no requiere migración de tipo, solo cuidado de no reordenar.

La segunda migración, 20260809065545_ReintentoNotificacionesYMotivoPublico.cs, agrega proximo_intento_en timestamptz NULL.

¿Es un problema para enviar varios documentos de una misma cita?
Sí, en dos escenarios, y uno de ellos es peligroso:

Escenario A — un documento por tipo: funciona. Si agregas DocumentoFirma y DocumentoPostAtencion como dos tipos nuevos, cada cita puede tener 1 de cada uno. El índice no molesta. Este es el caso feliz.

Escenario B — varios documentos del MISMO tipo para la misma cita: BLOQUEADO. Si una cita requiere firmar dos formatos distintos (p. ej. consentimiento informado + autorización de datos, y recuerda que FormatoFicha tiene RequiereFirmaPaciente/RequiereFirmaProfesional y puede haber varios formatos activos), el índice (cita_id, tipo) permite una sola fila. El segundo INSERT viola la restricción única.

Escenario C — reenvío manual: BLOQUEADO. "El paciente no recibió el correo, reenvíaselo" es imposible: no se puede crear una segunda notificación del mismo tipo para la misma cita. Tampoco hay endpoint de reenvío (NotificacionController es solo GET, [Authorize(Policy = PolicyNames.SoloAdministrador)]).

Y el agravante que hay que tener presente: la notificación se inserta dentro del mismo SaveChanges/transacción que el cambio de estado de la cita (interceptor, línea 175). Una violación de índice único no se traduce en "no se envió el correo": lanza DbUpdateException → catch → RollbackAsync() en UpdateEstadoAsync (líneas 622-626) → la cita no cambia de estado y el endpoint devuelve 500. O sea, un duplicado de notificación impide marcar la cita como Atendida. Si el correo post-atención se encola por esta vía, cualquier reintento del personal sobre una cita que ya tuvo el documento revienta la operación entera en vez de ser idempotente.

Opciones que el índice deja abiertas, para tu planificación:

Dejar el índice como está y aceptar 1 documento por tipo por cita (escenario A puro), con un tipo de notificación por cada clase de documento.
Cambiar el índice a (CitaId, Tipo, DocumentoId) — obliga a agregar la columna DocumentoId al modelo y una migración.
Convertirlo en índice parcial (HasFilter) para que solo aplique a los tres tipos históricos, que es lo que sostiene la justificación original ("la máquina de estados no permite reingresar a Confirmada..."). Esa justificación no aplica a documentos, que sí pueden ser múltiples y reenviables.
Resumen de rutas exactas
Qué	Ruta absoluta
Enum tipo	c:\...\kinefit-backend\api-dotnet\src\Domain\Enums\TipoNotificacion.cs
Enum estado / canal	...\src\Domain\Enums\EstadoNotificacion.cs, ...\CanalNotificacion.cs
Modelo	...\src\Domain\Models\Notificacion.cs
Servicio (Redactar, reintentos)	...\src\Application\Services\Implements\NotificacionService.cs
Interfaz	...\src\Application\Services\Interfaces\INotificacionService.cs
EmailService (Resend)	...\src\Application\Services\Implements\EmailService.cs (¡en Application, no Infrastructure!)
Contrato email	...\src\Application\Services\Interfaces\IEmailSender.cs
Plantilla HTML	...\src\Application\Templates\Email\Notificacion.html
Background service	...\src\Infrastructure\BackgroundServices\NotificacionesBackgroundService.cs
Encolado real (disparadores)	...\src\Infrastructure\Interceptors\AuditingSaveChangesInterceptor.cs (líneas 142, 151-183)
Cambio de estado → Atendida	...\src\Application\Services\Implements\CitaService.cs (líneas 494-636)
Creación manual	...\src\Application\Services\Implements\CitaService.cs (líneas 88-246 y 252-365)
Confirmación de pago	...\src\Application\Services\Implements\TransaccionService.cs (líneas 227-337)
Máquina de estados	...\src\Application\Services\MaquinaEstadosCita.cs
Índice único	...\src\Infrastructure\Data\AppDbContext.cs (líneas 151-157)
Migraciones	...\src\Infrastructure\Data\Migrations\20260809061043_Notificaciones.cs y 20260809065545_ReintentoNotificacionesYMotivoPublico.cs
Config	...\api-dotnet\appsettings.json, appsettings.example.json
DI	...\api-dotnet\Program.cs (líneas 92, 95-105, 132)
Controller (solo GET)	...\src\Api\Controllers\NotificacionController.cs
Tests	c:\...\kinefit-backend\api-dotnet.Tests\NotificacionesTests.cs
Los tres agentes volvieron. Con reportes fuera del alcance, escribo el plan de F5-A a F5-E.

Write C:\Users\mrcer\.claude\plans\entra-al-backend-y-cozy-spindle.md
176 lines
# Fase 5 — Documentos del paciente y firma electrónica

## Contexto

Es el módulo que cierra el flujo clínico: el paciente paga el anticipo, firma su consentimiento en el navegador, y la profesional ve en el panel qué documentos tiene cada cita y cuáles le faltan por subir. F4-D ya dejó construido el molde (`FormatoFicha`, con `RequiereFirmaPaciente`/`RequiereFirmaProfesional` y su comentario apuntando literalmente a este módulo); acá se construye el motor que lo usa.

**Alcance decidido con el usuario:** F5-A a F5-E. **Los reportes (F5-F) quedan completamente fuera** — los toma el compañero.

**Reglas de negocio que fijó el cliente:** el consentimiento lo rellena y firma **el paciente**; la ficha clínica la llena **solo la profesional** y el paciente no la ve nunca. La cita **nunca se bloquea** por falta de documento — si el paciente no firmó en línea, firma en papel y la profesional sube el escaneo. El panel muestra cuántos documentos quedan pendientes de subir.

**Nivel de firma decidido:** firma simple con evidencia — trazo, copia congelada del texto exacto que leyó, huella criptográfica, fecha/hora e IP. Sin proveedor certificado externo.

Nota sobre "no descargable": se puede quitar el botón de descarga y servir el documento sin exponer el archivo, pero **una captura de pantalla siempre será posible**. Conviene decírselo a Diego en esos términos y no prometer más.

---

## Bloque 0 — Tres defectos que hay que corregir antes, o el módulo no funciona

Los tres los encontró la exploración verificando el código real, y los tres rompen algo de Fase 5 si se dejan.

### 0.1 El índice único de notificaciones bloquea el envío de documentos

`AppDbContext.cs` tiene `HasIndex(n => new { n.CitaId, n.Tipo }).IsUnique()`. Su justificación escrita ("la máquina de estados no permite reingresar a Confirmada") **no aplica a documentos**, que sí pueden ser varios por cita y sí se reenvían.

Y el agravante: la notificación se inserta en el **mismo `SaveChanges` y la misma transacción** que el cambio de estado de la cita (vía `AuditingSaveChangesInterceptor`). Una violación de índice único no significa "no se envió el correo": lanza `DbUpdateException` → rollback → **la cita no se puede marcar como Atendida y el endpoint devuelve 500**.

**Arreglo:** convertirlo en índice **parcial** con `.HasFilter(...)` limitado a los tres tipos históricos (Confirmacion, Recordatorio, CambioEstado), dejando los tipos de documento fuera de la restricción. Migración aditiva.

### 0.2 El interceptor de axios rompe la página pública de firma

`src/providers/axios-provider.tsx` adjunta el Bearer de la sesión de NextAuth a **toda** llamada. Dos consecuencias sobre `/documentos/[token]`:
- Si el paciente abre el enlace del correo en el mismo navegador donde una kinesióloga dejó el panel abierto, se adjunta el JWT de Personal a un endpoint anónimo, y la auditoría registra al personal en vez del paciente.
- Peor: `isSessionExpired` dispara un toast y **rechaza la promesa** — una sesión de panel caducada ajena al paciente rompe la firma.

**Arreglo:** una instancia de axios sin interceptor para el flujo público de documentos. `BaseApiService` ya acepta un segundo parámetro `httpClient` en el constructor que **hoy nadie usa** — está puesto exactamente para esto.

### 0.3 La página de retorno del pago muestra datos falsos

Verificado: el tipo del frontend (`ConfirmarTransaccionResponseData`) declara `resultado: "Aprobado" | "Rechazado"` y objetos anidados `cita`/`transaccion`, pero el backend devuelve plano (`id, citaId, buyOrder, monto, estado, estadoCita, advertencia`). Hoy, en producción:
- `result.resultado === "Rechazado"` es siempre `undefined` → **un pago rechazado se muestra como "¡Reserva y Pago Confirmados!"**
- Todos los campos del recibo caen a valores fijos: `"KF-CITA"`, `"Kinesiología"`, `$10.000`.
- `advertencia` (el caso crítico de cobro sin cita) **nunca se muestra**.

Hay que alinear el tipo con el DTO real. No es opcional: F5-C inyecta el paso de firma en esa misma pantalla y necesita leer datos reales de la respuesta.

---

## F5-A — Modelo de datos

1. **Enums nuevos** (`src/Domain/Enums/`), valores al final como manda la convención del proyecto:
   - `MomentoDocumento { TrasConfirmarReserva, AlFinalizarAtencion }`
   - `OrigenDocumento { FirmadoEnLinea, CargadoEnPapel }`
   - `EstadoDocumento { Pendiente, Completado }`
   - `TipoNotificacion` gana `DocumentoParaFirma` y `DocumentoPostAtencion`.

2. **`ServicioDocumento`**: `Id, ServicioId, FormatoFichaId, Obligatorio, Momento, CreatedAt`. Índice único `(ServicioId, FormatoFichaId)`. Patrón a copiar: `EspecialistaServicio`, la N:M que ya existe. Colección de navegación en `Servicio`.

3. **`DocumentoPaciente`**: `Id, CitaId, PacienteId, FormatoFichaId, Contenido (jsonb?), CuerpoCongelado, HuellaDocumento, Origen, Estado, FirmaPacienteRuta?, FirmadoPacienteEn?, FirmaUsuarioId?, FirmadoProfesionalEn?, ArchivoEscaneadoRuta?, TokenAcceso?, TokenExpiraEn?, TokenUsadoEn?, IpOrigen?, CreatedAt, UpdatedAt`.
   - Índice único **parcial** sobre `TokenAcceso` donde no es nulo.
   - `CuerpoCongelado` guarda el texto exacto mostrado al firmante: para un formato de constructor es el JSON de secciones/campos; para uno de documento, la referencia al PDF (que es inmutable: `ActualizarAsync` de formato no reemplaza el archivo). `HuellaDocumento` es su SHA-256. **Sin esto, editar un formato deja todas las firmas anteriores apuntando a un documento que nadie firmó.**

4. **`UsuarioPersonal.FirmaRutaInterna`** (string?) — la profesional dibuja su firma una vez en su perfil y el sistema la estampa en cada documento.

5. **`Cita` gana navegación inversa a `Venta`** (`ICollection<Venta>`), hoy inexistente. Sin ella no hay forma de saber si una cita tiene el pago total registrado, que es uno de los cuatro hitos del tablero.

6. **Almacenamiento**: trazos de firma, escaneos y documentos generados van a `IAlmacenamientoArchivosService` (disco del servidor, ruta opaca), **nunca a Cloudinary** — son datos de salud. Ya quedó con volumen persistente en el fix de F4-D.

7. **Migraciones** (`-o src/Infrastructure/Data/Migrations`, una sola corrida — la segunda de un par siempre sale vacía): `AddDocumentosPaciente` (las dos tablas nuevas + `FirmaRutaInterna` + el índice parcial de notificaciones del Bloque 0.1).

8. **Auditoría**: agregar `DocumentoPaciente` y `ServicioDocumento` a `EntidadesVigiladas` del interceptor — una línea cada uno, sin escribir código de auditoría a mano.

---

## F5-B — Endpoints

`DocumentoPacienteController` (`api/documentos`), sin `[Authorize]` a nivel de clase (mezcla por método, como `TransaccionController`):

| Método | Ruta | Autorización |
|---|---|---|
| GET | `/publico/{token}` | Anónimo |
| POST | `/publico/{token}/firmar` | Anónimo |
| GET | `/cita/{citaId}` | SoloPersonal |
| POST | `/{id}/firma-profesional` | SoloPersonal |
| POST | `/{id}/escaneo` | SoloPersonal |
| GET | `/{id}/archivo` | SoloPersonal |
| GET | `/pendientes` | SoloPersonal |

**Reglas de negocio en `DocumentoPacienteService`:**
- Token de un solo uso: al firmar se sella `TokenUsadoEn` y deja de servir.
- Expira al llegar la hora de la cita o al cargarse el escaneo, lo que ocurra primero.
- La firma del profesional solo se acepta si el paciente ya firmó.
- Un documento de origen escaneo no admite firma digital del profesional; uno firmado en línea no admite carga de escaneo, y a la inversa.
- La entrega pública **nunca** incluye datos clínicos ajenos al documento, ni el id interno de cita o paciente.

**Generación del token:** `RandomNumberGenerator.GetBytes(32)` (patrón de `PasswordHasher`) + **Base64Url**. Ojo: `Convert.ToBase64String` produce `+`, `/` y `=`, que no son aptos para URL — usar `Base64UrlEncoder` de `Microsoft.IdentityModel.Tokens`, que el proyecto ya referencia.

**Rate limiting:** no existe nada en `Program.cs`. Agregar `AddRateLimiter` con una política por IP aplicada **solo** a los dos endpoints públicos (`RequireRateLimiting`), para que un intento de fuerza bruta sobre el token no tenga barra libre.

**Dónde se generan los documentos** — dos disparadores, porque el interceptor no sirve para ambos:
- **Pago aprobado**: en `TransaccionService.ConfirmarAsync`, dentro de la rama `if (commitResult.Approved)`, **antes** del `dbTransaction.CommitAsync()` — es el único punto donde se sabe que el reclamo atómico se ganó, que Webpay aprobó, y que seguimos dentro de la transacción abierta. **No** generar documentos en la rama donde el reclamo falla (ahí el pago pudo aprobarse pero la cita quedó Expirada; ese camino ya emite `LogCritical`).
- **Cita manual**: en `CitaService.CreateManualAsync`. El interceptor **no sirve** acá porque solo observa `EntityState.Modified` y una cita recién creada es `Added`.

**Trampa de citas en grupo:** `CreateManualAsync` crea una `Cita` por bloque con el mismo `GrupoCitaId` (hasta 3 por atención). Hay que generar los documentos **una sola vez por grupo**, o una atención de 90 minutos produce tres juegos de documentos y tres correos.

---

## F5-C — Página pública de firma

1. **Ruta nueva** en un grupo propio, `src/app/(documentos)/documentos/[token]/`, con su `layout.tsx` mínimo. Motivo: el `layout.tsx` de `(public)` envuelve todo con Navbar, Footer y botón de WhatsApp, y un layout anidado no puede quitar el del padre. Para leer y firmar un documento legal en el celular queremos pantalla limpia y sin salidas laterales. El layout lleva `robots: { index: false, follow: false }`, y hay que excluir `/documentos` de `src/app/robots.ts` y `sitemap.ts`.

2. **Vista** en `src/views/app/(public)/documentos/`: presentación del documento con desplazamiento, campos del paciente cuando el formato los declara (`CompletadoPor.Paciente`), y recuadro de captura de firma.

3. **Captura de firma**: `<canvas>` con eventos de puntero (`pointerdown`/`pointermove`/`pointerup`), que funciona con el dedo en móvil. No hay librería de firma en `package.json` y no hace falta agregar una — son unas 60 líneas. Exportar como PNG (`toBlob`) y subirlo al endpoint.

4. **Sin descarga ni exportación** para el paciente, según pidió el cliente.

5. **Servicio y hook** (`documento-service.ts`, `use-documento-service.ts`) usando la instancia de axios **sin interceptor** del Bloque 0.2.

6. **Retorno del pago**: en `src/app/(public)/pago/confirmar/page.tsx`, tras arreglar el contrato (Bloque 0.3), si la cita generó documentos pendientes de firma, ofrecer firmarlos en el momento reutilizando la misma vista con la sesión iniciada en lugar del token.

---

## F5-D — Documentos en el panel

1. **Pestaña de documentos en el detalle de cita**: el punto de inserción es el componente interno `DetalleCita` de `appointment-detail-modal.tsx`, hoy un layout plano de dos columnas sin sistema de pestañas (hay que introducir estado local para las tabs). Muestra estado de cada documento, acceso al firmado, acción de estampar firma profesional y acción de cargar escaneo.

2. **Tablero de hitos** con los cuatro estados que pidió el cliente, cada uno con su acción:
   - *Anticipo pagado* — ya derivable de `CitaDetalleDTO.Transaccion`.
   - *Pago total registrado* — **requiere** la navegación `Cita → Venta` de F5-A y un sub-DTO nuevo; hoy no existe.
   - *Documentos firmados* — de `DocumentoPaciente`.
   - *Recomendaciones enviadas* — de `Notificacion` con el tipo nuevo y `Estado == Enviada`; con acción de reenviar si no salieron.

3. **Conteo de documentos pendientes** en el armazón del panel. El sidebar no consume ningún hook de datos hoy: se agrega un campo opcional al ítem de navegación y el badge va como tercer hijo del `<Link>` con `ml-auto`.

4. **Firma de la profesional en su perfil**: la captura de `FirmaRutaInterna`, reutilizando el mismo componente de canvas de F5-C.

5. **Documentos exigidos por servicio** en `servicio-modal.tsx`: tabla de formatos disponibles con casilla de obligatoriedad y selector de momento (antes de la cita / al finalizar la atención), más acceso directo a crear un formato si no existe. Va después del bloque de descripción, que es el único patrón de fila completa del grid. Toca también `use-servicios.ts` (estado, reset en abrir/crear/editar, payload) y los DTOs de servicio.

---

## F5-E — Correos

1. **`TipoNotificacion`** gana los dos tipos nuevos (al final del enum; la columna es `integer`, no enum nativo, así que no hay migración de tipo).

2. **`NotificacionService.Redactar`** gana sus dos brazos. Tres cuidados verificados:
   - Hoy es `private static` y solo recibe la `Notificacion`. Para incluir la URL hay que volverlo método de instancia e **inyectar `IConfiguration`** (el constructor hoy solo recibe `AppDbContext` e `IEmailSender`).
   - El `_` del switch **lanza excepción**, dentro del `foreach` de `ProcesarPendientesAsync` y fuera de try/catch: olvidar un brazo tumba **toda** la pasada de notificaciones, no solo la del tipo nuevo. Conviene además cambiar ese `_` por registrar y saltar.
   - `ProcesarPendientesAsync` solo hace `.Include(n => n.Cita).ThenInclude(c => c.Paciente)`. Si el cuerpo necesita servicio o especialista, hay que agregar los `Include` o llegan nulos.

3. **URL base del frontend**: **no existe ninguna configuración de este tipo** en el proyecto. Crear `Frontend:BaseUrl` en `appsettings.json` y en `appsettings.example.json`. No reutilizar `Webpay:ReturnUrl`, que ya trae `/confirmacion` pegado.

4. **El enlace**: la plantilla `Notificacion.html` inyecta `{{CUERPO}}` como HTML crudo, así que un `<a href>` desde `Redactar` renderiza bien sin tocar la plantilla ni `IEmailSender`. Corolario de seguridad: ese mismo camino ya mete `cita.NotaPaciente` sin sanitizar en el HTML del correo — al construir el enlace, no concatenar datos escritos por el usuario.

5. **Disparadores**: al confirmarse el pago y al crear cita manual (los mismos puntos de F5-B), y al pasar la cita a **Atendida** para el correo post-atención. Ojo: `EstadoCita.Atendida` **no está** hoy en el switch del interceptor, así que ese caso no manda ningún correo actualmente. Y `GetByGrupoCitaIdAsync` no incluye `Paciente`, lo que hoy evita correos duplicados en citas de grupo **por accidente** — al encolar desde `CitaService` (donde el paciente sí está cargado) hay que filtrar por grupo explícitamente o se mandan tres correos.

6. **El correo lleva un enlace, nunca el documento adjunto.**

---

## Fuera de alcance

- **Reportes (F5-F)**: los toma el compañero.
- **Los adjuntos clínicos no se suben de verdad** (`FileDropzone` descarta el archivo real y sube un `.txt` de 9 bytes). Es del módulo de fichas, ya anotado en F4-D, y sigue pendiente.

## Regla de comentarios

Comentarios de una sola línea; si no entra, se descarta. No se nombran fases ni planes internos en el código: los comentarios explican el código y nada más.

## Verificación

- **Backend**: `dotnet build` limpio y `dotnet test` sin regresiones (hoy 209/210, con una falla preexistente en `Fase8Tests` por huso horario, ajena a este módulo). Tests nuevos sobre las reglas que son de evidencia legal: token de un solo uso, expiración por hora de cita, firma del profesional rechazada si el paciente no firmó, y exclusión mutua entre firma en línea y escaneo.
- **Flujo completo manual**: asignar un consentimiento a un servicio → reservar y pagar → confirmar que aparece el paso de firma en el retorno del pago y que llega el correo con el enlace → firmar desde el celular → verificar en el panel que el documento figura firmado y que el hito se marcó → estampar la firma profesional → confirmar que el token ya no sirve.
- **Camino de papel**: no firmar en línea, marcar la cita atendida, subir el escaneo desde el panel y confirmar que el contador de pendientes baja.
- **Frontend**: `npx tsc --noEmit` y `npm run build` limpios.
- **Regresión del Bloque 0.3**: forzar un pago rechazado y confirmar que la pantalla ya no dice "¡Reserva y Pago Confirmados!".
Claude’s Plan C:\Users\mrcer\.claude\plans\entra-al-backend-y-cozy-spindle.md
User approved the plan
Plan aprobado. Antes de arrancar, el resumen de lo que voy a hacer y en qué orden:

Bloque 0 (primero, son bloqueantes): índice parcial de notificaciones, instancia de axios sin interceptor para el flujo público, y el arreglo del contrato de la pantalla de retorno del pago — que hoy muestra "¡Reserva y Pago Confirmados!" incluso cuando el pago fue rechazado.

Después: modelo (F5-A) → endpoints y reglas de firma (F5-B) → página pública de firma (F5-C) → panel y tablero de hitos (F5-D) → correos (F5-E).

Dos cosas que te anticipo para que no te sorprendan cuando aparezcan:

Esto no entra en una sesión. Fase 5 es bastante más grande que F4-D: son dos tablas nuevas, siete endpoints, una página pública nueva con captura de firma, pestañas en el detalle de cita, y dos tipos de correo. Voy a ir por bloques, compilando y verificando en cada uno, y te aviso al cerrar cada parte para que puedas revisar o frenar.

Voy a tocar TransaccionService.ConfirmarAsync, que es código de dinero y concurrencia (tiene reclamo atómico y una rama que ya emite LogCritical). Me voy a meter solo en la rama donde el pago está aprobado y el reclamo se ganó, sin tocar la lógica de reclamo ni de expiración.

¿Arranco con el Bloque 0?

arranca, siguiendo las reglas y produciendo codigo limpio
Empiezo con el Bloque 0.1 — el índice de notificaciones.

Read C:\Users\mrcer\OneDrive\Desktop\Proyecto KineFit\kinefit-backend\api-dotnet\src\Infrastructure\Data\AppDbContext.cs (lines 145-164)
El archivo está bien (sin el artefacto que reportó la exploración). Cambio el índice a parcial.

Edit C:\Users\mrcer\OneDrive\Desktop\Proyecto KineFit\kinefit-backend\api-dotnet\src\Infrastructure\Data\AppDbContext.cs
Edit failed
/model sonnet
Set model to Sonnet 5 for this session only

/effort xhigh
Set effort level to xhigh (this session only): Deeper reasoning than high, just below maximum (Fable 5, Opus 4.7+, Sonnet 5)

porfavor ya empezaste a producir codigo basura, mira toda esa basura de comentarios, porfavor borra todo eso y sigue el plan
Tenés razón, rompí la regla de comentarios de una sola línea otra vez. Corrijo.

Edit C:\Users\mrcer\OneDrive\Desktop\Proyecto KineFit\kinefit-backend\api-dotnet\src\Infrastructure\Data\AppDbContext.cs
Removed 2 lines
tambien evita usar "." en los comentarios
You've hit your session limit · resets 9pm (America/Santiago)

You've hit your session limit · resets 9pm (America/Santiago)

/model sonnet
Set model to Sonnet 5 for this session only

/effort medium
Set effort level to medium (this session only): Balanced approach with standard implementation and testing

espera aprovechando q alcanzamos el limite, quiero que me entregues el plan completo para la fase final, lo hare yo con otra ia
Read C:\Users\mrcer\.claude\projects\c--Users-mrcer-OneDrive-Desktop-Proyecto-KineFit-kinefit-frontend\memory\feedback_comentarios_codigo.md
Edit C:\Users\mrcer\.claude\projects\c--Users-mrcer-OneDrive-Desktop-Proyecto-KineFit-kinefit-frontend\memory\feedback_comentarios_codigo.md
Added 3 lines
Regla guardada en memoria. Acá está el plan completo de la Fase 5 (documentos del paciente y firma electrónica), listo para que lo ejecutes con otra IA:

Read C:\Users\mrcer\.claude\plans\entra-al-backend-y-cozy-spindle.md
Edit C:\Users\mrcer\.claude\plans\entra-al-backend-y-cozy-spindle.md
Added 4 lines
Listo. El plan completo queda guardado en C:\Users\mrcer\.claude\plans\entra-al-backend-y-cozy-spindle.md. Contenido:

Fase 5 — Documentos del paciente y firma electrónica
Contexto
Es el módulo que cierra el flujo clínico: el paciente paga el anticipo, firma su consentimiento en el navegador, y la profesional ve en el panel qué documentos tiene cada cita y cuáles le faltan por subir. F4-D ya dejó construido el molde (FormatoFicha, con RequiereFirmaPaciente/RequiereFirmaProfesional); acá se construye el motor que lo usa.

Alcance: F5-A a F5-E. Reportes (F5-F) quedan completamente fuera — los toma tu compañero.

Reglas de negocio del cliente: el consentimiento lo rellena y firma el paciente; la ficha clínica la llena solo la profesional, el paciente no la ve nunca. La cita nunca se bloquea por falta de documento — si no firma en línea, firma en papel y la profesional sube el escaneo. El panel muestra cuántos documentos quedan pendientes.

Nivel de firma: simple con evidencia — trazo, copia congelada del texto exacto leído, huella criptográfica, fecha/hora e IP. Sin proveedor certificado externo.

Nota "no descargable": se puede quitar el botón de descarga, pero una captura de pantalla siempre será posible — no prometer más que eso.

Estado de avance
Bloque 0.1 ya resuelto (índice parcial en AppDbContext.cs); falta generar y aplicar la migración. Todo lo demás sigue sin empezar.

Bloque 0 — Defectos a corregir antes
0.1 Índice único de notificaciones — bloqueaba reenvíos/documentos porque la notificación se inserta en la misma transacción que el cambio de estado de cita; una violación de índice tumba el guardado completo. Arreglo: índice parcial .HasFilter("tipo IN (0, 1, 2)"), dejando fuera los tipos de documento. (Ya aplicado en código, falta migrar.)

0.2 Interceptor de axios rompe la firma pública — axios-provider.tsx adjunta el Bearer de NextAuth a toda llamada; rompe /documentos/[token] si hay sesión de panel abierta o vencida. Arreglo: instancia de axios sin interceptor, usando el segundo parámetro httpClient de BaseApiService que hoy nadie usa.

0.3 Retorno de pago muestra datos falsos — el tipo ConfirmarTransaccionResponseData no coincide con el DTO real del backend; un pago rechazado hoy se muestra como aprobado. Hay que alinear el tipo con la respuesta plana real (id, citaId, buyOrder, monto, estado, estadoCita, advertencia).

F5-A — Modelo de datos
Enums nuevos (MomentoDocumento, OrigenDocumento, EstadoDocumento, + 2 valores en TipoNotificacion); tabla ServicioDocumento (N:M Servicio↔FormatoFicha); tabla DocumentoPaciente (con CuerpoCongelado+HuellaDocumento SHA-256, token de acceso, firma paciente/profesional, escaneo); UsuarioPersonal.FirmaRutaInterna; navegación inversa Cita→Venta; todo a disco vía IAlmacenamientoArchivosService, nunca Cloudinary; una sola migración AddDocumentosPaciente; alta en EntidadesVigiladas.

F5-B — Endpoints
DocumentoPacienteController con endpoints públicos (/publico/{token}, /publico/{token}/firmar) y de panel (/cita/{citaId}, /{id}/firma-profesional, /{id}/escaneo, /{id}/archivo, /pendientes). Reglas: token de un solo uso, expira con la hora de cita o al cargar escaneo, firma profesional solo si el paciente ya firmó, exclusión mutua firma-en-línea/escaneo. Token con RandomNumberGenerator+Base64Url. Rate limiting por IP solo en los 2 endpoints públicos. Generación de documentos en dos disparadores: TransaccionService.ConfirmarAsync (antes del commit, solo si aprobado) y CitaService.CreateManualAsync (una sola vez por GrupoCitaId).

F5-C — Página pública de firma
Grupo de rutas propio (documentos)/documentos/[token]/ sin navbar/footer, robots: noindex. Vista con presentación del documento, campos del paciente si aplica, canvas de firma (Pointer Events, ~60 líneas, sin librería). Sin descarga. Servicio/hook con la instancia de axios sin interceptor. Integración en el retorno de pago para firmar en el momento si hay documentos pendientes.

F5-D — Panel
Pestaña de documentos en el detalle de cita; tablero de 4 hitos (anticipo pagado, pago total, documentos firmados, recomendaciones enviadas); contador de pendientes en el sidebar; firma de la profesional en su perfil; configuración de documentos exigidos por servicio en servicio-modal.tsx.

F5-E — Correos
2 tipos nuevos de notificación; Redactar pasa a método de instancia con IConfiguration inyectada; nueva config Frontend:BaseUrl; enlace (nunca adjunto) sin concatenar datos sin sanitizar; disparadores en pago aprobado, cita manual y transición a Atendida (hoy inexistente en el interceptor); cuidado con no duplicar correos en citas de grupo.

Fuera de alcance
Reportes (F5-F, del compañero); adjuntos clínicos reales en FileDropzone (deuda ya anotada en F4-D).

Regla de comentarios
Una sola línea, sin punto ni al final ni en medio, sin nombrar fases ni planes internos.

Verificación
dotnet build/test sin regresiones nuevas; tests de las reglas de evidencia legal (token único, expiración, orden de firmas, exclusión mutua); flujo manual completo de firma en línea y de papel; tsc --noEmit/npm run build limpios; regresión del pago rechazado.

Cualquier otra IA que tome esto tiene todo el contexto necesario para ejecutar sin volver a auditar el repo desde cero.