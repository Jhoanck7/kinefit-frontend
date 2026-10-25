import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/** Invalida la caché de la página de inicio y de los documentos legales para que vuelvan a generarse */
export async function POST() {
  revalidatePath("/");
  revalidatePath("/terminos-y-condiciones");
  revalidatePath("/politica-de-privacidad");
  return NextResponse.json({ revalidated: true });
}
