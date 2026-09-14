import {
  EspecialistaResponse,
  LandingConfigResponse,
} from "@/models/responses";

import {
  AboutSection,
  EmbarazadasSection,
  HeroSection,
  LocationSection,
  ProcessSection,
  TeamSection,
  TestimonialsSection,
  VouchersSection,
} from "./components";

interface HomeViewProps {
  config: LandingConfigResponse;
  specialists: EspecialistaResponse[];
}

export default function HomeView({ config, specialists }: HomeViewProps) {
  return (
    <main>
      <HeroSection config={config} />
      <AboutSection config={config} />
      <TeamSection config={config} initialTeam={specialists} />
      <TestimonialsSection config={config} />
      <ProcessSection config={config} />
      <VouchersSection config={config} />
      <EmbarazadasSection config={config} />
      <LocationSection config={config} />
    </main>
  );
}
