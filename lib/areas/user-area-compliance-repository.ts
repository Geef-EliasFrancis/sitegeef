import type { SupabaseClient } from "@supabase/supabase-js";

export async function loadUserAreaCompliance(supabase: SupabaseClient, pessoaId: string) {
  return Promise.all([
    supabase.from("servicos_voluntarios").select("*").eq("pessoa_id", pessoaId).eq("status", "ativo"),
    supabase.from("consentimentos_lgpd").select("*").eq("pessoa_id", pessoaId).eq("status", "ativo"),
    supabase.from("lgpd_solicitacoes").select("*").eq("pessoa_id", pessoaId).order("created_at", { ascending: false }).limit(8),
  ]);
}
