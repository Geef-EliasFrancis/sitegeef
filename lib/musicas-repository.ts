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
