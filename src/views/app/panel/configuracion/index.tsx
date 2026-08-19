"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Suspense } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";

import EmpresasView from "./empresas";
import EspecialistasView from "./especialistas";
import HorariosView from "./horarios";
import LandingView from "./landing";
import ServiciosView from "./servicios";

const TABS = [
  { valor: "landing", etiqueta: "Landing" },
  { valor: "especialistas", etiqueta: "Especialistas" },
  { valor: "servicios", etiqueta: "Servicios" },
  { valor: "empresas", etiqueta: "Empresas" },
  { valor: "horarios", etiqueta: "Horarios" },
] as const;

type TabValor = (typeof TABS)[number]["valor"];

function esTabValida(valor: string | null): valor is TabValor {
  return TABS.some(t => t.valor === valor);
}

function ConfiguracionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const esAdministrador = session?.user.rol === "Administrador";

  const tabsVisibles = esAdministrador
    ? TABS
    : TABS.filter(t => t.valor === "horarios");

  const tabParam = searchParams.get("tab");
  const tabActiva: TabValor =
    esTabValida(tabParam) && tabsVisibles.some(t => t.valor === tabParam)
      ? tabParam
      : tabsVisibles[0].valor;

  function cambiarTab(valor: string) {
    router.replace(`/panel/configuracion?tab=${valor}`);
  }

  return (
    <Tabs value={tabActiva} onValueChange={cambiarTab} className="gap-0">
      <TabsList
        variant="line"
        className="w-full justify-start gap-6 rounded-none border-b border-slate-200 bg-transparent p-0 h-auto"
      >
        {tabsVisibles.map(({ valor, etiqueta }) => (
          <TabsTrigger
            key={valor}
            value={valor}
            className="rounded-none border-0 px-1 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 data-active:bg-transparent data-active:text-blue-900 data-active:shadow-none after:bg-blue-900"
          >
            {etiqueta}
          </TabsTrigger>
        ))}
      </TabsList>

      {esAdministrador && (
        <>
          <TabsContent value="landing" className="pt-6">
            <LandingView />
          </TabsContent>
          <TabsContent value="especialistas" className="pt-6">
            <EspecialistasView />
          </TabsContent>
          <TabsContent value="servicios" className="pt-6">
            <ServiciosView />
          </TabsContent>
          <TabsContent value="empresas" className="pt-6">
            <EmpresasView />
          </TabsContent>
        </>
      )}
      <TabsContent value="horarios" className="pt-6">
        <HorariosView />
      </TabsContent>
    </Tabs>
  );
}

export default function ConfiguracionView() {
  return (
    <Suspense fallback={<div aria-hidden />}>
      <ConfiguracionContent />
    </Suspense>
  );
}
