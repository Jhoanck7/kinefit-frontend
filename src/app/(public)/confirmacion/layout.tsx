import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confirmando tu pago",
  description: "Confirmación del pago de tu reserva en KineFit Chile.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ConfirmacionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
