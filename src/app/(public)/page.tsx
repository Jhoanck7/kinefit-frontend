import { getLandingConfig } from "@/lib/panel/data/landing-config";
import { especialistaService } from "@/services";
import { HomeView } from "@/views";

export default async function Home() {
  // SSR: Obtener toda la configuración de la Landing Page desde el servidor
  // una sola vez antes de renderizar (evita múltiples peticiones desde el cliente)
  const config = await getLandingConfig();
  const especialistasRes = await especialistaService.getEspecialistas(
    undefined,
    true
  );
  const specialists = especialistasRes.data.data;

  return <HomeView config={config} specialists={specialists} />;
}
