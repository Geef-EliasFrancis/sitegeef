import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function listPublishedEscalasFromCurrentYear(currentYear: number) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.GEEF_SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  if (!serviceRoleKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");

  const supabase = createSupabaseClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  return supabase.from("escalas_mensais").select(`
    id, ano, mes, status,
    reunioes (
      id, data,
      escala_funcoes (id, funcao_id, pessoa_id, substituto_id, funcoes (nome), pessoas (nome), substitutos:pessoas!substituto_id (nome)),
      escala_passe (id, pessoa_id, posicao, pessoas (nome)),
      escala_evangelizacao (id, pessoa_id, tema_id, tema_livre, turma, pessoas (nome), temas_doutrinarios (titulo)),
      escala_palestras (id, expositor_id, tema_id, tema_livre, cidade_origem, tipo_palestra, expositores:pessoas (nome), temas_doutrinarios (titulo))
    )
  `).eq("status", "publicada").gte("ano", currentYear).order("ano", { ascending: true }).order("mes", { ascending: true });
}
