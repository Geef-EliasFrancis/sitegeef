import type { SupabaseClient } from "@supabase/supabase-js";

type PublicacaoInput = { titulo: string; tipo?: string; conteudo?: string; autor_id: string };
type PublicacaoUpdate = { titulo?: string; tipo?: string; conteudo?: string; status?: string };

export function listPublicacoes(supabase: SupabaseClient, status?: string) {
  let query = supabase.from("publicacoes").select("*, autor:pessoas (nome)").order("criado_em", { ascending: false });
  if (status) query = query.eq("status", status);
  return query;
}

export function getPublicacao(supabase: SupabaseClient, id: string) {
  return supabase.from("publicacoes").select("*, autor:pessoas (id, nome)").eq("id", id).single();
}

export function insertPublicacao(supabase: SupabaseClient, input: PublicacaoInput) {
  return supabase.from("publicacoes").insert([{ ...input, status: "rascunho" }]).select().single();
}

export function updatePublicacaoRecord(supabase: SupabaseClient, id: string, input: PublicacaoUpdate) {
  const payload = { ...input, ...(input.status === "publicado" ? { publicado_em: new Date().toISOString() } : {}) };
  return supabase.from("publicacoes").update(payload).eq("id", id);
}

export function deletePublicacaoRecord(supabase: SupabaseClient, id: string) {
  return supabase.from("publicacoes").delete().eq("id", id);
}

export function listPessoasDisponiveis(supabase: SupabaseClient) {
  return supabase.from("pessoas").select("id, nome").eq("status", "ativo").order("nome");
}
