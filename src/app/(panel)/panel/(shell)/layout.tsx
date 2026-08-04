import { PanelShell } from "@/components/panel/chrome/PanelShell";

export default function PanelShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PanelShell>{children}</PanelShell>;
}
