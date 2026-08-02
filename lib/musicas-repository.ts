import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { Musica, MusicaCredito, MusicaCreditoTipo, MusicaParteTipo, MusicaSessao, MusicaSessaoModo } from "@/lib/musicas";

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

const sessionFields = "id, codigo_pareamento, nome_tela, musica_id, modo, ativo, ultimo_acesso_em, criado_em, atualizado_em";

export async function listMusicaSessaoRecords(): Promise<MusicaSessao[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from("musica_sessoes").select(sessionFields).order("atualizado_em", { ascending: false });
  return error ? [] : ((data ?? []) as MusicaSessao[]);
}

export async function getMusicaSessaoRecord(codigo: string): Promise<MusicaSessao | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from("musica_sessoes").select(sessionFields).eq("codigo_pareamento", codigo).maybeSingle();
  return error || !data ? null : (data as MusicaSessao);
}

export async function saveMusicaSessaoRecord(input: {
  codigo_pareamento: string;
  nome_tela: string | null;
  musica_id: string | null;
  modo: MusicaSessaoModo;
  ativo: boolean;
  ultimo_acesso_em: string | null;
}) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from("musica_sessoes").upsert([input], { onConflict: "codigo_pareamento" }).select(sessionFields).single();
  if (error) throw error;
  return data as MusicaSessao;
}

export async function patchMusicaSessaoRecord(codigo: string, patch: Record<string, unknown>) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from("musica_sessoes").update(patch).eq("codigo_pareamento", codigo).select(sessionFields).maybeSingle();
  if (error) throw error;
  return data as MusicaSessao | null;
}

export async function deleteMusicaSessaoRecord(codigo: string) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("musica_sessoes").delete().eq("codigo_pareamento", codigo);
  if (error) throw error;
}

const creditoFields = "id, tipo, nome, criado_em, atualizado_em";

export async function listMusicaCreditoRecords(tipo: MusicaCreditoTipo, search = ""): Promise<MusicaCredito[]> {
  const supabase = createServiceRoleClient();
  let query = supabase.from("musica_creditos").select(creditoFields).eq("tipo", tipo).order("nome", { ascending: true });
  if (search.trim()) query = query.ilike("nome", `%${search.trim()}%`);
  const { data, error } = await query;
  return error ? [] : ((data ?? []) as MusicaCredito[]);
}

export async function getMusicaCreditoRecord(tipo: MusicaCreditoTipo, id: string): Promise<MusicaCredito | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from("musica_creditos").select(creditoFields).eq("tipo", tipo).eq("id", id).maybeSingle();
  return error || !data ? null : (data as MusicaCredito);
}

export async function saveMusicaCreditoRecord(input: { id?: string; tipo: MusicaCreditoTipo; nome: string }) {
  const supabase = createServiceRoleClient();
  const id = input.id ?? crypto.randomUUID();
  const { error } = await supabase.from("musica_creditos").upsert({ id, tipo: input.tipo, nome: input.nome.trim() }, { onConflict: "id" });
  if (error) throw error;
  return getMusicaCreditoRecord(input.tipo, id);
}

export async function deleteMusicaCreditoRecord(tipo: MusicaCreditoTipo, id: string) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("musica_creditos").delete().eq("id", id).eq("tipo", tipo);
  if (error) throw error;
}
