import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function loadLgpdAdminRecords() {
  const supabase = createServiceRoleClient();
  return Promise.all([
    supabase.from("lgpd_registros").select("*").order("created_at", { ascending: false }).limit(40),
    supabase.from("lgpd_solicitacoes").select("*").order("created_at", { ascending: false }).limit(30),
    supabase.from("notificacoes").select("id, tipo, titulo, mensagem, canal, status, modulo_origem, criado_em, enviado_em").eq("modulo_origem", "lgpd").order("criado_em", { ascending: false }).limit(20),
    supabase.from("ops_events").select("id, source, level, message, payload, happened_at, created_at").or("source.ilike.%lgpd%,source.ilike.%documentos%").order("created_at", { ascending: false }).limit(30),
    supabase.from("consentimentos_lgpd").select("id, finalidade, base_legal, canal_autorizado, data_consentimento, data_revogacao, status, pessoas (nome, email)").order("data_consentimento", { ascending: false }).limit(25),
  ]);
}
