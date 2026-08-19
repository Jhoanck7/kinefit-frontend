import { CLINIC_INFO } from "@/lib/utils";
import { especialistaService, landingConfigService } from "@/services";
import { HomeView } from "@/views";

export const revalidate = 60;

export default async function Home() {
  const landingRes = await landingConfigService.getConfig().catch(() => null);
  const especialistasRes = await especialistaService
    .getEspecialistas(undefined, true)
    .catch(() => null);

  const config = landingRes?.data?.data ?? {
    heroTagline: "",
    heroBrandName: CLINIC_INFO.name,
    heroDescription: CLINIC_INFO.tagline,
    heroCtaText: "Reservar Cita",
    clinicName: CLINIC_INFO.name,
    clinicEmail: CLINIC_INFO.email,
    clinicPhone: CLINIC_INFO.phone,
    clinicPhoneRaw: CLINIC_INFO.phoneRaw,
    clinicAddress: CLINIC_INFO.address,
    hoursWeekday: CLINIC_INFO.hours.weekday,
    hoursSaturday: CLINIC_INFO.hours.saturday,
    socialInstagram: CLINIC_INFO.socials.instagram,
    socialFacebook: CLINIC_INFO.socials.facebook,
    socialWhatsApp: CLINIC_INFO.socials.whatsapp,
    socialTikTok: CLINIC_INFO.socials.tiktok,
  };

  const specialists = especialistasRes?.data?.data ?? [];

  return <HomeView config={config} specialists={specialists} />;
}
