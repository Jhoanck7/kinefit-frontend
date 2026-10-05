import { PanelShell } from "@/components/layout/panel-shell";

/** Envuelve las páginas internas del panel con el sidebar y el header comunes */
export default function PanelShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PanelShell>{children}</PanelShell>;
}
