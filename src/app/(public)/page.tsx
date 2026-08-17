import { especialistaService, landingConfigService } from "@/services";
import { HomeView } from "@/views";

export default async function Home() {
  const landingRes = await landingConfigService.getConfig().catch(() => null);
  const especialistasRes = await especialistaService
    .getEspecialistas(undefined, true)
    .catch(() => null);

  const config = landingRes?.data?.data ?? {
    heroTagline: "",
    heroBrandName: "KineFit",
    heroDescription: "Centro de Kinesiología y Fisioterapia Especializada.",
    heroCtaText: "Reservar Cita",
    clinicName: "KineFit Clínica",
    clinicEmail: "contacto@kinefit.cl",
    clinicPhone: "+56 9 1234 5678",
    clinicPhoneRaw: "+56912345678",
    clinicAddress: "Av. Providencia 1234, Oficina 501, Santiago",
    hoursWeekday: "Lunes a Viernes: 08:00 - 20:00",
    hoursSaturday: "Sábados: 09:00 - 14:00",
    socialInstagram: "https://instagram.com/kinefit",
    socialFacebook: "https://facebook.com/kinefit",
    socialWhatsApp: "https://wa.me/56912345678",
    socialTikTok: "https://tiktok.com/@kinefit",
  };

  const specialists = especialistasRes?.data?.data ?? [];

  return <HomeView config={config} specialists={specialists} />;
}
