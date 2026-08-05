import { NextRequest, NextResponse } from "next/server";
import { getUserPermissions } from "@/lib/auth/permissions";
import { saveMusicaPasse } from "@/lib/musica-passes";
import { removeMusicaPasseAudio, uploadMusicaPasseAudio } from "@/lib/musica-passes-storage";

const PASSES_PROFILES = ["diretoria", "secretaria", "comunicacao"];

function canManagePasses(permissions: Awaited<ReturnType<typeof getUserPermissions>>) {
  return Boolean(
    permissions &&
      (permissions.perfil === "administrador" ||
        PASSES_PROFILES.includes(permissions.perfil) ||
        permissions.pode_publicar),
  );
}

export async function POST(request: NextRequest) {
  const permissions = await getUserPermissions();
  if (!canManagePasses(permissions)) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (error) {
    console.error("Falha ao ler upload de passe:", error);
    return NextResponse.json(
      { error: "O áudio excede o limite de 50 MB ou o envio foi interrompido." },
      { status: 413 },
    );
  }
  const titulo = String(formData.get("titulo") || "").trim();
  const audio = formData.get("audio");

  if (!titulo || !(audio instanceof File) || audio.size === 0) {
    return NextResponse.json({ error: "Informe o título e selecione um MP3." }, { status: 400 });
  }

  const uploaded = await uploadMusicaPasseAudio(audio);
  if (!uploaded.success || !uploaded.url) {
    return NextResponse.json({ error: uploaded.error || "Não foi possível enviar o áudio." }, { status: 400 });
  }

  try {
    await saveMusicaPasse({ titulo, audio_url: uploaded.url, ativo: true });
  } catch (error) {
    await removeMusicaPasseAudio(uploaded.url);
    console.error("Falha ao salvar passe após upload:", error);
    return NextResponse.json({ error: "Não foi possível salvar o passe." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
