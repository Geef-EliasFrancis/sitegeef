import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function listContatoMensagens() {
  const supabase = createServiceRoleClient();
  return supabase.from("contato_mensagens").select("*").order("criado_em", { ascending: false }).limit(60);
}
