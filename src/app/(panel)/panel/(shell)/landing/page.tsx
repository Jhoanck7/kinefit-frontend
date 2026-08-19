import { redirect } from "next/navigation";

export default function LandingPage() {
  redirect("/panel/configuracion?tab=landing");
}
