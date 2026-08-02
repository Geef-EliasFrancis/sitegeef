import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function insertLgpdRecord(payload: Record<string, unknown>) {
  const { data, error } = await createServiceRoleClient().from("lgpd_registros").insert(payload).select("id").single();
  return { data: data as { id: string } | null, error };
}
