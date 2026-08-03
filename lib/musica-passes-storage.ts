import { createServiceRoleClient } from "@/lib/supabase/service-role";

const AUDIO_BUCKET = "instituicao-assets";
const MAX_AUDIO_SIZE = 50 * 1024 * 1024;

function sanitizeFileName(fileName: string) {
  const normalized = fileName.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  const baseName = normalized.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return baseName.toLowerCase().endsWith(".mp3") ? baseName.toLowerCase() : `${baseName || "audio"}.mp3`;
}

export async function uploadMusicaPasseAudio(file: File) {
  if (!file || file.size === 0) {
    return { success: false, error: "Selecione um arquivo MP3." };
  }

  if (file.size > MAX_AUDIO_SIZE) {
    return { success: false, error: "O arquivo deve ter no máximo 50 MB." };
  }

  if (file.type !== "audio/mpeg" && !file.name.toLowerCase().endsWith(".mp3")) {
    return { success: false, error: "Envie somente arquivos MP3." };
  }

  const storagePath = `musica-passes/${Date.now()}-${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
  const supabase = createServiceRoleClient();
  const { error } = await supabase.storage.from(AUDIO_BUCKET).upload(storagePath, await file.arrayBuffer(), {
    contentType: "audio/mpeg",
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const { data } = supabase.storage.from(AUDIO_BUCKET).getPublicUrl(storagePath);
  return { success: true, url: data.publicUrl };
}

export async function removeMusicaPasseAudio(audioUrl: string) {
  const marker = `/storage/v1/object/public/${AUDIO_BUCKET}/`;
  const path = audioUrl.split(marker)[1];
  if (!path) return;

  await createServiceRoleClient().storage.from(AUDIO_BUCKET).remove([decodeURIComponent(path)]);
}
