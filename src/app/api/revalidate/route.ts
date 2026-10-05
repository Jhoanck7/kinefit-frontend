import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/** Invalida la caché de la página de inicio para que vuelva a generarse */
export async function POST() {
  revalidatePath("/");
  return NextResponse.json({ revalidated: true });
}
