import { NextResponse } from "next/server";
import { getMusicaExibicaoPublicaAtual } from "@/lib/musicas";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const data = await getMusicaExibicaoPublicaAtual();

  if (!data) {
    return NextResponse.json(
      { sessao: null, musica: null },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }

  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
