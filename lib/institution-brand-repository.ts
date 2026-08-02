import { createServiceRoleClient } from "@/lib/supabase/service-role";

export function getInstitutionBrandRecord() {
  return createServiceRoleClient().from("instituicao").select("*").order("criado_em", { ascending: true }).limit(1).maybeSingle();
}
