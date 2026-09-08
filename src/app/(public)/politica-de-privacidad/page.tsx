import type { Metadata } from "next";

import { Card } from "@/components/ui";
import { landingConfigService } from "@/services";

export const metadata: Metadata = {
  title: "Política de Privacidad | KineFit Chile",
  description:
    "Cómo KineFit Chile recopila, usa y protege los datos personales de sus pacientes.",
};

export const revalidate = 60;

function Seccion({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="border-b border-slate-200 pb-2 mb-3 font-sans text-sm font-bold uppercase tracking-wider text-slate-900">
        {titulo}
      </h2>
      <div className="font-sans text-sm text-slate-700 leading-relaxed space-y-3">
        {children}
      </div>
    </div>
  );
}

export default async function PoliticaDePrivacidadPage() {
  const configRes = await landingConfigService.getConfig().catch(() => null);
  const clinicEmail =
    configRes?.data?.data?.clinicEmail || "contacto@kinefitchile.com";
  const clinicName = configRes?.data?.data?.clinicName || "KineFit Chile";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="font-sans text-lg font-bold text-slate-900">
          Política de Privacidad
        </h1>
        <p className="mt-1 font-sans text-xs text-slate-500">
          Última actualización: agosto de 2026
        </p>
      </div>

      <Card className="border border-slate-200 rounded-none p-6 sm:p-8 space-y-8">
        <Seccion titulo="Quiénes tratan tus datos">
          <p>
            {clinicName} es responsable del tratamiento de los datos personales
            que recopila a través de su sitio web, su formulario de reserva y su
            atención presencial.
          </p>
        </Seccion>

        <Seccion titulo="Qué datos recopilamos">
          <p>
            Nombre, apellido, correo electrónico, teléfono y RUT al reservar una
            hora o crear una cuenta. Si asistes a una atención, además
            registramos los datos clínicos que tu especialista ingresa en tu
            ficha (motivo de consulta, evaluación, evolución y documentos
            asociados a esa atención).
          </p>
        </Seccion>

        <Seccion titulo="Para qué los usamos">
          <p>
            Para gestionar tu reserva y el pago asociado, prestarte atención
            kinesiológica, contactarte por confirmaciones o recordatorios de tu
            hora, y llevar el registro clínico que exige la normativa de salud
            aplicable.
          </p>
          <p>
            No vendemos ni compartimos tus datos con terceros para fines
            publicitarios. Solo los compartimos con los proveedores
            estrictamente necesarios para operar el servicio: la pasarela de
            pago para procesar el cobro de tu reserva, y el proveedor de correo
            que envía tus confirmaciones y recordatorios.
          </p>
        </Seccion>

        <Seccion titulo="Cómo protegemos tus datos">
          <p>
            Tus datos viajan cifrados entre tu navegador y nuestros servidores.
            El acceso a tu información clínica está restringido al personal del
            centro autorizado para atenderte, y cada acceso queda registrado.
          </p>
        </Seccion>

        <Seccion titulo="Tus derechos">
          <p>
            Podés solicitar el acceso, la rectificación o la eliminación de tus
            datos personales escribiendo a{" "}
            <a
              href={`mailto:${clinicEmail}`}
              className="text-brand-primary underline underline-offset-2"
            >
              {clinicEmail}
            </a>
            . Hoy gestionamos estas solicitudes de forma manual: te
            confirmaremos por el mismo correo cuando la resolvamos.
          </p>
        </Seccion>

        <Seccion titulo="Marco legal">
          <p>
            Este tratamiento se rige por la Ley N° 19.628 sobre Protección de la
            Vida Privada, y se ajustará a la Ley N° 21.719 a medida que entre en
            vigencia.
          </p>
        </Seccion>
      </Card>
    </div>
  );
}
