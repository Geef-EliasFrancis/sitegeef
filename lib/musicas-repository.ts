import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { Musica, MusicaParteTipo } from "@/lib/musicas";

/** Leitura composta do catálogo e suas partes, isolada do serviço de músicas. */
export async function fetchMusicasBase(): Promise<Musica[]> {
  const supabase = createServiceRoleClient();
  const [musicasResult, partesResult] = await Promise.all([
    supabase
      .from("musicas")
      .select("id, slug, titulo, autor, tom, versao, status, observacoes, youtube_url, audio_url, criado_em, atualizado_em")
      .order("titulo", { ascending: true }),
    supabase
      .from("musica_partes")
      .select("id, musica_id, ordem, tipo, titulo, conteudo, cifra, destaque")
      .order("musica_id", { ascending: true })
      .order("ordem", { ascending: true }),
  ]);

  const partesPorMusica = (partesResult.data ?? []).reduce<Record<string, Musica["partes"]>>((acc, parte) => {
    const musicaId = parte.musica_id as string;
    acc[musicaId] ??= [];
    acc[musicaId].push({
      id: parte.id,
      ordem: parte.ordem,
      tipo: parte.tipo as MusicaParteTipo,
      titulo: parte.titulo ?? "",
      conteudo: parte.conteudo ?? "",
      cifra: parte.cifra ?? undefined,
      destaque: parte.destaque ?? false,
    });
    return acc;
  }, {});

  return (musicasResult.data ?? []).map((musica) => ({
    ...musica,
    partes: partesPorMusica[musica.id] ?? [],
  })) as Musica[];
}

export async function getMusicaSlugById(id: string) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from("musicas").select("id, slug").eq("id", id).maybeSingle();
  return error || !data ? null : data.slug as string;
}

export async function saveMusicaRecord(input: {
  id: string;
  slug: string;
  titulo: string;
  autor: string;
  tom: string | null;
  versao: string | null;
  status: Musica["status"];
  observacoes: string | null;
  youtube_url: string | null;
  audio_url: string | null;
  partes: Musica["partes"];
}) {
  const supabase = createServiceRoleClient();
  const musicaPayload = {
    id: input.id,
    slug: input.slug,
    titulo: input.titulo,
    autor: input.autor,
    tom: input.tom,
    versao: input.versao,
    status: input.status,
    observacoes: input.observacoes,
    youtube_url: input.youtube_url,
    audio_url: input.audio_url,
  };
  const { error: musicaError } = await supabase.from("musicas").upsert(musicaPayload, { onConflict: "id" });
  if (musicaError) throw musicaError;

  await supabase.from("musica_partes").delete().eq("musica_id", input.id);
  if (input.partes.length > 0) {
    const { error } = await supabase.from("musica_partes").insert(input.partes.map((parte) => ({
      musica_id: input.id,
      ordem: parte.ordem,
      tipo: parte.tipo,
      titulo: parte.titulo || null,
      conteudo: parte.conteudo,
      cifra: parte.cifra || null,
      destaque: parte.destaque,
    })));
    if (error) throw error;
  }
}

export async function deleteMusicaRecord(id: string) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("musicas").delete().eq("id", id);
  if (error) throw error;
}
