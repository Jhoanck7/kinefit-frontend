import { PanelShell } from "@/components/layout/panel-shell";

export default function PanelShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PanelShell>{children}</PanelShell>;
}
